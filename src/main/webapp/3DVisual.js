import {FlyControls} from 'https://threejs.org/examples/jsm/controls/FlyControls.js';
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
let dataLength;
let pose;
let poseRotation = {degrees: 0};
let poseScalar = {multiplier: 1};
let posePosition = {x: 0, z: 0};
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
 * it is an asynchronous call requiring addTerrain() to be 
 * called after the data is fully loaded.
 */
function fetchData() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id');
    const type = urlParams.get('dataType');
    fetch('/getrun?id=' + id + '&dataType=' + type)
    .then(response => response.json())
    .then(data => pose = data)
    .then(() => addTerrian());
}

/**
 * Creates the 2D terrain and points a light at it.
 * It also calls two other functions so it can wait on the fetch 
 * request and significantly cut down rendering time with 
 * geometry instancing.
*/
function addTerrian() {
  // Creates the 2D terrain.
  dataLength = pose.length;
  let loader = new THREE.TextureLoader();
  let material = new THREE.MeshLambertMaterial({ 
    map: loader.load(
      'https://maps.googleapis.com/maps/api/staticmap' +
      '?format=png&center=48.129872,11.582905&zoom=18&size=500x500&key='
      + apiKey)
    });
  let geometry = new THREE.PlaneGeometry(50,50);
  const map = new THREE.Mesh(geometry, material);
  map.position.set(0,0,0);
  map.rotation.x = -Math.PI / 2;
  scene.add(map);

  // Add the light to the scene.
  let light = new THREE.PointLight(0xffffff, 1, 0 );
  light.position.set(0, 100, 0);
  scene.add(light)
  console.log(dataLength);
  plotTrajectory();
  
  // Adds pose data to the scene as one Geometry instance.
  material = new THREE.MeshBasicMaterial({color: 'red'});
  geometry = new THREE.CylinderBufferGeometry(.005, .005, .1);
  orientation = new THREE.InstancedMesh(geometry, material, dataLength);
  orientation.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(orientation);
  plotOrientation();
}

/**
 * This uses the pose data to create a blue line representing the pose
 * trajectory. 
 */
function plotTrajectory() {
  // Removes any existing trajectory objects for repositioning.
  scene.remove(trajectory);
  let coordinates=[];
  for (let increment = 0; increment < dataLength; increment++) {
    coordinates.push(new THREE.Vector3(
      (pose[increment].lng-11.582905) * 25000 * poseScalar.multiplier,
      (pose[increment].alt - 6.582905)/4,
      (pose[increment].lat-48.129872) * 25000 * -poseScalar.multiplier));// GPS points
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(coordinates);
  const material = new THREE.LineBasicMaterial({color: 'blue'});
  trajectory = new THREE.Line(geometry, material);
  scene.add(trajectory);
  trajectory.position.x = posePosition.x;
  trajectory.position.z = posePosition.z;
  trajectory.rotation.y = THREE.Math.degToRad(poseRotation.degrees);
}

/**
 * This repositions all children the orientation object. The object 
 * is a geometry instance, initializing the object with one geometry
 * call rather than rather than the number of data points. (O(1) vs. O(N))
 */
function plotOrientation() {
  let dummy = new THREE.Object3D;
  dummy.matrixAutoUpdate = false;
  for(let i = 0; i < dataLength; i++){
    let matrix = new THREE.Matrix4();
    dummy.matrix.identity();
    matrix.makeTranslation(
      (pose[i].lng-11.582905) * 25000 * poseScalar.multiplier,
      (pose[i].alt - 6.582905)/4,
      (pose[i].lat-48.129872) * 25000 * -poseScalar.multiplier);
    matrix.multiply(new THREE.Matrix4().makeRotationX(-Math.PI/2));
    matrix.multiply(new THREE.Matrix4().makeRotationX(
        THREE.Math.degToRad(pose[i].pitchDeg)));
    matrix.multiply(new THREE.Matrix4().makeRotationZ(
       THREE.Math.degToRad(pose[i].yawDeg)));
    matrix.multiply(new THREE.Matrix4().makeRotationY(
        THREE.Math.degToRad(pose[i].rollDeg)));
    matrix.multiply(new THREE.Matrix4().makeTranslation(0.0, .05, 0.0));
    dummy.applyMatrix4(matrix);
    dummy.updateMatrix();
    orientation.setMatrixAt(i, dummy.matrix);
  }
  orientation.instanceMatrix.needsUpdate = true; 
  orientation.position.x = posePosition.x;
  orientation.position.z = posePosition.z;
  orientation.rotation.y = THREE.Math.degToRad(poseRotation.degrees);
}

/**
 * This function initializes gui allowing the user to manipulate the
 * pose objects.
 */
function gui() {
  const gui = new GUI();
  gui.add(poseRotation, 'degrees', 0, 360,1).onChange(plotOrientation)
  .onFinishChange(plotTrajectory).name('Pose Rotation (degrees)');
  gui.add(posePosition, 'x', -10, 10,.025).onChange(plotOrientation)
  .onFinishChange(plotTrajectory).name('X Axis Translation');
  gui.add(posePosition, 'z', -10, 10,.025).onChange(plotOrientation)
  .onFinishChange(plotTrajectory).name('Y Axis Translation');
  gui.add(poseScalar, 'multiplier',.5, 2,.25).onChange(plotOrientation)
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

