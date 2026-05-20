import * as THREE from 'three';

// Spherical-bowl falloff: f(t) ≈ sqrt(1 - t²) — flat-ish bottom with a
// steep lip near t=1, so the marble drops in rather than rolling across.
const bowlFalloff = (t) => {
  const c = Math.min(1, Math.max(0, t));
  return Math.sqrt(Math.max(0, 1 - c * c));
};

const raw = [
  {
    id: 'top',
    dir: [0.0, 1.0, 0.0],
    radius: 0.6,
    depth: 1.55,
    content: '<h2>Top</h2><p>The marble found the ceiling.</p>',
  },
  {
    id: 'right',
    dir: [1.0, 0.25, 0.0],
    radius: 0.57,
    depth: 1.45,
    content: '<h2>Right</h2><p>A placeholder pane.</p>',
  },
  {
    id: 'left',
    dir: [-1.0, 0.25, 0.0],
    radius: 0.57,
    depth: 1.45,
    content: '<h2>Left</h2><p><a href="https://trifle.life" target="_blank" rel="noopener">trifle.life</a></p>',
  },
  {
    id: 'front',
    dir: [0.0, 0.25, 1.0],
    radius: 0.6,
    depth: 1.55,
    content: '<h2>Video well</h2><iframe width="480" height="270" src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe>',
  },
  {
    id: 'back',
    dir: [0.0, 0.25, -1.0],
    radius: 0.57,
    depth: 1.45,
    content: '<h2>Back</h2><p>Another text pane.</p>',
  },
  {
    id: 'upper-right',
    dir: [0.55, 0.75, 0.45],
    radius: 0.55,
    depth: 1.4,
    content: '<h2>Upper right</h2><p>Tucked above the equator.</p>',
  },
];

export const WELLS = raw.map((w) => ({
  ...w,
  dir: new THREE.Vector3(w.dir[0], w.dir[1], w.dir[2]).normalize(),
  triggerRadius: w.triggerRadius ?? 0.28,
  settleMs: w.settleMs ?? 200,
  falloff: w.falloff ?? bowlFalloff,
}));

export const WELLS_BY_ID = Object.fromEntries(WELLS.map((w) => [w.id, w]));
