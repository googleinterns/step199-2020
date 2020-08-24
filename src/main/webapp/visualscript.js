import {OrbitControls} from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';

import {GUI} from 'https://threejs.org/examples/jsm/libs/dat.gui.module.js';
// Initialization of global objects.
let scene;
let camera;
let renderer;
let clock;
let controls;
let line;
let count;
let pose;
let data;
const poseRotation = {value: 0};
const poseScalar = {value: 1};
const posePosition = {x: 0, z: 0};
const apiKey = 'AIzaSyDCgKca9sLuoQ9xQDfHUvZf1_KAv06SoTU';
let path = [];


/**
 * Initializes the scene, camera, renderer, and clock.
 */
function init() {
  console.log('init was called');
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

  // The camera controls allows the user to fly with the camera.
  //   controls = new FlyControls(camera, renderer.domElement);
  //   controls.movementSpeed = 5;
  //   controls.rollSpeed = Math.PI / 10;
  //   controls.autoForward = false;
  //   controls.dragToLook = true;
  fetchData();
}

function loadMap(initialPose) {
  const loader = new THREE.TextureLoader();
  const material = new THREE.MeshLambertMaterial(
      {
        map: loader.load(
            'https://maps.googleapis.com/maps/api/staticmap?format=png&center=' + initialPose[0].lat + ',' + initialPose[0].lng + '&zoom=18&size=500x500&key=' + apiKey),
      });
  const geometry = new THREE.PlaneGeometry(50, 50);
  const map = new THREE.Mesh(geometry, material);
  map.position.set(0, 0, 0);
  map.rotation.x = -Math.PI / 2;
  scene.add(map);

  const light = new THREE.PointLight(0xffffff, 1, 0);
  // Specify the light's position
  light.position.set(0, 100, 0);
  // Add the light to the scene
  scene.add(light);
}
/**
 * Creates all the objects from pose data and adds them to the scene.
*/
function addPoseData(poseToPlot, hexColor) {
  count = poseToPlot.length;
  // If empty data set, don't load anything including map.
  if (count === 0) {
    return;
  }

  // Adds pose trajectory line
  plotPath(poseToPlot, hexColor);

  // Adds test pose data as one Geometry instance
  const material = new THREE.MeshBasicMaterial({color: hexColor});
  const geometry = new THREE.CylinderBufferGeometry(.005, .005, .1);
  const direction = new THREE.InstancedMesh(geometry, material, count);
  direction.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(direction);// Orientation indicator
  plotOrientation(poseToPlot, direction);
}
function plotPath(poseToPlot, hexColor) {
  let newLine;
  scene.remove(line);
  path = [];
  for (let increment = 0; increment < count; increment++) {
    path.push(new THREE.Vector3(
        (poseToPlot[increment].lng - 11.582905) * 25000 * poseScalar.value,
        (poseToPlot[increment].alt - 6.582905) / 4,
        (poseToPlot[increment].lat - 48.129872) * 25000 * -poseScalar.value));// GPS points
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(path);
  const material = new THREE.LineBasicMaterial({color: 'black'});
  newLine = new THREE.Line(geometry, material);
  scene.add(newLine);
  newLine.position.x = posePosition.x;
  newLine.position.z = posePosition.z;
  newLine.rotation.y = THREE.Math.degToRad(poseRotation.value);
}
function plotOrientation(poseToPlot, directionPose) {
  const dummy = new THREE.Object3D;
  dummy.matrixAutoUpdate = false;
  for (let i = 0; i < count; i++) {
    const matrix = new THREE.Matrix4();
    dummy.matrix.identity();
    matrix.makeTranslation(
        (poseToPlot[i].lng - 11.582905) * 25000 * poseScalar.value,
        (poseToPlot[i].alt - 6.582905) / 4,
        (poseToPlot[i].lat - 48.129872) * 25000 * -poseScalar.value);
    matrix.multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    matrix.multiply(new THREE.Matrix4().makeRotationX(
        THREE.Math.degToRad(poseToPlot[i].pitchDeg)));
    matrix.multiply(new THREE.Matrix4().makeRotationZ(
        THREE.Math.degToRad(poseToPlot[i].yawDeg)));
    matrix.multiply(new THREE.Matrix4().makeRotationY(
        THREE.Math.degToRad(poseToPlot[i].rollDeg)));
    matrix.multiply(new THREE.Matrix4().makeTranslation(0.0, .05, 0.0));
    dummy.applyMatrix4(matrix);
    dummy.updateMatrix();
    directionPose.setMatrixAt(i, dummy.matrix);
  }
  directionPose.instanceMatrix.needsUpdate = true;
  directionPose.position.x = posePosition.x;
  directionPose.position.z = posePosition.z;
  directionPose.rotation.y = THREE.Math.degToRad(poseRotation.value);
}

function gui() {
  const gui = new GUI();
  gui.add(poseRotation, 'value', 0, 360, 1).onChange(plotOrientation)
      .onFinishChange(plotPath).name('Pose Rotation (degrees)');
  gui.add(posePosition, 'x', -10, 10, .025).onChange(plotOrientation)
      .onFinishChange(plotPath).name('X Axis Translation');
  gui.add(posePosition, 'z', -10, 10, .025).onChange(plotOrientation)
      .onFinishChange(plotPath).name('Y Axis Translation');
  gui.add(poseScalar, 'value', .5, 2, .25).onChange(plotOrientation)
      .onFinishChange(plotPath).name('Pose Scale Multiplier');
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

  const isSubSection = urlParams.get('subsection');
  const id = urlParams.get('id');
  const type = urlParams.get('dataType');
  console.log('The value of subsection is ' + isSubSection);
  let firstData;
  if (isSubSection) {
    /* fetch('/getrun?id=' + id + '&dataType=' + type)
      .then(response => response.json())
      .then(newData => data = newData)
      .then(() =>*/

    data = JSON.parse(sessionStorage.getItem('subsection'));
    firstData = Object.values(data)[0].data;
    // We should loop through all the runs and call addPoseData() for all of them.
    {
      Object.values(data).forEach((currentValue) => {
        addPoseData(currentValue.data, currentValue.color);
      });
    }
  } else {
    console.log('This shouldn\'t run');
    pose = JSON.parse(sessionStorage.getItem(id + '_' + type + '_' + subSectionNumber));
    addPoseData();
  }
  loadMap(firstData);
}

init();
gui();
animate();

