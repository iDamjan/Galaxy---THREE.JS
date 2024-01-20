import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const parametars = {};
parametars.count = 100000;
parametars.size = 0.01;
parametars.radius = 5;
parametars.branches = 3;
parametars.spin = 1;
parametars.randomness = 0.2;
parametars.randomnessPower = 5;
parametars.insideColor = "#ff6030";
parametars.outsideColor = "#1b3984";

// Test 123

let geometry = null;
let material = null;
let particles = null;
// GALAXY
function generateGalaxy() {
  // Generate only one galaxy
  if (particles !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(particles);
  }
  geometry = new THREE.BufferGeometry();
  // Particles positions needs to be float 32 array
  const particlesPositions = new Float32Array(parametars.count * 3);
  const colors = new Float32Array(parametars.count * 3);

  const colorInside = new THREE.Color(parametars.insideColor);
  const colorOutside = new THREE.Color(parametars.outsideColor);

  // Fill the array with the needed positions of the vertecies (currently random)
  for (let i = 0; i < parametars.count; i++) {
    const i3 = i * 3;

    const radius = Math.random() * parametars.radius;
    const spinAngle = radius * parametars.spin;
    const branchAngle =
      ((i % parametars.branches) / parametars.branches) * Math.PI * 2;

    const randomX =
      Math.pow(Math.random(), parametars.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parametars.randomness *
      radius;
    const randomY =
      Math.pow(Math.random(), parametars.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parametars.randomness *
      radius;
    const randomZ =
      Math.pow(Math.random(), parametars.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parametars.randomness *
      radius;

    particlesPositions[i3] =
      Math.cos(branchAngle + spinAngle) * radius + randomX;
    particlesPositions[i3 + 1] = randomY;
    particlesPositions[i3 + 2] =
      Math.sin(branchAngle + spinAngle) * radius + randomZ;

    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parametars.radius);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  const positionAttribute = new THREE.BufferAttribute(particlesPositions, 3);
  geometry.setAttribute("position", positionAttribute);
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  material = new THREE.PointsMaterial({
    size: parametars.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  particles = new THREE.Points(geometry, material);

  scene.add(particles);
}

generateGalaxy();

gui.add(parametars, "count", 100, 1000000, 100).onFinishChange(generateGalaxy);
gui.add(parametars, "size", 0.01, 0.1, 0.001).onFinishChange(generateGalaxy);
gui.add(parametars, "radius", 1, 1, 20).onFinishChange(generateGalaxy);
gui.add(parametars, "branches", 1, 20, 1).onFinishChange(generateGalaxy);
gui.add(parametars, "spin", 1, 1, 20).onFinishChange(generateGalaxy);
gui.add(parametars, "randomness", 0.01, 0.1, 1).onFinishChange(generateGalaxy);
gui
  .add(parametars, "randomnessPower", 0.1, 20, 0.1)
  .onFinishChange(generateGalaxy);
gui.addColor(parametars, "insideColor").onFinishChange(generateGalaxy);
gui.addColor(parametars, "outsideColor").onFinishChange(generateGalaxy);
/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  particles.rotation.y = elapsedTime / 2;

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
