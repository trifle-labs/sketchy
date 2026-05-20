import * as THREE from 'three';
import { stepPhysics } from './physics/stepPhysics.js';
import { readInput, consumeJump } from './input/keyboard.js';
import { applySteering } from './input/applySteering.js';
import { openWell, isOpen, onClose } from './ui/modal.js';
import { TRIGGER, EJECT, JUMP, CAMERA, SPHERE_RADIUS, MARBLE_RADIUS } from './config.js';
import { drawMap } from './ui/map.js';

export function startLoop({
  renderer,
  scene,
  camera,
  world,
  eventQueue,
  worldGroup,
  sphereBody,
  marbleBody,
  marbleMesh,
  marbleCollider,
  wallCollider,
  sensorsByHandle,
  marbleLight,
  wells,
}) {
  const sensorState = new Map();
  let pendingEject = null;
  const EJECT_COOLDOWN_MS = 800;

  let wallContactCount = 0;
  let airJumpsUsed = 0;
  const MAX_AIR_JUMPS = 1;

  const anchorY = -(SPHERE_RADIUS - MARBLE_RADIUS - 0.02);
  const camTarget = new THREE.Vector3(0, anchorY, 0);
  camera.position.set(0, anchorY + CAMERA.height, CAMERA.back);
  camera.lookAt(camTarget);

  const rotationState = {
    rotation: new THREE.Quaternion(),
    angularVel: new THREE.Vector3(),
  };

  const _ejectAxis = new THREE.Vector3();

  onClose((well) => {
    pendingEject = well;
  });

  function handleEjectIfPending(now) {
    if (!pendingEject) return;
    const well = pendingEject;
    pendingEject = null;

    _ejectAxis.copy(well.dir).applyQuaternion(rotationState.rotation).negate();

    marbleBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
    marbleBody.applyImpulse({
      x: _ejectAxis.x * (well.ejectImpulse ?? EJECT.impulse),
      y: _ejectAxis.y * (well.ejectImpulse ?? EJECT.impulse),
      z: _ejectAxis.z * (well.ejectImpulse ?? EJECT.impulse),
    }, true);

    for (const [, state] of sensorState) {
      state.settledMs = 0;
      state.cooldownUntil = now + EJECT_COOLDOWN_MS;
    }
  }

  function drainCollisionEvents() {
    eventQueue.drainCollisionEvents((h1, h2, started) => {
      let other;
      if (h1 === marbleCollider.handle) other = h2;
      else if (h2 === marbleCollider.handle) other = h1;
      else return;

      if (other === wallCollider.handle) {
        if (started) wallContactCount++;
        else wallContactCount = Math.max(0, wallContactCount - 1);
        return;
      }

      const well = sensorsByHandle.get(other);
      if (!well) return;

      let state = sensorState.get(other);
      if (!state) {
        state = { well, inside: false, settledMs: 0, cooldownUntil: 0 };
        sensorState.set(other, state);
      }
      state.inside = started;
      if (!started) state.settledMs = 0;
    });
  }

  function checkSensorSettle(dtMs, now) {
    if (isOpen()) return;
    const v = marbleBody.linvel();
    const speed = Math.hypot(v.x, v.y, v.z);

    for (const [, state] of sensorState) {
      if (now < state.cooldownUntil) { state.settledMs = 0; continue; }
      if (!state.inside) { state.settledMs = 0; continue; }
      if (speed < TRIGGER.velocityThreshold) {
        state.settledMs += dtMs;
        if (state.settledMs >= state.well.settleMs) {
          openWell(state.well);
          state.settledMs = 0;
          return;
        }
      } else {
        state.settledMs = 0;
      }
    }
  }

  let last = performance.now();

  function tick(now) {
    const dtMs = Math.min(50, now - last);
    last = now;
    const dt = dtMs / 1000;

    handleEjectIfPending(now);

    const input = isOpen() ? { forward: 0, right: 0 } : readInput();
    applySteering(input, rotationState, dt);

    if (wallContactCount > 0) airJumpsUsed = 0;
    if (isOpen()) {
      consumeJump();
    } else if (consumeJump()) {
      const grounded = wallContactCount > 0;
      if (grounded || airJumpsUsed < MAX_AIR_JUMPS) {
        marbleBody.applyImpulse({ x: 0, y: JUMP.impulse, z: 0 }, true);
        if (!grounded) airJumpsUsed++;
      }
    }

    sphereBody.setNextKinematicRotation({
      x: rotationState.rotation.x,
      y: rotationState.rotation.y,
      z: rotationState.rotation.z,
      w: rotationState.rotation.w,
    });

    stepPhysics(world, eventQueue);
    drainCollisionEvents();
    checkSensorSettle(dtMs, now);

    worldGroup.quaternion.copy(rotationState.rotation);

    const p = marbleBody.translation();
    marbleMesh.position.set(p.x, p.y, p.z);
    const mq = marbleBody.rotation();
    marbleMesh.quaternion.set(mq.x, mq.y, mq.z, mq.w);

    const alpha = 1 - Math.exp(-CAMERA.followSpeed * dt);
    const targetY = Math.max(p.y, anchorY);
    camTarget.x += (p.x - camTarget.x) * alpha;
    camTarget.y += (targetY - camTarget.y) * alpha;
    camTarget.z += (p.z - camTarget.z) * alpha;
    const desiredCamX = p.x;
    const desiredCamY = targetY + CAMERA.height;
    const desiredCamZ = p.z + CAMERA.back;
    camera.position.x += (desiredCamX - camera.position.x) * alpha;
    camera.position.y += (desiredCamY - camera.position.y) * alpha;
    camera.position.z += (desiredCamZ - camera.position.z) * alpha;
    camera.lookAt(camTarget);

    marbleLight.position.set(p.x, p.y + 0.6, p.z);

    renderer.render(scene, camera);
    drawMap(wells, rotationState.rotation, p);
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}
