// import {FlyControls} from 'https://threejs.org/examples/jsm/controls/FlyControls.js';
import {OrbitControls} from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
import {GUI} from 'https://threejs.org/examples/jsm/libs/dat.gui.module.js';

// Global objects.
let scene;
let camera;
let renderer;
let clock;
let controls;
let pose;
let trajectory;
const apiKey = 'AIzaSyDCgKca9sLuoQ9xQDfHUvZf1_KAv06SoTU';
let median = {lat: 0, lng: 0, alt: 0};
const orientation = {X: null, Y: null, Z: null};
const poseTransform = {
  /* Unit: 4 meters*/ translateX: 0,
  /* Unit: 4 meters*/ translateY: 0,
  /* Unit: 4 meters*/ translateZ: 0,
  /* Unit: degrees*/ rotateY: 0,
  /* Unit: degrees*/ rotateZ: 0,
  /* Scalar*/ scale: 1};

initThreeJs();
gui();
animate();

/**
 * Initializes the essential three.js 3D components then fetchs
 * the pose data.
 */
function initThreeJs() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
      /* fov =*/ 75,
      /* aspectRatio =*/ window.innerWidth / window.innerHeight,
      /* nearFrustum =*/.1,
      /* farFrustum =*/ 1000);
  camera.up.set(0, 0, 1);
  camera.position.set(0, -10, 0);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  clock = new THREE.Clock();
  controls = new OrbitControls(camera, renderer.domElement );

  fetchData();
}


/**
 * Fetchs pose data from the RunInfo servlet,
 * it is an asynchronous call requiring addMap() to be
 * called after the data is fully loaded.
 */
function fetchData() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const id = urlParams.get('id');
  const type = urlParams.get('dataType');
  fetch('/getrun?id=' + id + '&dataType=' + type)
      .then((response) => response.json())
      .then((data) => pose = data)
      .then(() => addMap());
}

/**
 * Finds the median value of the latitude, longitude,
 * and altitude. The median is used as a reference point
 * for the East-North-Up (ENU) conversion and as the center
 * point for the 2D map.
 * @return {array} An array containing median lat, lng, and alt
 *   coordinates.
 */
function findMedians() {
  const arrays = {lat: [], lng: [], alt: []};
  for (const point of pose) {
    arrays.lat.push(point.lat);
    arrays.lng.push(point.lng);
    arrays.alt.push(point.alt);
  }
  const sorted = {
    lat: [...arrays.lat].sort((a, b) => a - b),
    lng: [...arrays.lng].sort((a, b) => a - b),
    alt: [...arrays.alt].sort((a, b) => a - b)};
  const mid = {
    lat: sortedLat[Math.floor(sorted.lat.length / 2)],
    lng: sortedLng[Math.floor(sorted.lng.length / 2)],
    alt: sortedAlt[Math.floor(sorted.alt.length / 2)]};
  return [mid.lat, mid.lng, mid.alt];
}

/**
 * Creates the 2D terrain and points a light at it.
 * It also calls two other functions so it can wait on the fetch
 * request and significantly cut down rendering time with
 * geometry instancing.
*/
function addMap() {
  const [medianLat, medianLng, medianAlt] = findMedians();
  median = {lat: medianLat, lng: medianLng, alt: medianAlt};

  // Creates the 2D map.
  const loader = new THREE.TextureLoader();
  const material = new THREE.MeshLambertMaterial({
    map: loader.load(
        'https://maps.googleapis.com/maps/api/staticmap' +
      '?format=png&center=' + median.lat + ',' + median.lng +
      '&zoom=18&size=500x500&key=' + apiKey),
  });
  const geometry = new THREE.PlaneGeometry(200, 200);
  const map = new THREE.Mesh(geometry, material);
  map.position.set(0, 0, -4);
  scene.add(map);

  // Add the light to the scene.
  const light = new THREE.PointLight(0xffffff, 1, 0 );
  light.position.set(0, 0, 1000);
  scene.add(light);

  createInstances();
  plotTrajectory();
  plotOrientation();
}


/**
 * Creates all the children for each axis of orientation. Each object
 * is a geometry instance, initializing the object with one geometry
 * call rather than the number of data points. (O(1) vs. O(N))
 */
function createInstances() {
  // Blue corresponds to the Z axis.
  let material = new THREE.MeshBasicMaterial({color: 'blue'});
  const geometry = new THREE.CylinderBufferGeometry(.005, .005, .1);
  orientation.Z = new THREE.InstancedMesh(geometry, material, pose.length);
  orientation.Z.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(orientation.Z);

  // Green corresponds to the Z axis.
  material = new THREE.MeshBasicMaterial({color: 'green'});
  orientation.Y = new THREE.InstancedMesh(geometry, material, pose.length);
  orientation.Y.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(orientation.Y);

  // Red corresponds to the Z axis.
  material = new THREE.MeshBasicMaterial({color: 'red'});
  orientation.X = new THREE.InstancedMesh(geometry, material, pose.length);
  orientation.X.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(orientation.X);
}
/**
  * Converts latitude, longitude, and altitude coordinates (LLA) to
  * Earth-Centered, Earth-Fixed coordinates (ECEF).
  * @param {double} lat Latitude represented in Decimal Degrees
  * @param {double} lng Longitude represented in Decimal Degrees
  * @param {double} alt Altitude represented in Decimal Degrees
  * @return {array} An array containing x, y, z ECEF coordinates.
  */
function llaToEcef(lat, lng, alt) {
  // Constants.
  const majorAxis = 6378137;
  const flatConstant = 1 / 298.25722356;
  const minorAxis = majorAxis*(1-flatConstant);
  // Eccentricity.
  const eSq = (Math.pow(majorAxis, 2) -
    Math.pow(minorAxis, 2)) / Math.pow(majorAxis, 2);
  const lambda = THREE.Math.degToRad(lat);
  const phi = THREE.Math.degToRad(lng);
  const radius = majorAxis /
    Math.sqrt(1 - eSq * Math.pow(Math.sin(lambda), 2));
  // Conversion.
  const x = (radius + alt) * Math.cos(lambda) * Math.cos(phi);
  const y = (radius + alt) * Math.cos(lambda) * Math.sin(phi);
  const z = ((Math.pow(minorAxis, 2) * radius) /
    Math.pow(majorAxis, 2) + alt) * Math.sin(lambda);

  return [x, y, z];
}

/**
 * Converts Earth-Centered, Earth-Fixed coordinates (ECEF) to
 * East-North-Up coordinates (ENU).
 * @param {double} x Latitude represented in ECEF coordinates.
 * @param {double} y Longitude represented in ECEF coordinate.
 * @param {double} z Altitude represented in ECEF coordinates.
 * @param {double} lat0 The reference latitude represented in
 *     ECEF coordinates.
 * @param {double} lon0 The reference longitude represented in
 *     ECEF coordinates.
 * @param {double} h0 The reference height represented in
 *     ECEF coordinates.
 * @return {array} An array containing x, y, z ENU coordinates.
 */
function ecefToEnu(x, y, z, lat0, lon0, h0) {
  // Converts LLA reference point to ECEF coordinates.
  const [x0, y0, z0] = llaToEcef(lat0, lon0, h0);
  const xd = x - x0;
  const yd = y - y0;
  const zd = z - z0;

  const sinLambda = Math.sin(THREE.Math.degToRad(lat0));
  const cosLambda = Math.cos(THREE.Math.degToRad(lat0));
  const cosPhi = Math.cos(THREE.Math.degToRad(lon0));
  const sinPhi = Math.sin(THREE.Math.degToRad(lon0));

  // Matrix multiplication.
  const xEast = -sinPhi * xd + cosPhi * yd;
  const yNorth = -cosPhi * sinLambda * xd - sinLambda *
    sinPhi * yd + cosLambda * zd;
  const zUp = cosLambda * cosPhi * xd + cosLambda *
    sinPhi * yd + sinLambda * zd;

  return [xEast, yNorth, zUp];
}


/**
 * Uses the pose data to build a line representing the pose
 * trajectory.
 */
function plotTrajectory() {
  // Removes any existing trajectory objects for repositioning.
  scene.remove(trajectory);
  /**
   * The X axis controls the left and right direction, the Y axis controls
   * forward and back movement, and the Z axis controls up and down movement.
   */
  const coordinates=[];
  for (const point of pose) {
    const [x0, y0, z0] = llaToEcef(point.lat, point.lng, point.alt);
    const [x, y, z] = ecefToEnu(x0, y0, z0, median.lat, median.lng, median.alt);
    coordinates.push(new THREE.Vector3(x, y, z)
        .multiplyScalar(poseTransform.scale));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(coordinates);
  const material = new THREE.LineBasicMaterial({color: 'green'});
  trajectory = new THREE.Line(geometry, material);
  scene.add(trajectory);
  // Allows the GUI to manipulate the trajectory.
  trajectory.position.x = poseTransform.translateX;
  trajectory.position.y = poseTransform.translateY;
  trajectory.position.z = poseTransform.translateZ;
  trajectory.rotation.y = THREE.Math.degToRad(poseTransform.rotateY);
  trajectory.rotation.z = THREE.Math.degToRad(poseTransform.rotateZ);
}

/**
 * Controls all 3 geometry instances, along with positioning the individual
 * instances.
 */
function plotOrientation() {
  for (const axis in orientation) {
    if (axis != '') {
      matrixRotation(axis);
      // Allows the GUI to manipulate the orientation.
      orientation[axis].instanceMatrix.needsUpdate = true;
      orientation[axis].position.x = poseTransform.translateX;
      orientation[axis].position.y = poseTransform.translateY;
      orientation[axis].position.z = poseTransform.translateZ;
      orientation[axis].rotation.y = THREE.Math.degToRad(poseTransform.rotateY);
      orientation[axis].rotation.z = THREE.Math.degToRad(poseTransform.rotateZ);
    }
  }
}

/**
 * Creates a Matrix4 object for each individual instance, using translations
 * and rotations to maneuver them into a given position.
 * @param {String} direction Specifies which instance mesh to manipulate using
 *     by naming the axis.
 */
function matrixRotation(direction) {
  let increment = 0;
  let poseObject;
  for (const point of pose) {
    /**
     * Matrix4 is a 4x4 matrix used to translate, rotate, and
     * scale each instance of the pose orientation locally instead
     * using the world transform. This means it will rotate relative
     * to the position of the matrix, not the center of the 3D scene.
     */
    const matrix = new THREE.Matrix4();
    const [x0, y0, z0] = llaToEcef(point.lat, point.lng, point.alt);
    const [x, y, z] = ecefToEnu(x0, y0, z0, median.lat, median.lng, median.alt);
    matrix.makeTranslation(x, y, z);
    matrix.multiply(new THREE.Matrix4().makeRotationX(Math.PI/2));
    matrix.multiply(new THREE.Matrix4().makeRotationX(
        THREE.Math.degToRad(point.pitchDeg)));
    matrix.multiply(new THREE.Matrix4().makeRotationZ(
        THREE.Math.degToRad(point.yawDeg)));
    matrix.multiply(new THREE.Matrix4().makeRotationY(
        THREE.Math.degToRad(point.rollDeg)));
    if (direction == 'Z') {
      poseObject = orientation.Z;
    } else if (direction == 'Y') {
      matrix.multiply(new THREE.Matrix4().makeRotationX(-Math.PI/2));
      poseObject = orientation.Y;
    } else if (direction == 'X') {
      matrix.multiply(new THREE.Matrix4().makeRotationX(-Math.PI/2));
      matrix.multiply(new THREE.Matrix4().makeRotationZ(-Math.PI/2));
      poseObject = orientation.X;
    }
    matrix.multiply(new THREE.Matrix4().makeTranslation(0.0, .05, 0.0));
    poseObject.setMatrixAt(increment, matrix);
    increment++;
  }
}

/**
 * Initializes gui allowing the user to manipulate the pose objects.
 */
function gui() {
  const gui = new GUI();
  gui.add(poseTransform, 'rotateY', 0, 360, 1).onChange(plotOrientation)
      .onFinishChange(plotTrajectory)
      .name('Pose Y Rotation (degrees)');
  gui.add(poseTransform, 'rotateZ', 0, 360, 1).onChange(plotOrientation)
      .onFinishChange(plotTrajectory)
      .name('Pose Z Rotation (degrees)');
  gui.add(poseTransform, 'translateX', -10, 10, .025)
      .onChange(plotOrientation)
      .onFinishChange(plotTrajectory).name('X Axis Translation');
  gui.add(poseTransform, 'translateY', -10, 10, .025)
      .onChange(plotOrientation)
      .onFinishChange(plotTrajectory).name('Y Axis Translation');
  gui.add(poseTransform, 'translateZ', -10, 10, .025)
      .onChange(plotOrientation)
      .onFinishChange(plotTrajectory).name('Z Axis Translation');
  gui.add(poseTransform, 'scale', .1, 2, .1)
      .onChange(plotOrientation)
      .onFinishChange(plotTrajectory).name('Pose Scale Multiplier');
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
