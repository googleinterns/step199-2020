
import {FlyControls} from 'https://threejs.org/examples/jsm/controls/FlyControls.js';
import {GUI} from 'https://threejs.org/examples/jsm/libs/dat.gui.module.js';

// global objects
let scene;
let camera;
let renderer;
let clock;
let controls;
const rotationData = new Map();
const points = [];

/**
 * Intializes the scene and its child objects
 */
function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, .1, 1000);
  camera.position.set(0, 1, 1);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  clock = new THREE.Clock();

  // Camera controls, imported from FlyControls library
  controls = new FlyControls(camera, renderer.domElement);
  controls.movementSpeed = 1;
  controls.rollSpeed = Math.PI / 10;
  controls.autoForward = false;
  controls.dragToLook = true;

  // Scene Objects
  let geometry = new THREE.PlaneGeometry(5, 25, 1);
  let material =
      new THREE.MeshBasicMaterial({color: 'pink', side: THREE.DoubleSide});
  const plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = Math.PI / 2;
  plane.position.z = -10;
  scene.add(plane);

  // Fake Pose Data
  material = new THREE.LineBasicMaterial({color: 'red'});
  for (let increment = 0; increment < 15; increment++) {
    points.push(new THREE.Vector3(
        Math.pow(-1, increment), .20, -increment));// GPS points

    const geometry = new THREE.CylinderGeometry(.02, .02, .5);
    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.rotateX(THREE.Math.degToRad(-90));
    cylinder.position.set(0, 0, -.25);
    scene.add(cylinder);// Orientation indicator

    const pivot = new THREE.Group();// Pivot point for each cylinder
    pivot.position.set(Math.pow(-1, increment), .25, -increment);
    scene.add(pivot);
    pivot.add(cylinder);
    const pivotSphereGeo =
      new THREE.SphereGeometry(.03);// Small sphere indicating pivot point
    const pivotSphere = new THREE.Mesh(pivotSphereGeo);
    pivotSphere.position.set(Math.pow(-1, increment), .25, -increment);
    scene.add(pivotSphere);

    rotationData.set(increment, {origin: pivot, mesh: cylinder});
  }
  geometry = new THREE.BufferGeometry().setFromPoints(points);
  material = new THREE.LineBasicMaterial({color: 'blue'});
  const line = new THREE.Line(geometry, material);
  scene.add(line);
  // GUI initialization
  const gui = new GUI();
  let params = {clipIntersection: true, Yaw: 0, showHelpers: false};
  gui.add(params, 'Yaw', -360, 360)
      .step(.1)
      .name('Yaw (degrees)')
      .onChange(function(value) {
        for (let i = 0; i < rotationData.size; i++) {
          rotationData.get(i).origin.rotation.y = THREE.Math.degToRad(value);
        }
      });

  params = {clipIntersection: true, Pitch: 0, showHelpers: false};
  gui.add(params, 'Pitch', -360, 360)
      .step(.1)
      .name('Pitch (degrees)')
      .onChange(function(value) {
        for (let i = 0; i < rotationData.size; i++) {
          rotationData.get(i).origin.rotation.x = THREE.Math.degToRad(value);
        }
      });

  params = {clipIntersection: true, Roll: 0, showHelpers: false};
  gui.add(params, 'Roll', -360, 360)
      .step(.1)
      .name('Roll (degrees)')
      .onChange(function(value) {
        for (let i = 0; i < rotationData.size; i++) {
          rotationData.get(i).origin.rotation.z = THREE.Math.degToRad(value);
        }
      });
}
/**
 * Animation loop
 */
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  controls.update(delta);
  renderer.render(scene, camera);
};

init();
animate();
