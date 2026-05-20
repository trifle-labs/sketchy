import * as THREE from 'three';
import { MARBLE_RADIUS } from '../config.js';

export function buildMarble() {
  const geom = new THREE.SphereGeometry(MARBLE_RADIUS, 32, 24);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.15,
    metalness: 0.7,
  });
  const mesh = new THREE.Mesh(geom, mat);
  return mesh;
}
