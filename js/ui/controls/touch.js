window.Lumina = window.Lumina || {};

window.Lumina.Gizmo = {
  gizmoEl: null,
  handleEl: null,
  angleInput: null,
  coordsEl: null,
  removeBtn: null,
  activeElement: null,
  isRotating: false,

  init() {
    this.gizmoEl = document.getElementById('gizmo-rotation');
    this.handleEl = this.gizmoEl.querySelector('.gizmo-handle');
    this.angleInput = document.getElementById('gizmo-angle-input');
    this.coordsEl = document.getElementById('gizmo-coords');
    this.removeBtn = document.getElementById('btn-gizmo-remove');

    this.handleEl.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.isRotating = true;
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isRotating || !this.activeElement) return;
      const screenPt = window.Lumina.Renderer.worldToScreen(this.activeElement.x, this.activeElement.y);
      const rect = window.Lumina.Renderer.canvas.getBoundingClientRect();
      const cx = screenPt.x + rect.left;
      const cy = screenPt.y + rect.top;
      const rad = Math.atan2(e.clientY - cy, e.clientX - cx);
      let deg = Math.round((rad * 180) / Math.PI);
      deg = (deg + 90 + 360) % 360;
      this.setAngle(deg);
    });

    window.addEventListener('pointerup', () => {
      this.isRotating = false;
    });

    this.angleInput.addEventListener('change', () => {
      let val = parseInt(this.angleInput.value, 10);
      if (isNaN(val)) val = 0;
      val = ((val % 360) + 360) % 360;
      this.setAngle(val);
    });

    this.angleInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.angleInput.blur();
    });

    document.getElementById('btn-angle-sub').addEventListener('click', (e) => {
      e.stopPropagation();
      if (!this.activeElement) return;
      this.setAngle((((this.activeElement.angle || 0) - 5) + 360) % 360);
    });

    document.getElementById('btn-angle-add').addEventListener('click', (e) => {
      e.stopPropagation();
      if (!this.activeElement) return;
      this.setAngle(((this.activeElement.angle || 0) + 5) % 360);
    });

    if (this.removeBtn) {
      this.removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.activeElement) {
          window.Lumina.Game.removeElement(this.activeElement);
        }
      });
    }

    // Keyboard removal shortcut
    window.addEventListener('keydown', (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && this.activeElement) {
        if (document.activeElement !== this.angleInput) {
          e.preventDefault();
          window.Lumina.Game.removeElement(this.activeElement);
        }
      }
    });
  },

  show(element) {
    this.activeElement = element;
    this.gizmoEl.classList.remove('hidden');
    this.updatePosition(element);
    this.updateAngleInput(element.angle || 0);
  },

  hide() {
    this.activeElement = null;
    this.gizmoEl.classList.add('hidden');
  },

  setAngle(deg) {
    if (!this.activeElement) return;
    this.activeElement.angle = deg;
    this.updateAngleInput(deg);
    window.Lumina.SFX.playRotate();
  },

  updatePosition(element) {
    const pt = window.Lumina.Renderer.worldToScreen(element.x, element.y);
    this.gizmoEl.style.left = pt.x + 'px';
    this.gizmoEl.style.top = pt.y + 'px';
    if (this.coordsEl) {
      this.coordsEl.textContent = `X: ${Math.round(element.x)}  Y: ${Math.round(element.y)}`;
    }
  },

  updateAngleInput(deg) {
    if (this.angleInput && document.activeElement !== this.angleInput) {
      this.angleInput.value = deg;
    }
  }
};