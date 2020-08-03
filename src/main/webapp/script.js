
import {FlyControls} from 'https://threejs.org/examples/jsm/controls/FlyControls.js';
import {GUI} from 'https://threejs.org/examples/jsm/libs/dat.gui.module.js';
import {test} from '/decoded.js';
// Initialization of global objects.
let scene;
let camera;
let renderer;
let clock;
let controls;
let count = test.length;
const rotationData = new Map();
const path = [];

let low = 10000;
let high=0;
for(let i = 0; i<test.length;i++){
   if(high<test[i].lat)high =test[i].lat;
   if(low>test[i].lat)low=test[i].lat;
}
console.log("high: "+ high);
console.log("low: "+ low);
console.log("range: "+ (high-low));


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

  addPoseData();
}

/**
 * Creates all the objects from pose data and adds them to the scene.
*/
function addPoseData() {
  let dummy = new THREE.Object3D;
  dummy.matrixAutoUpdate = false;
  let geometry = new THREE.PlaneGeometry(5, 25, 1);
  let material =
      new THREE.MeshBasicMaterial({color: 'pink', side: THREE.DoubleSide});
  const plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = Math.PI / 2;
  plane.position.z = -10;
  scene.add(plane);

  // Adds test pose data as one Geometry instance
  for (let increment = 0; increment < count; increment++) {
    path.push(new THREE.Vector3(
        (test[increment].lat-48.12)*10000,
        test[increment].alt,
        (test[increment].lng-11.58)*10000));// GPS points
  }
  geometry = new THREE.BufferGeometry().setFromPoints(path);
  material = new THREE.LineBasicMaterial({color: 'blue'});
  const line = new THREE.Line(geometry, material);
  scene.add(line);

  let points = [];
  points.push(new THREE.Vector3(0, 0, 0))
  points.push(new THREE.Vector3(0, .5, 0));
  material = new THREE.MeshBasicMaterial({color: 'red'});
  geometry = new THREE.CylinderBufferGeometry(.02, .02, 1);
  const direction = new THREE.InstancedMesh(geometry, material, count);
  direction.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(direction);// Orientation indicator

  for(let i = 0; i < count; i++){
    // var pivotSphereGeo = new THREE.SphereGeometry(.02); // Small sphere indicating pivot point
    // var pivotSphere = new THREE.Mesh(pivotSphereGeo);
    // pivotSphere.position.set(
    //   (test[i].pose.lat/1000) - 1140885,
    //   test[i].alt,
    //   test.data[i].pose.long * 100);
    // scene.add(pivotSphere);

    let matrix = new THREE.Matrix4();
    dummy.matrix.identity();
    matrix.makeTranslation(
      (test[i].lat-48.12)*10000,
      test[i].alt,
      (test[i].lng-11.58)*10000);
    matrix.multiply(new THREE.Matrix4().makeRotationX(-Math.PI/2));
    matrix.multiply(new THREE.Matrix4().makeRotationX(
        THREE.Math.degToRad(test[i].pitchDeg)));
    matrix.multiply(new THREE.Matrix4().makeRotationY(
       THREE.Math.degToRad( test[i].yawDeg)));
    matrix.multiply(new THREE.Matrix4().makeRotationZ(
        THREE.Math.degToRad(test[i].rollDeg)));
    matrix.multiply(new THREE.Matrix4().makeTranslation(0.0, .5, 0.0));
    dummy.applyMatrix4(matrix);
    dummy.updateMatrix();
    direction.setMatrixAt(i, dummy.matrix);
  }
  direction.instanceMatrix.needsUpdate = true;   
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

init();
animate();
