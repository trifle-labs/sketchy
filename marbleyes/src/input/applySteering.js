import * as THREE from 'three';
import { STEERING } from '../config.js';

const _axis = new THREE.Vector3();
const _delta = new THREE.Quaternion();

/**
 * Update the world's angular velocity from keyboard input and integrate
 * into the world rotation quaternion. The sphere body rotates by this
 * quaternion in physics; the visual world group mirrors it.
 *
 * Axis convention (right-handed, looking at scene with camera behind +Z):
 *   W (forward): rotate around +X — brings +Z hemisphere down to -Y.
 *   D (right):   rotate around -Z — brings +X hemisphere down to -Y.
 */
export function applySteering(input, state, dt) {
  state.angularVel.x -= input.forward * STEERING.angAccel * dt;
  state.angularVel.z -= input.right   * STEERING.angAccel * dt;

  const damp = Math.exp(-STEERING.angDamping * dt);
  state.angularVel.multiplyScalar(damp);

  const speed = state.angularVel.length();
  if (speed > STEERING.maxAngSpeed) {
    state.angularVel.multiplyScalar(STEERING.maxAngSpeed / speed);
  }

  if (state.angularVel.lengthSq() > 1e-10) {
    _axis.copy(state.angularVel);
    const angle = _axis.length() * dt;
    _axis.normalize();
    _delta.setFromAxisAngle(_axis, angle);
    state.rotation.premultiply(_delta);
    state.rotation.normalize();
  }
}
