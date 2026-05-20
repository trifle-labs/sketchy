import { SPHERE_RADIUS, MARBLE_RADIUS, MARBLE } from '../config.js';

/**
 * Sphere wall as a position-based kinematic body. Trimesh collider sits in
 * body-local coords; rotating the body each frame rotates the entire wall
 * (and its dimples) in the physics world. Marble stays at the bottom under
 * gravity; dimples come to it.
 */
export function buildSphereBody(RAPIER, world, sphereGeom) {
  const pos = sphereGeom.attributes.position.array;
  const vertices = new Float32Array(pos.length);
  vertices.set(pos);

  let indices;
  if (sphereGeom.index) {
    const src = sphereGeom.index.array;
    indices = new Uint32Array(src.length);
    for (let i = 0; i < src.length; i++) indices[i] = src[i];
  } else {
    indices = new Uint32Array(pos.length / 3);
    for (let i = 0; i < indices.length; i++) indices[i] = i;
  }

  const bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased();
  const body = world.createRigidBody(bodyDesc);

  const wallDesc = RAPIER.ColliderDesc.trimesh(vertices, indices)
    .setFriction(MARBLE.friction)
    .setRestitution(MARBLE.restitution);
  const wallCollider = world.createCollider(wallDesc, body);

  return { body, wallCollider };
}

/**
 * Marble body — dynamic, sits at the bottom of the sphere under gravity.
 * It barely translates; the rotating sphere wall brings dimples to it.
 */
export function buildMarbleBody(RAPIER, world) {
  const startY = -(SPHERE_RADIUS - MARBLE_RADIUS - 0.05);
  const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(0, startY, 0)
    .setLinearDamping(MARBLE.linearDamping)
    .setAngularDamping(MARBLE.angularDamping)
    .setCcdEnabled(true);
  const body = world.createRigidBody(bodyDesc);

  const colliderDesc = RAPIER.ColliderDesc.ball(MARBLE_RADIUS)
    .setDensity(MARBLE.density)
    .setFriction(MARBLE.friction)
    .setRestitution(MARBLE.restitution)
    .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
  const collider = world.createCollider(colliderDesc, body);
  return { body, collider };
}

/**
 * Well sensors attached as additional colliders to the sphere body. They
 * rotate with the wall, so when a dimple is at the bottom, its sensor is
 * over the marble. Translations are body-local (i.e., the same fixed
 * directions the dimples were displaced along).
 */
export function buildWellSensors(RAPIER, world, sphereBody, wells) {
  const sensorsByHandle = new Map();

  for (const well of wells) {
    const floorDist = SPHERE_RADIUS + well.depth - MARBLE_RADIUS;
    const x = well.dir.x * floorDist;
    const y = well.dir.y * floorDist;
    const z = well.dir.z * floorDist;

    const colliderDesc = RAPIER.ColliderDesc.ball(well.triggerRadius)
      .setTranslation(x, y, z)
      .setSensor(true)
      .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
    const collider = world.createCollider(colliderDesc, sphereBody);

    sensorsByHandle.set(collider.handle, well);
  }

  return sensorsByHandle;
}
