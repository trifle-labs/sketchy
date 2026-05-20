import { SPHERE_RADIUS, MARBLE_RADIUS } from './config.js';
import { WELLS } from './wells.js';
import { buildScene } from './scene/buildScene.js';
import { buildSphere, buildSphereGrid } from './scene/buildSphere.js';
import { buildMarble } from './scene/buildMarble.js';
import { initPhysics } from './physics/initPhysics.js';
import { buildSphereBody, buildMarbleBody, buildWellSensors } from './physics/buildColliders.js';
import { startLoop } from './loop.js';

async function main() {
  const { renderer, scene, camera, world: worldGroup, marbleLight } = buildScene();

  const { mesh: sphereMesh, geom: sphereGeom } = buildSphere(WELLS);
  worldGroup.add(sphereMesh);
  worldGroup.add(buildSphereGrid(WELLS));

  const marbleMesh = buildMarble();
  marbleMesh.position.set(0, -(SPHERE_RADIUS - MARBLE_RADIUS), 0);
  scene.add(marbleMesh);

  const { RAPIER, world, eventQueue } = await initPhysics();
  const { body: sphereBody, wallCollider } = buildSphereBody(RAPIER, world, sphereGeom);
  const { body: marbleBody, collider: marbleCollider } = buildMarbleBody(RAPIER, world);
  const sensorsByHandle = buildWellSensors(RAPIER, world, sphereBody, WELLS);

  startLoop({
    renderer, scene, camera,
    world, eventQueue, worldGroup,
    sphereBody, marbleBody, marbleMesh, marbleCollider,
    wallCollider, sensorsByHandle, marbleLight,
    wells: WELLS,
  });
}

main().catch((err) => {
  console.error('marbleyes failed to start', err);
  const hud = document.getElementById('hud');
  if (hud) hud.textContent = 'error: ' + err.message;
});
