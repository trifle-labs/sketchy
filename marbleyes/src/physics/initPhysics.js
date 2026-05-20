import RAPIER from '@dimforge/rapier3d-compat';
import { GRAVITY } from '../config.js';

let initialized = false;

export async function initPhysics() {
  if (!initialized) {
    await RAPIER.init();
    initialized = true;
  }

  const gravity = { x: 0, y: GRAVITY, z: 0 };
  const world = new RAPIER.World(gravity);
  const eventQueue = new RAPIER.EventQueue(true);

  return { RAPIER, world, eventQueue };
}
