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
const apiKey = 'AIzaSyDCgKca9sLuoQ9xQDfHUvZf1_KAv06SoTU';

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
  camera.position.set(0, 1, 1);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  clock = new THREE.Clock();
  controls = new OrbitControls(camera, renderer.domElement );

  fetchData();
}


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
  fetch('/getrun?id=' + id + '&dataType=' + type)
      .then((response) => response.json())
      .then((data) => pose = data)
      .then(() => addMap());
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
  lng = (lng - pose[0].lng) * 25000 * poseTransform.scale;
  alt = (alt - pose[0].alt)/4;
  lat = (lat - pose[0].lat) * 25000 * -poseTransform.scale;
  return [lat, alt, lng];
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
    const localCoords = llaDegreeToLocal(point.lat, point.alt, point.lng);
    /**
      * Subtracting each point by the first point starts the pose
      * at coordinates (0, 0, 0). Each unit in the 3D scene is 4
      * meters while the 6th decimal point in GPS coordinates represents
      * .11 meters. This is why we multiple the lat/lng by 25000, an
      * increment in the 6th decimal place equates to a 0.025 unit
      * change in our 3D space. Since altitude is already represented in
      * meters, we simply divide by 4 to adjust for our 1:4 unit ratio.
      */
    coordinates.push(new THREE.Vector3(
        localCoords[0],
        localCoords[1],
        localCoords[0]));
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
    const localCoords = llaDegreeToLocal(point.lat, point.alt, point.lng);
    matrix.makeTranslation(
        localCoords[0],
        localCoords[1],
        localCoords[0]);
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

/**
 * This function initializes gui allowing the user to manipulate the
 * pose objects.
 */
function gui() {
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

