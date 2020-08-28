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

// Likely need to make a separate pose transform for each runId;
const transforms = {};
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

initThreeJs();
animate();

/**
 * Initializes the essential three.js 3D components then fetchs the pose data.
 */
function initThreeJs() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
      /* fov =*/ 75,
      /* aspectRatio =*/ window.innerWidth / window.innerHeight,
      /* nearFrustum =*/.1,
      /* farFrustum =*/ 1000);
  camera.position.set(0, 1, 1);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  clock = new THREE.Clock();
  controls = new OrbitControls(camera, renderer.domElement);

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
  // Add the light to the scene.
  const light = new THREE.PointLight(0xffffff, 1, 0);
  light.position.set(0, 100, 0);
  scene.add(light);
  plotTrajectory(runId, poseToPlot);

  // Adds pose data to the scene as one Geometry instance.
  const material = new THREE.MeshBasicMaterial({color: hexColor});
  const geometry = new THREE.CylinderBufferGeometry(.005, .005, .1);
  const orientation = new THREE.InstancedMesh(geometry,
      material, poseToPlot.length);
  orientation.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  runs[runId].orientation = orientation;
  runs[runId].data = poseToPlot;
  scene.add(orientation);
  plotOrientation(runId);
}

/**
 * Converts lla coordinates to local world coordinates.
 * @param {number} runId The given run's id.
 * @param {Point} pose The run to center the data around.
 * @param {number} lat Latitude in degrees.
 * @param {number} lng Longitude in degrees.
 * @param {number} alt Altitude in meters.
 * @return {Array<number, number, number>} An array returning gps coordinates.
 */
function llaDegreeToLocal(runId, pose, lat, lng, alt) {
  /**
   * Subtracting each point by the first point starts the pose at coordinates
   * (0, 0, 0). Each unit in the 3D scene is 4 meters while the 6th decimal
   * point in GPS coordinates represents .11 meters. This is why we multiple the
   * lat/lng by 25000, an increment in the 6th decimal place equates to a 0.025
   * unit change in our 3D space. Since altitude is already represented in
   * meters, we simply divide by 4 to adjust for our 1:4 unit ratio.
   */
  const x = (lng - pose.lng) * 25000 * transforms[runId].scale;
  const y = (alt - pose.alt) / 4;
  const z = (lat - pose.lat) * 25000 * -transforms[runId].scale;
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
  trajectory.position.x = transforms[runId].translateX;
  trajectory.position.z = transforms[runId].translateZ;
  trajectory.rotation.y = THREE.Math.degToRad(transforms[runId].rotate);
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
  }
  orientation.instanceMatrix.needsUpdate = true;
  orientation.position.x = transforms[runId].translateX;
  orientation.position.z = transforms[runId].translateZ;
  orientation.rotation.y = THREE.Math.degToRad(transforms[runId].rotate);
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
  console.log(runs);
  let currentData = runs[runId].data;
  // On change of selected runId, update the given dataset to use;
  gui.add(currentId, 'value', Object.keys(runs)).onFinishChange(
      () => {
        currentData = runs[currentId.value].data; console.log(currentId);
      });

  gui.add(transforms[currentId.value], 'rotate', 0, 360, 1)
      .onChange(() => {
        console.log('changed'); plotOrientation(currentId.value);
      })
      .onFinishChange(() => {
        console.log(currentId.value);
        lotTrajectory(currentId.value, currentData);
      })
      .name('Pose Rotation (degrees)');
  gui.add(transforms[currentId.value], 'translateX', -10, 10, .025)
      .onChange(() => plotOrientation(currentId.value))
      .onFinishChange(() => plotTrajectory(currentId.value, currentData))
      .name('X Axis Translation');
  gui.add(transforms[currentId.value], 'translateZ', -10, 10, .025)
      .onChange(() => plotOrientation(currentId.value))
      .onFinishChange(() => plotTrajectory(currentId.value, currentData))
      .name('Z Axis Translation');
  gui.add(transforms[currentId.value], 'scale', .5, 2, .25)
      .onChange(() => plotOrientation(currentId.value))
      .onFinishChange(() => plotTrajectory(currentId.value, currentData))
      .name('Pose Scale Multiplier');
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
          (currentKey) => transforms[currentKey] = defaultTransform);
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
