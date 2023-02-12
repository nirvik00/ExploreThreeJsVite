import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import * as CANNON from "cannon-es";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcccccc);
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("app").appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
camera.up = new THREE.Vector3(0, 0, 1);
camera.lookAt(0, 0, 0);
camera.position.set(20, 20, 20);

controls.update();

////////////////////////////////////////////////////////////////////

let boxGeo = new THREE.BoxGeometry(1, 1, 1);
let boxMesh = new THREE.Mesh(
    boxGeo,
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
scene.add(boxMesh);

let planeGeo = new THREE.BoxGeometry(20, 20, 0.1);
let planeMesh = new THREE.Mesh(
    planeGeo,
    new THREE.MeshBasicMaterial({ color: 0x0000ff })
);
scene.add(planeMesh);

////////////////////////////////////////////////////////////////////

const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, 0, -9.82),
});

const planePhysMat = new CANNON.Material();
const planeBody = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(20, 20, 0.1)),    
    type: CANNON.Body.STATIC,
    material: planePhysMat,
});

const boxPhysMat = new CANNON.Material();
const boxBody = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
    position:new CANNON.Vec3(1,0,20),
    mass: 10,
    material: boxPhysMat,
    angularVelocity: new CANNON.Vec3(0,10,0),
    angularDamping: 0.75,
});

world.addBody(planeBody);
world.addBody(boxBody);

const planeBoxContactPhysMat = new CANNON.ContactMaterial(
    planePhysMat,
    boxPhysMat,
    { friction: 0.25 }
);

world.addContactMaterial(planeBoxContactPhysMat);

const timeStep = 1/60;

////////////////////////////////////////////////////////////////////

animationLoop();

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animationLoop() {
    world.step(timeStep);
    planeMesh.position.copy(planeBody.position)
    planeMesh.quaternion.copy(planeBody.quaternion)

    boxMesh.position.copy(boxBody.position)
    boxMesh.quaternion.copy(boxBody.quaternion)

    ////////////////////////////////////
    render();
    requestAnimationFrame(animationLoop);
}

function render() {
    renderer.render(scene, camera);
}
