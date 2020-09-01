// import {FlyControls} from 'https://threejs.org/examples/jsm/controls/FlyControls.js';
import {OrbitControls} from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
import {GUI} from 'https://threejs.org/examples/jsm/libs/dat.gui.module.js';

// These are global objects.
let scene;
let camera;
let renderer;
let clock;
let controls;
let orientation;
let trajectory;
let pose;
let poseLength;
const color = new THREE.Color();
const poseTransform = {
  /* Unit: 4 meters*/ translateX: 0,
  /* Unit: 4 meters*/ translateZ: 0,
  /* Unit: degrees*/ rotate: 0,
  /* Scalar*/ scale: 1};

/* variables used to keep track of indices of trajectory wanted to be viewed. */
const poseStartIndex = {start: 0};
const poseEndIndex = {end: Number.MAX_VALUE};

/* Last indices to be picked for boundaries of a partial trajectory. */
let oldStart=-1;
let oldEnd;


const apiKey = 'AIzaSyDCgKca9sLuoQ9xQDfHUvZf1_KAv06SoTU';

/* Matrices used to scale and unscale pose cylinders */
const scaleCylinder = 2;
const scaleMatrix = new THREE.Matrix4().makeScale(
    scaleCylinder, scaleCylinder, scaleCylinder );
const scaleInverseMatrix = new THREE.Matrix4().makeScale(
    1/scaleCylinder, 1/scaleCylinder, 1/scaleCylinder );

/* Index of last selected point to view. */
let selectedIndex= -1;

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


initThreeJs();
animate();

/**
 * Initializes the essential three.js 3D components then fetchs
 * the pose data.
 */
function initThreeJs() {
  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  clock = new THREE.Clock();
  fetchData();
  // The camera controls allows the user to fly with the camera.
  controls = new OrbitControls(camera, renderer.domElement );
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
}

/**
 * Creates the 2D terrain and points a light at it.
 * It also calls two other functions so it can wait on the fetch
 * request and significantly cut down rendering time with
 * geometry instancing.
*/
function addMap() {
  // Creates the 2D map.
  const loader = new THREE.TextureLoader();
  let material = new THREE.MeshLambertMaterial({
    map: loader.load(
        'https://maps.googleapis.com/maps/api/staticmap' +
      '?format=png&center=' + pose[0].lat + ',' + pose[0].lng +
      '&zoom=18&size=500x500&key=' + apiKey),
  });
  let geometry = new THREE.PlaneGeometry(50, 50);
  const map = new THREE.Mesh(geometry, material);
  map.position.set(0, -4, 0);
  map.rotation.x = -Math.PI / 2;
  scene.add(map);

  // Add the light to the scene.
  const light = new THREE.PointLight(0xffffff, 1, 0);
  light.position.set(0, 100, 0);
  scene.add(light);
  plotTrajectory();

  // Adds pose data to the scene as one Geometry instance.
  material = new THREE.MeshBasicMaterial({color: 'red'});
  geometry = new THREE.CylinderBufferGeometry(.005, .005, .1);
  orientation = new THREE.InstancedMesh(geometry, material, pose.length);
  orientation.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(orientation);
  plotOrientation();
}

/**
 * Converts lla coordinates to local world coordinates.
 * @param {double} lat Latitude in degrees.
 * @param {double} lng Longitude in degrees.
 * @param {double} alt Altitude in meters.
 * @return {array} An array returning gps coordinates.
 */
function llaDegreeToLocal(lat, lng, alt) {
  /**
   * Subtracting each point by the first point starts the pose
   * at coordinates (0, 0, 0). Each unit in the 3D scene is 4
   * meters while the 6th decimal point in GPS coordinates represents
   * .11 meters. This is why we multiple the lat/lng by 25000, an
   * increment in the 6th decimal place equates to a 0.025 unit
   * change in our 3D space. Since altitude is already represented in
   * meters, we simply divide by 4 to adjust for our 1:4 unit ratio.
   */
  const x = (lng - pose[0].lng) * 25000 * poseTransform.scale;
  const y = (alt - pose[0].alt) / 4;
  const z = (lat - pose[0].lat) * 25000 * -poseTransform.scale;
  return [x, y, z];
}
/**
 * This uses the pose data to create a blue line representing the pose
 * trajectory.
 */
function plotTrajectory() {
  // Removes any existing trajectory objects for repositioning.
  scene.remove(trajectory);
  /**
   * The x axis controls the left and right direction, the y axis controls
   * up and down movement, and the z axis controls forward and back movement.
   */
  const coordinates=[];
  for (const point of pose) {
    const [x, y, z] = llaDegreeToLocal(point.lat, point.lng, point.alt);
    coordinates.push(new THREE.Vector3(x, y, z));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(coordinates);
  const material = new THREE.LineBasicMaterial({color: 'blue'});
  trajectory = new THREE.Line(geometry, material);
  scene.add(trajectory);
  trajectory.position.x = poseTransform.translateX;
  trajectory.position.z = poseTransform.translateZ;
  trajectory.rotation.y = THREE.Math.degToRad(poseTransform.rotate);
}

/**
 * This uses the pose data to create a blue line representing partial pose
 * trajectory.
 * @param {int} start beginning index, inclusive.
 * @param {int} end end index, exclusive.
 */
function plotPartialPath(start, end) {
  // Removes any existing trajectory objects for repositioning.
  scene.remove(trajectory);
  /**
   * The x axis controls the left and right direction, the y axis controls
   * up and down movement, and the z axis controls forward and back movement.
   */
  const coordinates=[];
  for (let i= start; i < end; i++) {
    const [x, y, z] = llaDegreeToLocal(pose[i].lat, pose[i].lng, pose[i].alt);
    coordinates.push(new THREE.Vector3(x, y, z));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(coordinates);
  const material = new THREE.LineBasicMaterial({color: 'blue'});
  trajectory = new THREE.Line(geometry, material);
  scene.add(trajectory);
  trajectory.position.x = poseTransform.translateX;
  trajectory.position.z = poseTransform.translateZ;
  trajectory.rotation.y = THREE.Math.degToRad(poseTransform.rotate);
}

/**
 * This repositions all children the orientation object. The object
 * is a geometry instance, initializing the object with one geometry
 * call rather than the number of data points. (O(1) vs. O(N))
 */
function plotOrientation() {
  for (const point of pose) {
    /**
     * Matrix is a 4x4 matrix used to translate and rotate each instance
     * of the pose orientation locally instead using the world transform.
     * This means it will rotate relative to the position of the matrix,
     * not the center of the 3D scene.
     */
    const matrix = new THREE.Matrix4();
    const [x, y, z] = llaDegreeToLocal(point.lat, point.lng, point.alt);

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
  orientation.position.x = poseTransform.translateX;
  orientation.position.z = poseTransform.translateZ;
  orientation.rotation.y = THREE.Math.degToRad(poseTransform.rotate);
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
function displayPointValues(index) {
  time.setValue(pose[index].gpsTimestamp);
  lat.setValue(pose[index].lat);
  lng.setValue(pose[index].alt);
  alt.setValue(pose[index].alt);
  yaw.setValue(pose[index].yawDeg);
  roll.setValue(pose[index].rollDeg);
  pitch.setValue(pose[index].pitchDeg);
}

/**
* Hides end of trajectory based on user selected point.
 */
function hideOrientation() {
  if (poseStartIndex.start >= poseEndIndex.end) {
    return;
  }

  const min = Math.min(poseEndIndex.end, poseLength);
  plotPartialPath(poseStartIndex.start, min);
  for (let i= 0; i<= oldStart; i++) {
    multiplyInstanceMatrixAtIndex(nonZeroMatrix, i, orientation);
  }
  for (let i= 0; i<= poseStartIndex.start; i++) {
    multiplyInstanceMatrixAtIndex(zeroMatrix, i, orientation);
  }

  for (let i= poseLength-1; i>oldEnd; i--) {
    multiplyInstanceMatrixAtIndex(nonZeroMatrix, i, orientation);
  }
  for (let i= poseLength-1; i> poseEndIndex.end; i--) {
    multiplyInstanceMatrixAtIndex(zeroMatrix, i, orientation);
  }

  /* Update oldentries. */
  oldEnd = poseEndIndex.end;
  oldStart = poseStartIndex.start;
}

/**
 * This function initializes gui allowing the user to manipulate the
 * pose objects.
 */
function makeGUI() {
  const gui = new GUI();
  gui.add(poseTransform, 'rotate', 0, 360, 1).onChange(plotOrientation)
      .onFinishChange(plotTrajectory)
      .name('Pose Rotation (degrees)');
  gui.add(poseTransform, 'translateX', -10, 10, .025)
      .onChange(plotOrientation)
      .onFinishChange(plotTrajectory).name('X Axis Translation');
  gui.add(poseTransform, 'translateZ', -10, 10, .025)
      .onChange(plotOrientation)
      .onFinishChange(plotTrajectory).name('Z Axis Translation');
  gui.add(poseTransform, 'scale', .5, 2, .25)
      .onChange(plotOrientation)
      .onFinishChange(plotTrajectory).name('Pose Scale Multiplier');

  /* Adds index of point manipulation to maxgui. */
  const max = poseLength;
  oldEnd=poseLength;
  gui.add(poseStartIndex, 'start', 0, max, 1)
      .onFinishChange(hideOrientation);

  gui.add(poseEndIndex, 'end', 0, max, 1)
      .onFinishChange(hideOrientation);

  /* Time value. */
  const timeStart = {time: ''};
  time = gui.add(timeStart, 'time');
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
 * This is the animation loop which continually updates the scene.
 * It allows the movement of objects to be seen on screen and the camera
 * to be moved in accordance to the controls.
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
    // Scale down to regular size
    multiplyInstanceMatrixAtIndex(
        scaleInverseMatrix, selectedIndex, orientation);

    // TODO: Turn color back to red
    orientation.setColorAt( selectedIndex, color.setHex(0xff0000));
    orientation.instanceColor.needsUpdate = true;

    selectedIndex= -1;
  }
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  event.preventDefault();

  /* Mouse coodinates for when renderer is the whole window. */
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  /* Get array of objects intersected by raycaster */
  raycaster.setFromCamera( mouse, camera );
  const intersects = raycaster.intersectObjects(scene.children, true);

  /* highlight first instance intersected and show properties of point. */
  for (let i=0; i < intersects.length; i++) {
    if ( intersects[i].object.geometry.type == 'CylinderBufferGeometry' ) {
      selectedIndex = intersects[i].instanceId;

      // Set color to green.
      orientation.setColorAt( selectedIndex, color.setHex(0x0ff00));
      orientation.instanceColor.needsUpdate = true;

      // Enlarge cylinder
      multiplyInstanceMatrixAtIndex(scaleMatrix, selectedIndex, orientation);
      displayPointValues(selectedIndex);

      break;
    }
  }
}

window.addEventListener('click', onClick);

/**
 * This function fetchs pose data from the RunInfo servlet,
 * it is an asynchronous call requiring addMap() to be
 * called after the data is fully loaded.
 */
function fetchData() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const id = urlParams.get('id');
  const type = urlParams.get('dataType');

  makeCamera();
  // Only need to refetch the data if it is not contained in local storage, in
  // general it should be.
  const isStored = urlParams.get('stored');
  const subSectionNumber = urlParams.get('subSection');
  if (isStored) {
    pose = JSON.parse(sessionStorage.getItem(id + '_' +
      type + '_' + subSectionNumber));
    addMap();
  } else {
    fetch('/getrun?id=' + id + '&dataType=' + type)
        .then((response) => response.json())
        .then((data) => pose = data).then(()=> poseLength= pose.length)
        .then(() => {
          addMap(); makeGUI();
        },
        );
  }
}
