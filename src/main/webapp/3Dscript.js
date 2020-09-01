import {OrbitControls} from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
import {GUI} from 'https://threejs.org/examples/jsm/libs/dat.gui.module.js';
/**
* A Point object with a lat and lng.
* @typedef {Object<number, number, number>} Point
* @property {number} lat The lat of the point.
* @property {number} lng The lng of the point.
* @property {number} alt The alt of the point.
*/

/**
 * Class for storing 3D coordinates.
 * @constructor
 */
class Point {
  /**
   * The constructor for Point.
   * @param {(number|object)} x An arbitary x data point.
   * @param {(number|object)} y An arbitary y data point.
   * @param {(number|object)} z An arbitary z data point.
   */
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  /**
   * A getter.
   * @return {(number|object)} An arbitary x data point.
   */
  getX() {
    return this.x;
  }
  /**
   * A getter.
   * @return {(number|object)} An arbitary y data point.
   */
  getY() {
    return this.y;
  }
  /**
   * A getter.
   * @return {(number|object)} An arbitary z data point.
   */
  getZ() {
    return this.z;
  }
}
// Global objects.
/**
 * @typedef {Array<number, number>}
 * @property {Array<Point>} data All the stored run data for a given runId
 * @property {string} color The color in a standard HTML acceptable format
 */
let scene;
let camera;
let renderer;
let clock;
let controls;
let trajectory;
/* The runs, origin, currentId, and runIdToTransforms
 * are all being read of modified by the gui, requiring
 * they be global variables.
*/
let runs;
let origin;
const currentId = {};
const runIdToTransforms = {};

const apiKey = 'AIzaSyDCgKca9sLuoQ9xQDfHUvZf1_KAv06SoTU';

initThreeJs();
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
  controls = new OrbitControls(camera, renderer.domElement);

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

  const isSubSection = urlParams.get('subsection');
  let latLng;
  if (isSubSection) {
    runs = JSON.parse(sessionStorage.getItem('subsection'));
    const firstData = Object.values(runs)[0].data;
    const [lat, lng, alt] = findMedians(firstData[0]);
    latLng = {latitude: lat, longitude: lng};
    origin = new Point(lat, lng, alt);
    currentId.value = Object.keys(runs)[0];
    {
      // Initialize the runIdToTransforms for each run.
      Object.keys(runs).forEach(
          (currentKey) => runIdToTransforms[currentKey] = defaultTransform);
      // Render the different runs.
      const runsIterable = Object.entries(runs);
      for (const [runId, currentObject] of runsIterable) {
        const poseData = currentObject.data;
        const [xAxis, yAxis, zAxis] =
          createInstances(poseData.length);
        runs[runId].orientation = {x: xAxis, y: yAxis, z: zAxis};
        runs[runId].data = poseData;
        runs[runId].color = currentObject.color;
        plotOrientation(poseData, runs[runId].orientation, origin);
        plotTrajectory(pose, origin, currentObject.color);
      }
    }
  } else {
    console.log('Invalid input format provided');
  }
  loadGui();
  addMap(latLng);
}


/**
 * Finds the median value of the latitude, longitude,
 * and altitude. The median is used as a reference point
 * for the East-North-Up (ENU) conversion and as the center
 * point for the 2D map.
 * @param {Object} pose
 * @return {array} An array containing median lat, lng, and alt
 *   coordinates.
 */
function findMedians(pose) {
  const arrays = {lat: [], lng: [], alt: []};
  for (const point of pose) {
    arrays.lat.push(point.lat);
    arrays.lng.push(point.lng);
    arrays.alt.push(point.alt);
  }
  const sorted = {
    /* Sorts the array given using the compare function given as a parameter.
     The a - b specifies that it should be in ascending order. */
    lat: [...arrays.lat].sort((a, b) => a - b),
    lng: [...arrays.lng].sort((a, b) => a - b),
    alt: [...arrays.alt].sort((a, b) => a - b)};
  const mid = {
    lat: sorted.lat[Math.floor(sorted.lat.length / 2)],
    lng: sorted.lng[Math.floor(sorted.lng.length / 2)],
    alt: sorted.alt[Math.floor(sorted.alt.length / 2)]};
  return [mid.lat, mid.lng, mid.alt];
}

/**
 * Creates the 2D terrain and points a light at it.
 * It also calls two other functions so it can wait on the fetch
 * request and significantly cut down rendering time with
 * geometry instancing.
 * @param {Object} center An LLA coordinate used as the center
 *     of the 2D map.
*/
function addMap(center) {
  // Creates the 2D map.
  const loader = new THREE.TextureLoader();
  const material = new THREE.MeshLambertMaterial({
    map: loader.load(
        'https://maps.googleapis.com/maps/api/staticmap' +
      '?format=png&center=' + center.latitude + ',' + center.longitude +
      '&zoom=18&size=500x500&key=' + apiKey),
  });
  const geometry = new THREE.PlaneGeometry(200, 200);
  const map = new THREE.Mesh(geometry, material);
  // A -4 Z parameter is given so the map rendered below the pose(s).
  map.position.set(0, 0, -4);
  scene.add(map);

  // Add the light to the scene.
  const light = new THREE.PointLight(0xffffff, 1, 0 );
  light.position.set(0, 0, 1000);
  scene.add(light);
}


/**
 * Creates all the children for each axis of orientation. Each object
 * is a geometry instance, initializing the object with one geometry
 * call rather than the number of data points. (O(1) vs. O(N))
 * @param {Number} poseLength
 * @return {object} A Point object holding a cylinder for each axis.
 */
function createInstances(poseLength) {
  // Blue corresponds to the Z axis.
  let material = new THREE.MeshBasicMaterial({color: 'blue'});
  /* Geometry defines the top and bottom radius along with the length.
    The numbers are given to be distinguishable from other data points. */
  const geometry = new THREE.CylinderBufferGeometry(.005, .005, .1);
  const zCylinder = new THREE.InstancedMesh(geometry, material, poseLength);
  zCylinder.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(zCylinder);

  // Green corresponds to the Y axis.
  material = new THREE.MeshBasicMaterial({color: 'green'});
  const yCylinder = new THREE.InstancedMesh(geometry, material, poseLength);
  yCylinder.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(yCylinder);

  // Red corresponds to the X axis.
  material = new THREE.MeshBasicMaterial({color: 'red'});
  const xCylinder = new THREE.InstancedMesh(geometry, material, poseLength);
  xCylinder.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(xCylinder);

  return [xCylinder, yCylinder, zCylinder];
}
/**
  * Converts latitude, longitude, and altitude coordinates (LLA) to
  * Earth-Centered, Earth-Fixed coordinates (ECEF).
  * @param {number} lat Latitude represented in Decimal Degrees
  * @param {number} lng Longitude represented in Decimal Degrees
  * @param {number} alt Altitude represented in Decimal Degrees
  * @return {array} An array containing x, y, z ECEF coordinates
  *     all of which are in meters.
  */
function llaToEcef(lat, lng, alt) {
  // LLA to ECEF Paper: https://microem.ru/files/2012/08/GPS.G1-X-00006.pdf
  const majorAxis = 6378137; // Meters
  const flatConstant = 1 / 298.25722356; // Scalar
  const minorAxis = majorAxis*(1-flatConstant); // Meters

  // Eccentricity.
  const eSq = (Math.pow(majorAxis, 2) -
    Math.pow(minorAxis, 2)) / Math.pow(majorAxis, 2);
  const lambda = THREE.Math.degToRad(lat);
  const phi = THREE.Math.degToRad(lng);

  // Radius of curvature on the Earth
  const radius = majorAxis /
    Math.sqrt(1 - eSq * Math.pow(Math.sin(lambda), 2));
  // Conversion equations.
  const x = (radius + alt) * Math.cos(lambda) * Math.cos(phi);
  const y = (radius + alt) * Math.cos(lambda) * Math.sin(phi);
  const z = ((Math.pow(minorAxis, 2) * radius) /
    Math.pow(majorAxis, 2) + alt) * Math.sin(lambda);

  return [x, y, z];
}

/**
 * Converts Earth-Centered, Earth-Fixed coordinates (ECEF) to
 * East-North-Up coordinates (ENU).
 * @param {Object} ecefPose The pose data point being converted to ENU.
 * @param {Object} ecefOrigin Reference ECEF position, used as the origin
 *     of the 3D world.
 * @param {Object} origin Reference LLA position, used as the origin
 *     of the 3D world.
 * @return {array} An array containing x, y, z ENU coordinates.
 */
function ecefToEnu(ecefPose, ecefOrigin, origin) {
  // ECEF to ENU equation: https://www.mathworks.com/help/map/ref/ecef2enu.html
  // Localizes the new xyz coordinate using the reference point.
  const localX = ecefPose.getX() - ecefOrigin.getX();
  const localY = ecefPose.getY() - ecefOrigin.getY();
  const localZ = ecefPose.getZ() - ecefOrigin.getZ();

  const sinLambda = Math.sin(THREE.Math.degToRad(origin.getX()));
  const cosLambda = Math.cos(THREE.Math.degToRad(origin.getX()));
  const cosPhi = Math.cos(THREE.Math.degToRad(origin.getY()));
  const sinPhi = Math.sin(THREE.Math.degToRad(origin.getY()));

  // Matrix multiplication.
  const xEast = -sinPhi * localX + cosPhi * localY;
  const yNorth = -cosPhi * sinLambda * localX - sinLambda *
    sinPhi * localY + cosLambda * localZ;
  const zUp = cosLambda * cosPhi * localX + cosLambda *
    sinPhi * localY + sinLambda * localZ;

  return [xEast, yNorth, zUp];
}

/**
 * Uses the pose data to build a line representing the pose
 * trajectory.
 * @param {Object} pose
 * @param {Object} origin Reference ECEF position, used as the origin
 *     of the 3D world.
 */
function plotTrajectory(pose, origin) {
  // Removes any existing trajectory objects for repositioning.
  scene.remove(trajectory);
  /**
   * The X axis controls the left and right direction, the Y axis controls
   * forward and back movement, and the Z axis controls up and down movement.
   */
  const coordinates=[];
  const [ecefX, ecefY, ecefZ] =
    llaToEcef(origin.getX(), origin.getY(), origin.getZ());
  const ecefOrigin = new Point(ecefX, ecefY, ecefZ);
  for (const point of pose) {
    const [x0, y0, z0] = llaToEcef(point.lat, point.lng, point.alt);
    const ecefPose = new Point(x0, y0, z0);
    const [x, y, z] = ecefToEnu(ecefPose, ecefOrigin, origin);
    coordinates.push(new THREE.Vector3(x, y, z)
        .multiplyScalar(poseTransform.scale));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(coordinates);
  const material = new THREE.LineBasicMaterial({color: 'green'});
  trajectory = new THREE.Line(geometry, material);
  scene.add(trajectory);
  trajectory.position.x = runIdToTransforms[runId].translateX;
  trajectory.position.y = runIdToTransforms[runId].translateY;
  trajectory.rotation.z = THREE.Math.degToRad(runIdToTransforms[runId].rotate);
}

/**
 * Controls all 3 geometry instances, along with positioning the individual
 * instances.
 * @param {Object} pose
 * @param {Object} orientation A dictionary holding each axis' instance
 *     mesh.
 * @param {Object} origin Reference ECEF position, used as the origin
 *     of the 3D world.
 */
function plotOrientation(pose, orientation, origin) {
  const axes = ['x', 'y', 'z'];
  for (const axis of axes) {
    matrixRotation(pose, orientation, axis, origin);
  }
}

/**
 * Creates a Matrix4 object for each individual instance, using translations
 * and rotations to maneuver them into a given position.
 * @param {Object} pose
 * @param {Object} orientation A dictionary holding each axis' instance
 *     mesh.
 * @param {String} direction Specifies which instance mesh to manipulate using
 *     by naming the axis.
 * @param {Object} origin Reference ECEF position, used as the origin
 *     of the 3D world.
 */
function matrixRotation(pose, orientation, direction, origin) {
  let poseObject;
  const [ecefX, ecefY, ecefZ] =
    llaToEcef(origin.getX(), origin.getY(), origin.getZ());
  const ecefOrigin = new Point(ecefX, ecefY, ecefZ);
  for (const point of pose) {
    /**
     * Matrix4 is a 4 by 4 matrix used to translate, rotate, and
     * scale each instance of the pose orientation locally instead
     * using the world transform. This means it will rotate relative
     * to the position of the matrix, not the center of the 3D scene.
     */
    const matrix = new THREE.Matrix4();
    const [x0, y0, z0] = llaToEcef(point.lat, point.lng, point.alt);
    const ecefPose = new Point(x0, y0, z0);
    const [x, y, z] = ecefToEnu(ecefPose, ecefOrigin, origin);
    matrix.makeTranslation(x, y, z);
    matrix.multiply(new THREE.Matrix4().makeRotationX(Math.PI/2));
    matrix.multiply(new THREE.Matrix4().makeRotationX(
        THREE.Math.degToRad(point.pitchDeg)));
    matrix.multiply(new THREE.Matrix4().makeRotationZ(
        THREE.Math.degToRad(point.yawDeg)));
    matrix.multiply(new THREE.Matrix4().makeRotationY(
        THREE.Math.degToRad(point.rollDeg)));
    if (direction == 'z') {
      poseObject = orientation.x;
    } else if (direction == 'y') {
      matrix.multiply(new THREE.Matrix4().makeRotationX(-Math.PI/2));
      poseObject = orientation.y;
    } else if (direction == 'x') {
      matrix.multiply(new THREE.Matrix4().makeRotationX(-Math.PI/2));
      matrix.multiply(new THREE.Matrix4().makeRotationZ(-Math.PI/2));
      poseObject = orientation.z;
    }
    matrix.multiply(new THREE.Matrix4().makeTranslation(0.0, .05, 0.0));
    poseObject.setMatrixAt(pose.indexOf(point), matrix);
    poseObject.position.x = runIdToTransforms[runId].translateX;
    poseObject.position.y = runIdToTransforms[runId].translateY;
    poseObject.rotation.z =
      THREE.Math.degToRad(runIdToTransforms[runId].rotate);
    increment++;
  }
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
  let currentPose = runs[runId].data;
  let currentOrientation = runs[runId].orientation;
  let currentColor = runs[runID].color;
  // On change of selected runId, update the given dataset to use;
  gui.add(currentId, 'value', Object.keys(runs)).onFinishChange(
      () => {
        currentPose = runs[currentId.value].data;
        currentOrientation = runs[runId].orientation;
        currentColor = runs[runId].color;
      });
  gui.add(runIdToTransforms[currentId.value], 'rotate', 0, 360, 1)
      .onChange(() => plotOrientation(currentPose, currentOrientation, origin))
      .onFinishChange(() => plotTrajectory(currentPose, origin, currentColor))
      .name('Pose Rotation (degrees)');
  gui.add(runIdToTransforms[currentId.value], 'translateX', -10, 10, .025)
      .onChange(() => plotOrientation(currentPose, currentOrientation, origin))
      .onFinishChange(() => plotTrajectory(currentPose, origin, currentColor))
      .name('X Axis Translation');
  gui.add(runIdToTransforms[currentId.value], 'translateZ', -10, 10, .025)
      .onChange(() => plotOrientation(currentPose, currentOrientation, origin))
      .onFinishChange(() => plotTrajectory(currentPose, origin, currentColor))
      .name('Z Axis Translation');
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
