import * as THREE from 'three';
import { SPHERE_RADIUS } from '../config.js';

const _n = new THREE.Vector3();

export function displacePoint(v, wells, sphereRadius = SPHERE_RADIUS) {
  _n.copy(v).normalize();
  let outward = 0;
  for (const well of wells) {
    const cosAng = _n.dot(well.dir);
    const angle = Math.acos(Math.min(1, Math.max(-1, cosAng)));
    const angularRadius = well.radius / sphereRadius;
    if (angle < angularRadius) {
      const t = angle / angularRadius;
      outward += well.depth * well.falloff(t);
    }
  }
  if (outward > 0) v.addScaledVector(_n, outward);
  return v;
}

export function displaceDimples(geom, wells, sphereRadius = SPHERE_RADIUS) {
  const pos = geom.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    displacePoint(v, wells, sphereRadius);
    pos.setXYZ(i, v.x, v.y, v.z);
  }

  pos.needsUpdate = true;
  geom.computeVertexNormals();
  geom.computeBoundingSphere();
  return geom;
}

export function buildSphere(wells) {
  const geom = new THREE.SphereGeometry(SPHERE_RADIUS, 512, 256);
  displaceDimples(geom, wells);

  const mat = new THREE.MeshStandardMaterial({
    color: 0x3a3a55,
    side: THREE.BackSide,
    roughness: 0.85,
    metalness: 0.0,
    flatShading: false,
  });

  const mesh = new THREE.Mesh(geom, mat);
  return { mesh, geom };
}

/**
 * Lat/long line grid that follows the displaced sphere wall (lines bend
 * into dimples). Pulled slightly inward toward the sphere center so they
 * sit just in front of the wall and don't z-fight.
 */
export function buildSphereGrid(wells, sphereRadius = SPHERE_RADIUS) {
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({
    color: 0x88aacc,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
  });

  const NUM_LATS = 9;
  const NUM_LONGS = 18;
  const SEGMENTS = 384;
  const INSET = 0.04;

  function pushArc(points, ptFn) {
    for (let s = 0; s <= SEGMENTS; s++) {
      const p = ptFn(s / SEGMENTS);
      const v = new THREE.Vector3(p[0], p[1], p[2]).multiplyScalar(sphereRadius);
      displacePoint(v, wells, sphereRadius);
      const n = new THREE.Vector3().copy(v).normalize();
      v.addScaledVector(n, -INSET);
      points.push(v);
    }
  }

  for (let i = 1; i <= NUM_LATS; i++) {
    const lat = -Math.PI / 2 + i * Math.PI / (NUM_LATS + 1);
    const y = Math.sin(lat);
    const r = Math.cos(lat);
    const points = [];
    pushArc(points, (t) => {
      const θ = t * Math.PI * 2;
      return [r * Math.cos(θ), y, r * Math.sin(θ)];
    });
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
  }

  for (let j = 0; j < NUM_LONGS; j++) {
    const θ = (j / NUM_LONGS) * Math.PI * 2;
    const points = [];
    pushArc(points, (t) => {
      const lat = -Math.PI / 2 + t * Math.PI;
      const y = Math.sin(lat);
      const r = Math.cos(lat);
      return [r * Math.cos(θ), y, r * Math.sin(θ)];
    });
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
  }

  return group;
}
