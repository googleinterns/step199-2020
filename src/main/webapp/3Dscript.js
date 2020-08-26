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
const poseTransform = {
  /* Unit: 4 meters*/ translateX: 0,
  /* Unit: 4 meters*/ translateZ: 0,
  /* Unit: degrees*/ rotate: 0,
  /* Scalar*/ scale: 1};

const poseStart = {start: 0};
const poseEnd = {end: 10000};

const apiKey = 'AIzaSyDCgKca9sLuoQ9xQDfHUvZf1_KAv06SoTU';

/* Matrices used to scale and unscale pose cylinders */
const scaleCylinder = 2;
const scaleMatrix = new THREE.Matrix4().makeScale(
    scaleCylinder, scaleCylinder, scaleCylinder );
const scaleInverseMatrix = new THREE.Matrix4().makeScale(
    1/scaleCylinder, 1/scaleCylinder, 1/scaleCylinder );

let oldIndex= -1;

/* For hiding trajectory. */
const scaleHide = 400;
const zeroMatrix = new THREE.Matrix4().makeScale(
    1/scaleHide, 1/scaleHide, 1/scaleHide );
const nonZeroMatrix = new THREE.Matrix4().makeScale(
    scaleHide, scaleHide, scaleHide);

let oldStart=0;
let oldEnd;

const instanceMatrix = new THREE.Matrix4();
const matrix = new THREE.Matrix4();


initThreeJs();
makeGUI();
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
  const light = new THREE.PointLight(0xffffff, 1, 0 );
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
  const y = (alt - pose[0].alt)/4;
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
  for (point of pose) {
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
 * @param {int} index beginning index.
 * @param {int} end end index.
 */
function plotPartialPath(index, end) {
  // Removes any existing trajectory objects for repositioning.
  scene.remove(trajectory);
  /**
   * The x axis controls the left and right direction, the y axis controls
   * up and down movement, and the z axis controls forward and back movement.
   */
  const coordinates=[];
  for (let increment= index; increment < end; increment++) {
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
 * This repositions all children the orientation object. The object
 * is a geometry instance, initializing the object with one geometry
 * call rather than the number of data points. (O(1) vs. O(N))
 */
function plotOrientation() {
  for (point of pose) {
    /**
     * Matrix is a 4x4 matrix used to translate and rotate each instance
     * of the pose orientation locally instead using the world transform.
     * This means it will rotate relative to the position of the matrix,
     * not the center of the 3D scene.
     */
    const matrix = new THREE.Matrix4();
    const [x, y, z] = llaDegreeToLocal(point.lat, point.lng, point.alt);

    matrix.makeTranslation(x, y, z);
    matrix.multiply(new THREE.Matrix4().makeRotationX(-Math.PI/2));
    matrix.multiply(new THREE.Matrix4().makeRotationX(
        THREE.Math.degToRad(point.pitchDeg)));
    matrix.multiply(new THREE.Matrix4().makeRotationZ(
        THREE.Math.degToRad(point.yawDeg)));
    matrix.multiply(new THREE.Matrix4().makeRotationY(
        THREE.Math.degToRad(point.rollDeg)));
    matrix.multiply(new THREE.Matrix4().makeTranslation(0.0, .05, 0.0));
    orientation.setMatrixAt(i, matrix);
  }
  orientation.instanceMatrix.needsUpdate = true;
  orientation.position.x = poseTransform.translateX;
  orientation.position.z = poseTransform.translateZ;
  orientation.rotation.y = THREE.Math.degToRad(poseTransform.rotate);
}

let time;
let lat;
let long;
let alt;
let roll;
let yaw;
let pitch;

/**
* get time in readable units
* @param {double} time raw time.
* @return {String} readable time.
 */
function timeConverted(time) {
  const unixTimestamp = time;
  // Create a new JavaScript Date object based on the timestamp
  // multiplied by 1000 so that the argument is in milliseconds, not seconds.
  const date = new Date(unixTimestamp * 1000);
  // Hours part from the timestamp
  const hours = date.getHours();
  // Minutes part from the timestamp
  const minutes = '0' + date.getMinutes();
  // Seconds part from the timestamp
  const seconds = '0' + date.getSeconds();

  // Will display time in 10:30:23 format
  const formattedTime = hours + ':' +
   minutes.substr(-2) + ':' + seconds.substr(-2);
  return formattedTime;
}

/**
* Does matrix multiplication on specific index of the direction matrix.
* @param {object} typeOfMatrix matrix to multiply by.
* @param {int} index  of point to change.
*/
function changeMatrix(typeOfMatrix, index) {
  direction.getMatrixAt(index, instanceMatrix );
  matrix.multiplyMatrices( instanceMatrix, typeOfMatrix );
  direction.setMatrixAt( index, matrix );
  direction.instanceMatrix.needsUpdate = true;
}

/**
* Hides beginning of trajectory based on user selected point.
 */
function hideOrientationStart() {
  if (poseStart.start < pose.length && poseStart.start < poseEnd.end) {
    plotPartialPath(poseStart.start, poseEnd.end);

    /* bring old startline back to normal */
    for (let increment = 0; increment < oldStart; increment++) {
      changeMatrix(nonZeroMatrix, increment);
    }
    /* minimize cut trajectory */
    for (let increment = poseStart.start; increment >= 0; increment--) {
      changeMatrix(zeroMatrix, increment);
    }
    /* show new start info */
    displayPointValues(poseStart.start);

    /* update oldStart*/
    oldStart = poseStart.start;
  }
}

/**
* Updates GUI with specific point information.
* @param {int} index index of point.
*/
function displayPointValues(index) {
  time.setValue(timeConverted(pose[index].gpsTimestamp));
  lat.setValue(pose[index].lat);
  long.setValue(pose[poseStart.start].lng);
  alt.setValue(pose[index].alt);
  yaw.setValue(pose[index].yawDeg);
  roll.setValue(pose[index].rollDeg);
  pitch.setValue(pose[index].pitchDeg);
}

/**
* Hides end of trajectory based on user selected point.
 */
function hideOrientationEnd() {
  if (poseEnd.end < pose.length && poseEnd.end > poseStart.start) {
    plotPartialPath(poseStart.start, poseEnd.end);

    /* bring old startline back to normal */
    for (let increment = oldEnd; increment < pose.length; increment++) {
      changeMatrix(nonZeroMatrix, increment);
    }
    for (let increment = poseEnd.end; increment < pose.length; increment++) {
      /* minimize cut trajectory */
      changeMatrix(zeroMatrix, increment);
    }
    /* update oldStart*/
    oldEnd = poseEnd.end;
  }
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

  /* Adds index of point manipulation to gui. */
  const max= pose.length;
  oldEnd=max;
  gui.add(poseStart, 'start', 0, max, max/100+1)
      .onFinishChange(hideOrientationStart);
  gui.add(poseEnd, 'end', 0, max, max/100+1)
      .onFinishChange(hideOrientationEnd);

  /* Time value. */
  const timeStart = {time: ''};
  time = gui.add(timeStart, '');

  /* Lat value. */
  const latStart = {lat: ''};
  lat = gui.add(latStart, 'lat');

  /* Long value. */
  const longStart = {long: ''};
  long = gui.add(longStart, 'long');

  /* Alt value. */
  const altStart = {alt: ''};
  alt = gui.add(altStart, 'alt');

  /* Yaw value. */
  const yawStart = {yaw: ''};
  yaw = gui.add(yawStart, 'yaw');

  /* Pitch value. */
  const pitchStart = {pitch: ''};
  pitch = gui.add(pitchStart, 'pitch');

  /* Roll value. */
  const rollStart = {roll: ''};
  roll = gui.add(rollStart, 'roll');
}

/* TODO: put in onclick function. */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

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
  if (oldIndex!= -1) {
    changeMatrix(scaleInverseMatrix, oldIndex);
    oldIndex= -1;
  }

  event.preventDefault();
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  /* Get array of objects intersected by raycaster */
  raycaster.setFromCamera( mouse, camera );
  const intersects = raycaster.intersectObjects(scene.children, true);

  /* Shows properties of first instance of intersected cylinder. */
  for (let i=0; i < intersects.length; i++) {
    if ( intersects[i].object.type == 'Mesh' ) {
      const instanceId = intersects[i].instanceId;

      /* Scale cylinder and set it as the last index scaled. */
      changeMatrix(scaleMatrix, i);

      /* Set values in GUI. */
      displayPointValues(instanceId);

      /*
      * Break because the raycaster could intersect multiple object but we only
     *  need the first cylinder.
      */
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

  fetch('/getrun?id=' + id + '&dataType=' + type)
      .then((response) => response.json())
      .then((data) => pose = data)
      .then(() => addMap());
}
