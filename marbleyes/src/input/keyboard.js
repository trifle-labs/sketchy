const keys = Object.create(null);
let jumpPending = false;

window.addEventListener('keydown', (e) => {
  if (!keys[e.code] && e.code === 'Space') jumpPending = true;
  keys[e.code] = true;
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

export function readInput() {
  let forward = 0;
  let right = 0;
  if (keys['ArrowUp']    || keys['KeyW']) forward += 1;
  if (keys['ArrowDown']  || keys['KeyS']) forward -= 1;
  if (keys['ArrowRight'] || keys['KeyD']) right += 1;
  if (keys['ArrowLeft']  || keys['KeyA']) right -= 1;
  return { forward, right };
}

export function consumeJump() {
  if (!jumpPending) return false;
  jumpPending = false;
  return true;
}
