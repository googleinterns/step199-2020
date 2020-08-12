import {FlyControls} from 'https://threejs.org/examples/jsm/controls/FlyControls.js';
import {GUI} from 'https://threejs.org/examples/jsm/libs/dat.gui.module.js';
// Initialization of global objects.
let scene;
let camera;
let renderer;
let clock;
let controls;
let direction;
let line;
let pose;
let poseScalar = {value: 25000};
let posePosition = {x: 0, z: 0};
let count;
const apiKey = 'AIzaSyDCgKca9sLuoQ9xQDfHUvZf1_KAv06SoTU';
const rotationData = new Map();
let path = [];

/**
 * Initializes the scene, camera, renderer, and clock.
 */
function init() {
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

  // The camera controls allows the user to fly with the camera.
  controls = new FlyControls(camera, renderer.domElement);
  controls.movementSpeed = 5;
  controls.rollSpeed = Math.PI / 10;
  controls.autoForward = false;
  controls.dragToLook = true;

  fetchData();// calls addPoseData()
}

/**
 * Creates all the objects from pose data and adds them to the scene.
*/
function addPoseData() {
  let loader = new THREE.TextureLoader();
  let material = new THREE.MeshLambertMaterial(
    {map: loader.load(
      'https://maps.googleapis.com/maps/api/staticmap?format=png&center=48.129872,11.582905&zoom=18&size=500x500&key=' + apiKey)
    });
  let geometry = new THREE.PlaneGeometry(50,50);
  let map = new THREE.Mesh(geometry, material);
  map.position.set(0,0,0);
  map.rotation.x = -Math.PI / 2;
  scene.add(map);

  let light = new THREE.PointLight( 0xffffff, 1, 0 );
  // Specify the light's position
  light.position.set(0, 100, 0);
  // Add the light to the scene
  scene.add(light)

  // Adds pose trajectory line
  plotPath();
  
  // Adds test pose data as one Geometry instance
  material = new THREE.MeshBasicMaterial({color: 'red'});
  geometry = new THREE.CylinderBufferGeometry(.005, .005, .1);
  direction = new THREE.InstancedMesh(geometry, material, count);
  direction.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(direction);// Orientation indicator
  plotOrientation();
    
}
function plotPath() {
  scene.remove(line);
  path=[];
  for (let increment = 0; increment < count; increment++) {
    path.push(new THREE.Vector3(
      (pose[increment].lat-48.129872)*poseScalar.value,
      (pose[increment].alt - 6.582905)/4,
      (pose[increment].lng-11.582905)*poseScalar.value));// GPS points
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(path);
  const material = new THREE.LineBasicMaterial({color: 'blue'});
  line = new THREE.Line(geometry, material);
  scene.add(line);
  line.position.x = posePosition.x;
  line.position.z = posePosition.z;
}
function plotOrientation() {
  let dummy = new THREE.Object3D;
  dummy.matrixAutoUpdate = false;
  for(let i = 0; i < count; i++){
    let matrix = new THREE.Matrix4();
    dummy.matrix.identity();
    matrix.makeTranslation(
      (pose[i].lat-48.129872)*poseScalar.value,
      (pose[i].alt - 6.582905)/4,
      (pose[i].lng-11.582905)*poseScalar.value);
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
    direction.setMatrixAt(i, dummy.matrix);
  }
  direction.instanceMatrix.needsUpdate = true; 
  direction.position.x = posePosition.x;
  direction.position.z = posePosition.z;
}

function gui() {
  var gui = new GUI();
  gui.add(posePosition, 'x', -10, 10,.025).onChange(plotOrientation)
  .onFinishChange(plotPath);;
  gui.add(posePosition, 'z', -10, 10,.025).onChange(plotOrientation)
  .onFinishChange(plotPath);;
  gui.add(poseScalar, 'value', 10000, 50000, 500).onChange(plotOrientation)
  .onFinishChange(plotPath);
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

function fetchData() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id');
    const type = urlParams.get('dataType');
    fetch('/getrun?id=' + id + '&dataType=' + type)
    .then(response => response.json())
    .then(data => pose = data)
    .then(() => {
      count=pose.length;
      addPoseData();
    })
}

init();
gui();
animate();

