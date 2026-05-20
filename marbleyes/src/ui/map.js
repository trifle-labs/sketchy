import * as THREE from 'three';

const canvas = document.getElementById('map');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const CX = W / 2;
const CY = H / 2;
const R = Math.min(W, H) / 2 - 10;

const _dir = new THREE.Vector3();

/**
 * Azimuthal-equidistant projection centered on the sphere's −Y pole
 * (where the marble lives under gravity). Map top = scene −Z (the
 * direction the main camera looks).
 */
function project(dir) {
  const incline = Math.acos(-Math.max(-1, Math.min(1, dir.y)));
  const azimuth = Math.atan2(dir.x, -dir.z);
  const r = (incline / Math.PI) * R;
  return [CX + Math.sin(azimuth) * r, CY - Math.cos(azimuth) * r];
}

export function drawMap(wells, worldRotation, marblePos) {
  ctx.clearRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(CX, CY, R, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(CX, CY, R * 0.5, 0, Math.PI * 2);
  ctx.stroke();

  for (const well of wells) {
    _dir.copy(well.dir).applyQuaternion(worldRotation);
    const [x, y] = project(_dir);
    const t = (_dir.y + 1) * 0.5;
    const r = Math.round(61 + (255 - 61) * t);
    const g = Math.round(241 + (234 - 241) * t);
    const b = Math.round(90 + (0 - 90) * t);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  _dir.set(marblePos.x, marblePos.y, marblePos.z);
  const len = _dir.length();
  if (len > 1e-6) _dir.divideScalar(len);
  else _dir.set(0, -1, 0);
  const [mx, my] = project(_dir);
  ctx.fillStyle = '#ff4040';
  ctx.beginPath();
  ctx.arc(mx, my, 5.5, 0, Math.PI * 2);
  ctx.fill();
}
