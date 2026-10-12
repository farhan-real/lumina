window.Lumina = window.Lumina || {};

window.Lumina.Gizmo = {
  activeElement: null,

  init() {
    const el = document.getElementById('gizmo-rotation');
    if (el) el.classList.add('hidden');
  },

  show(element) {
    this.activeElement = element;
    if (window.Lumina.EditorTransform) {
      window.Lumina.EditorTransform.target = element;
    }
    const el = document.getElementById('gizmo-rotation');
    if (el) el.classList.add('hidden');
  },

  hide() {
    this.activeElement = null;
    if (window.Lumina.EditorTransform) {
      window.Lumina.EditorTransform.target = null;
    }
    const el = document.getElementById('gizmo-rotation');
    if (el) el.classList.add('hidden');
  },

  setAngle(deg) {
    if (!this.activeElement) return;
    this.activeElement.angle = deg;
    if (window.Lumina.SFX?.playRotate) window.Lumina.SFX.playRotate();
  },

  updatePosition() {}
};