const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');
const modalClose = document.getElementById('modal-close');

let openWellRef = null;
let onCloseCb = null;

export function isOpen() {
  return openWellRef !== null;
}

export function getOpenWell() {
  return openWellRef;
}

export function openWell(well) {
  if (openWellRef) return;
  openWellRef = well;
  modalContent.innerHTML = well.content;
  modal.hidden = false;
}

export function closeModal() {
  if (!openWellRef) return;
  const well = openWellRef;
  openWellRef = null;
  modal.hidden = true;
  modalContent.innerHTML = '';
  if (onCloseCb) onCloseCb(well);
}

export function onClose(cb) {
  onCloseCb = cb;
}

modalClose.addEventListener('click', closeModal);
window.addEventListener('keydown', (e) => {
  if (e.code === 'Escape' || e.code === 'Space') closeModal();
});
