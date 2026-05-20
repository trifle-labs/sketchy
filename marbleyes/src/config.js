export const SPHERE_RADIUS = 10;
export const MARBLE_RADIUS = 0.4;

export const GRAVITY = -4.5;

export const MARBLE = {
  density: 1.5,
  linearDamping: 0.55,
  angularDamping: 0.9,
  friction: 0.9,
  restitution: 0.42,
};

export const STEERING = {
  angAccel: 6.0,
  maxAngSpeed: 2.2,
  angDamping: 2.5,
};

export const TRIGGER = {
  velocityThreshold: 1.2,
  settleMs: 200,
};

export const EJECT = {
  impulse: 1.8,
};

export const JUMP = {
  impulse: 1.6,
};

export const CAMERA = {
  fov: 72,
  near: 0.05,
  far: 200,
  height: 4.5,
  back: 6.5,
  followSpeed: 5.0,
};
