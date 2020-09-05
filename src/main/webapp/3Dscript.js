import {OrbitControls} from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
import {GUI} from 'https://threejs.org/examples/jsm/libs/dat.gui.module.js';
/**
* A Point object with a lat and lng.
* @typedef {Object<number, number, number>} Point
* @property {number} lat The lat of the point.
* @property {number} lng The lng of the point.
* @property {number} alt The alt of the point.
*/
// These are global objects.
/**
 * @typedef {Array<number, number>}
 * @property {Array<Point>} data All the stored run data for a given runId
 * @property {string} color The color in a standard HTML acceptable format
 */
let runs;
// Overall Threejs objects, may be helpful to condense into one Object.
let scene;
let camera;
let renderer;
let clock;
let controls;

const color = new THREE.Color();

/*  Keep track of indices of trajectory wanted to be viewed. */
const poseStartIndex = {start: 0};
const poseEndIndex = {end: Number.MAX_VALUE};

/* Timestamp search object. */
const timeStart = {time: 'search for timestamp'};

// Likely need to make a separate pose transform for each runId;
const runIdToTransforms = {};
// poseTransforms indexed by runId;
const defaultTransform = {
  /* Unit: 4 meters*/ translateX: 0,
  /* Unit: 4 meters*/ translateZ: 0,
  /* Unit: degrees*/ rotate: 0,
  /* Scalar*/ scale: 1,
};
// The runId of the current run being modified, bound to gui.
const currentId = {};

const apiKey = 'AIzaSyDCgKca9sLuoQ9xQDfHUvZf1_KAv06SoTU';
let poseOrigin;

/* Matrices used to scale and unscale pose cylinders */
const scaleCylinder = 2;
const scaleMatrix = new THREE.Matrix4().makeScale(
    scaleCylinder, scaleCylinder, scaleCylinder );
const scaleInverseMatrix = new THREE.Matrix4().makeScale(
    1/scaleCylinder, 1/scaleCylinder, 1/scaleCylinder );

/* Index of last selected point to view. */
let selectedIndex= -1;
let selectedRun = '';

/* For hiding trajectory. */
const scaleHide = 400;
const zeroMatrix = new THREE.Matrix4().makeScale(
    1/scaleHide, 1/scaleHide, 1/scaleHide );
const nonZeroMatrix = new THREE.Matrix4().makeScale(
    scaleHide, scaleHide, scaleHide);

/*  Datapoint time interface on gui. */
let time;
/*  Datapoint lat interface on gui. */
let lat;
/*  Datapoint lng interface on gui. */
let lng;
/*  Datapoint alt interface on gui. */
let alt;
/*  Datapoint roll interface on gui. */
let roll;
/*  Datapoint yaw interface on gui. */
let yaw;
/*  Datapoint pitch interface on gui. */
let pitch;

let maxLength=-1;

initThreeJs();
animate();

/**
 * Initializes the essential three.js 3D components then fetchs the pose data.
 */
function initThreeJs() {
  scene = new THREE.Scene();
  makeCamera();

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  clock = new THREE.Clock();
  controls = new OrbitControls(camera, renderer.domElement);
  // Add the light to the scene.
  const light = new THREE.PointLight(0xffffff, 1, 0);
  light.position.set(0, 100, 0);
  scene.add(light);
}

/**
* Makes camera.
 */
function makeCamera() {
  /*  Called in fetch data. */
  camera = new THREE.PerspectiveCamera(
      /* fov =*/ 75,
      /* aspectRatio =*/ window.innerWidth / window.innerHeight,
      /* nearFrustum =*/.1,
      /* farFrustum =*/ 1000);
  camera.position.set(0, 1, 1);
  fetchData();
}
/**
 * Plot the map centered around this run's first coordinate.
 * @param {Array<Point>} pose
 */
function initMap(pose) {
  // Creates the 2D map.
  const loader = new THREE.TextureLoader();
  console.log('Map initialized at lat: ' + pose[0].lat + ' lng ' + pose[0].lng);
  const material = new THREE.MeshLambertMaterial({
    map: loader.load(
        'https://maps.googleapis.com/maps/api/staticmap' +
      '?format=png&center=' + pose[0].lat + ',' + pose[0].lng +
      '&zoom=18&size=500x500&key=' + apiKey),
  });
  const geometry = new THREE.PlaneGeometry(50, 50);
  const map = new THREE.Mesh(geometry, material);
  map.position.set(0, -4, 0);
  map.rotation.x = -Math.PI / 2;
  scene.add(map);
}

/**
 * Creates the 2D terrain and points a light at it. It also calls two other
 * functions so it can wait on the fetch request and significantly cut down
 * rendering time with geometry instancing.
 * @param {number} runId
 * @param {Array<Point>} poseToPlot
 * @param {string} hexColor
*/
function addPoseData(runId, poseToPlot, hexColor) {
  plotTrajectory(runId, poseToPlot);

  // Adds pose data to the scene as one Geometry instance.
  const material = new THREE.MeshBasicMaterial({color: hexColor});
  const geometry = new THREE.CylinderBufferGeometry(.005, .005, .1);
  const orientation = new THREE.InstancedMesh(geometry,
      material, poseToPlot.length);
  orientation.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  runs[runId].orientation = orientation;
  runs[runId].data = poseToPlot;

  /* Add all other necessary run info.  */
  runs[runId].length = poseToPlot.length;
  if (maxLength < runs[runId].length) {
    maxLength = runs[runId].length;
  }
  runs[runId]. oldStart =-1;
  runs[runId].oldEnd = poseToPlot.length;
  runs[runId].currentStart = 0;
  runs[runId].currentEnd = Number.MAX_VALUE;

  scene.add(orientation);
  plotOrientation(runId);
}

/**
 * Converts lla coordinates to local world coordinates.
 * @param {number} runId The given run's id.
 * @param {Point} origin The run to center the data around.
 * @param {number} lat Latitude in degrees.
 * @param {number} lng Longitude in degrees.
 * @param {number} alt Altitude in meters.
 * @return {Array<number, number, number>} An array returning gps coordinates.
 */
function llaDegreeToLocal(runId, origin, lat, lng, alt) {
  /**
   * Subtracting each point by the first point starts the pose at coordinates
   * (0, 0, 0). Each unit in the 3D scene is 4 meters while the 6th decimal
   * point in GPS coordinates represents .11 meters. This is why we multiple the
   * lat/lng by 25000, an increment in the 6th decimal place equates to a 0.025
   * unit change in our 3D space. Since altitude is already represented in
   * meters, we simply divide by 4 to adjust for our 1:4 unit ratio.
   */
  const x = (lng - origin.lng) * 25000 * runIdToTransforms[runId].scale;
  const y = (alt - origin.alt) / 4;
  const z = (lat - origin.lat) * 25000 * -runIdToTransforms[runId].scale;
  return [x, y, z];
}
/**
 * This uses the pose data to create a blue line representing the pose
 * trajectory.
 * @param {number} runId
 * @param {Array<Point>} pose
 */
function plotTrajectory(runId, pose) {
  if (runs[runId].trajectory !== undefined) {
    scene.remove(runs[runId].trajectory);
  }
  /**
   * The x axis controls the left and right direction, the y axis controls up
   * and down movement, and the z axis controls forward and back movement.
   */
  const coordinates = [];
  for (const point of pose) {
    const [x, y, z] = llaDegreeToLocal(runId, poseOrigin,
        point.lat, point.lng, point.alt);

    coordinates.push(new THREE.Vector3(x, y, z));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(coordinates);
  const material = new THREE.LineBasicMaterial({color: 'black'});
  const trajectory = new THREE.Line(geometry, material);
  runs[runId].trajectory = trajectory;
  scene.add(trajectory);
  trajectory.position.x = runIdToTransforms[runId].translateX;
  trajectory.position.z = runIdToTransforms[runId].translateZ;
  trajectory.rotation.y = THREE.Math.degToRad(runIdToTransforms[runId].rotate);
}

/**
 * This uses the pose data to create a blue line representing partial pose
 * trajectory.
 * @param {int} start beginning index, inclusive.
 * @param {int} end end index, exclusive.
 */
function plotPartialPath(start, end) {
  console.log('in plotpartial path');
  selectedRun= currentId.value;
  // Removes any existing trajectory objects for repositioning.
  if (runs[selectedRun].trajectory !== undefined) {
    scene.remove(runs[selectedRun].trajectory);
  }
  /**
   * The x axis controls the left and right direction, the y axis controls
   * up and down movement, and the z axis controls forward and back movement.
   */
  const coordinates=[];
  for (let i= start; i < end; i++) {
    const [x, y, z] = llaDegreeToLocal(selectedRun, poseOrigin,
        runs[selectedRun].data[i].lat, runs[selectedRun].data[i].lng,
        runs[selectedRun].data[i].alt);
    coordinates.push(new THREE.Vector3(x, y, z));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(coordinates);
  const material = new THREE.LineBasicMaterial({color: 'black'});
  runs[selectedRun].trajectory = new THREE.Line(geometry, material);
  scene.add(runs[selectedRun].trajectory);
  runs[selectedRun].trajectory.position.x =
  runIdToTransforms[selectedRun].translateX;
  runs[selectedRun].trajectory.position.z =
  runIdToTransforms[selectedRun].translateZ;
  runs[selectedRun].trajectory.rotation.y =
  THREE.Math.degToRad(runIdToTransforms[selectedRun].rotate);
}


/**
* This repositions all children the orientation object. The object is a
 * geometry instance, initializing the object with one geometry call rather than
 * the number of data points. (O(1) vs. O(N))
 * @param {number} runId
 */
function plotOrientation(runId) {
  const pose = runs[runId].data;
  const orientation = runs[runId].orientation;
  for (const point of pose) {
    /**
     * Matrix is a 4x4 matrix used to translate and rotate each instance
     * of the pose orientation locally instead using the world transform.
     * This means it will rotate relative to the position of the matrix,
     * not the center of the 3D scene.
     */
    const matrix = new THREE.Matrix4();
    const [x, y, z] = llaDegreeToLocal(runId, poseOrigin,
        point.lat, point.lng, point.alt);

    matrix.makeTranslation(x, y, z);
    matrix.multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    matrix.multiply(new THREE.Matrix4().makeRotationX(
        THREE.Math.degToRad(point.pitchDeg)));
    matrix.multiply(new THREE.Matrix4().makeRotationZ(
        THREE.Math.degToRad(point.yawDeg)));
    matrix.multiply(new THREE.Matrix4().makeRotationY(
        THREE.Math.degToRad(point.rollDeg)));
    matrix.multiply(new THREE.Matrix4().makeTranslation(0.0, .05, 0.0));
    orientation.setMatrixAt(pose.indexOf(point), matrix);
    orientation.setColorAt( pose.indexOf(point), color );
  }
  orientation.instanceMatrix.needsUpdate = true;
  orientation.position.x = runIdToTransforms[runId].translateX;
  orientation.position.z = runIdToTransforms[runId].translateZ;
  orientation.rotation.y = THREE.Math.degToRad(runIdToTransforms[runId].rotate);
}

/**
* Does matrix multiplication on specific index of the direction matrix.
* @param {object} multiplicand matrix to multiply by.
* @param {int} index of point to change.
* @param {object} object mesh to get point from
*/
function multiplyInstanceMatrixAtIndex(multiplicand, index, object) {
  /* Temp matrices used for matrix multiplication. */
  const instanceMatrix = new THREE.Matrix4();
  const matrix = new THREE.Matrix4();

  object.getMatrixAt(index, instanceMatrix );
  matrix.multiplyMatrices( instanceMatrix, multiplicand );
  object.setMatrixAt( index, matrix );
  object.instanceMatrix.needsUpdate = true;
}

/**
* Updates GUI with specific point information.
* @param {int} index index of point.
*/
function displayPointValues( index) {
  time.setValue(runs[selectedRun].data[index].gpsTimestamp);
  lat.setValue(runs[selectedRun].data[index].lat);
  lng.setValue(runs[selectedRun].data[index].alt);
  alt.setValue(runs[selectedRun].data[index].alt);
  yaw.setValue(runs[selectedRun].data[index].yawDeg);
  roll.setValue(runs[selectedRun].data[index].rollDeg);
  pitch.setValue(runs[selectedRun].data[index].pitchDeg);
}

/**
* Hides end of trajectory based on user selected point.
 */
function hideOrientation() {
  selectedRun = currentId.value;
  runs[selectedRun].start= poseStartIndex.start;
  runs[selectedRun].end = poseEndIndex.end;

  if (runs[selectedRun].start >= runs[selectedRun].end) {
    return;
  }

  const min = Math.min(runs[selectedRun].end, runs[selectedRun].length);
  plotPartialPath(selectedRun, runs[selectedRun].start, min);
  for (let i= 0; i<= runs[selectedRun].oldStart; i++) {
    multiplyInstanceMatrixAtIndex(
        nonZeroMatrix, i, runs[selectedRun].orientation);
  }
  for (let i= 0; i<= runs[selectedRun].start; i++) {
    multiplyInstanceMatrixAtIndex(zeroMatrix, i, runs[selectedRun].orientation);
  }

  for (let i= runs[selectedRun].length-1; i>runs[selectedRun].oldEnd; i--) {
    multiplyInstanceMatrixAtIndex(
        nonZeroMatrix, i, runs[selectedRun].orientation);
  }
  for (let i= runs[selectedRun].length-1; i> runs[selectedRun].end; i--) {
    multiplyInstanceMatrixAtIndex(zeroMatrix, i, runs[selectedRun].orientation);
  }

  /* Update oldentries. */
  runs[selectedRun].oldEnd = runs[selectedRun].end;
  runs[selectedRun].oldStart = runs[selectedRun].start;
}

/**
 * This function initializes gui allowing the user to manipulate the pose
 * objects.
 */
function loadGui() {
  // Need a way to select which pose run to make this change to and pass this
  // parameter.
  const runId = currentId.value;

  const gui = new GUI();

  let currentData = runs[runId].data;
  // On change of selected runId, update the given dataset to use;
  gui.add(currentId, 'value', Object.keys(runs)).onFinishChange(
      () => {
        currentData = runs[currentId.value].data;
      });

  gui.add(runIdToTransforms[currentId.value], 'rotate', 0, 360, 1)
      .onChange(() => {
        console.log('changed'); plotOrientation(currentId.value);
      })
      .onFinishChange(() => {
        console.log(currentId.value);
        plotTrajectory(currentId.value, currentData);
      })
      .name('Pose Rotation (degrees)');

  gui.add(runIdToTransforms[currentId.value], 'translateX', -10, 10, .025)
      .onChange(() => plotOrientation(currentId.value))
      .onFinishChange(() => plotTrajectory(currentId.value, currentData))
      .name('X Axis Translation');
  gui.add(runIdToTransforms[currentId.value], 'translateZ', -10, 10, .025)
      .onChange(() => plotOrientation(currentId.value))
      .onFinishChange(() => plotTrajectory(currentId.value, currentData))
      .name('Z Axis Translation');
  gui.add(runIdToTransforms[currentId.value], 'scale', .5, 2, .25)
      .onChange(() => plotOrientation(currentId.value))
      .onFinishChange(() => plotTrajectory(currentId.value, currentData))
      .name('Pose Scale Multiplier');


  /* Adds index of point manipulation to maxgui. */
  const max = maxLength;

  gui.add(poseStartIndex, 'start', 0, max, 1)
      .onFinishChange(hideOrientation);

  gui.add(poseEndIndex, 'end', 0, max, 1)
      .onFinishChange(hideOrientation);

  /* Time value. */
  time = gui.add(timeStart, 'time').
      onFinishChange(()=>findTime(currentId.value));
  /* Lat value. */
  const latStart= {lat: ''};
  lat = gui.add(latStart, 'lat');
  /* lng value. */
  const lngStart = {lng: ''};
  lng = gui.add(lngStart, 'lng');
  /* Alt value. */
  const altStart = {alt: ''};
  alt = gui.add(altStart, 'alt');
  /* Yaw value. */
  const yawStart= {yaw: ''};
  yaw = gui.add(yawStart, 'yaw');
  /* Pitch value. */
  const pitchStart= {pitch: ''};
  pitch = gui.add(pitchStart, 'pitch');
  /* Roll value. */
  const rollStart = {roll: ''};
  roll = gui.add(rollStart, 'roll');
}

/**
* Updates time gui to show if time typed in is found or not.
* @param {String} runId name of runid
*/
function findTime(runId) {
  let found = false;
  const value = time.getValue();
  console.log(value);
  let start =0;
  let end = runs[runId].length-1;
  // Iterate while start not meets end using binary search.
  while (start<=end && !found) {
    // Find the mid index.
    const mid=Math.floor((start + end)/2);

    // If element is present at mid,  show its info.
    if (runs[runId].data[mid].gpsTimestamp==value) {
      unselectCylinder();
      selectedIndex = mid;
      selectedRun = runId;
      selectCylinder();
      displayPointValues(mid);
      found= true;
    } else if (runs[runId].data[mid].gpsTimestamp < value) {
      start = mid + 1;
    } else {
      end = mid - 1;
    }
  }
  if (!found) {
    time.setValue('no time found');
  }
}

/**
 * This is the animation loop which continually updates the scene. It allows the
 * movement of objects to be seen on screen and the camera to be moved in
 * accordance to the controls.
 */
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  controls.update(delta);
  renderer.render(scene, camera);
};

/**
* What to do on mouse click.
* @param {event} event event.
 */
function onClick(event) {
  /* If a cylinder was the previous thing clicked, unscale it. */
  if (selectedIndex!= -1) {
    unselectCylinder();
  }
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  event.preventDefault();

  /* Mouse coodinates for when renderer is the whole window. */
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  /* Get array of objects intersected by raycaster. */
  raycaster.setFromCamera( mouse, camera );
  const intersects = raycaster.intersectObjects(scene.children, true);

  /* highlight first instance intersected and show properties of point. */
  for (let i=0; i < intersects.length; i++) {
    if ( intersects[i].object.geometry.type == 'CylinderBufferGeometry' ) {
      selectedIndex = intersects[i].instanceId;
      selectedRun = currentId.value;
      selectCylinder();
      break;
    }
  }
}

/** Brings back cylinder at selected Index back to original size and color. */
function unselectCylinder() {
  const orientation = runs[selectedRun].orientation;
  // Scale down to regular size.
  multiplyInstanceMatrixAtIndex(
      scaleInverseMatrix, selectedIndex, orientation);

  // Turn color back to red.
  const originalColor = runs[selectedRun].color;
  const colorToSet = new THREE.Color(originalColor);
  orientation.setColorAt( selectedIndex, colorToSet);
  orientation.instanceColor.needsUpdate = true;

  selectedIndex = -1;
}

/** Enlarges and changes color of cylinder at selected index. */
function selectCylinder() {
  const orientation = runs[selectedRun].orientation;
  // Set color to green.
  orientation.setColorAt( selectedIndex, color.setHex(0x00ff00));
  orientation.instanceColor.needsUpdate = true;

  // Enlarge cylinder.
  multiplyInstanceMatrixAtIndex(scaleMatrix, selectedIndex, orientation);
  displayPointValues(selectedIndex);
}

window.addEventListener('click', onClick);

/**
 * This function fetchs pose data from the RunInfo servlet,
 * it is an asynchronous call requiring addMap() to be
 * called after the data is fully loaded.
 * Get the necessary data from sessionStorage and load page contents.
 */
function fetchData() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const isSubSection = urlParams.get('subsection');

  let firstData;
  if (isSubSection) {
    runs = JSON.parse(sessionStorage.getItem('subsection'));
    firstData = Object.values(runs)[0].data;
    poseOrigin = firstData[0];
    currentId.value = Object.keys(runs)[0];

    {
      // Initialize the transforms for each run.
      Object.keys(runs).forEach(
          (currentKey) => runIdToTransforms[currentKey] = defaultTransform);
      // Render the different runs.
      const runsIterable = Object.entries(runs);
      for (const [runId, currentObject] of runsIterable) {
        addPoseData(runId, currentObject.data, currentObject.color);
      }
    }
  } else {
    console.log('Invalid input format provided');
  }
  loadGui();
  initMap(firstData);
}


