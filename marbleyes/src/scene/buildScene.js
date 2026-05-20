import * as THREE from 'three';
import { CAMERA, SPHERE_RADIUS, MARBLE_RADIUS } from '../config.js';

export function buildScene() {
  const canvas = document.getElementById('c');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a14);

  const camera = new THREE.PerspectiveCamera(CAMERA.fov, 1, CAMERA.near, CAMERA.far);
  const marbleAnchorY = -(SPHERE_RADIUS - MARBLE_RADIUS - 0.02);
  camera.position.set(0, marbleAnchorY + CAMERA.height, CAMERA.back);
  camera.lookAt(0, marbleAnchorY, 0);

  const world = new THREE.Group();
  scene.add(world);

  scene.add(new THREE.AmbientLight(0xffffff, 0.18));

  const key = new THREE.DirectionalLight(0xffffff, 0.35);
  key.position.set(2, 4, 3);
  scene.add(key);

  const marbleLight = new THREE.PointLight(0xffeecc, 2.6, 30, 1.2);
  marbleLight.position.set(0, marbleAnchorY + 0.5, 0);
  scene.add(marbleLight);

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  return { renderer, scene, camera, world, marbleAnchorY, marbleLight };
}
