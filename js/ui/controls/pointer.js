window.Lumina = window.Lumina || {};

window.Lumina.Pointer = {
  selectedElement: null,
  isDragging: false,
  dragOffsetX: 0,
  dragOffsetY: 0,

  init(containerEl) {
    containerEl.addEventListener('pointerdown', (e) => this.onDown(e));
    window.addEventListener('pointermove', (e) => this.onMove(e));
    window.addEventListener('pointerup', () => this.onUp());
    containerEl.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
  },

  onDown(e) {
    window.Lumina.Synth.ensureContext();
    const rect = window.Lumina.Renderer.canvas.getBoundingClientRect();
    const worldPt = window.Lumina.Renderer.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    const game = window.Lumina.Game;
    if (!game || !game.currentElements) return;

    for (let i = game.currentElements.length - 1; i >= 0; i--) {
      const el = game.currentElements[i];
      if (!el.movable) continue;
      const dx = worldPt.x - el.x;
      const dy = worldPt.y - el.y;
      const w = el.width || (el.length || 80);
      const h = el.height || 40;
      const hitRadius = Math.max(w, h) / 2 + 10;
      if (dx * dx + dy * dy <= hitRadius * hitRadius) {
        this.selectedElement = el;
        this.isDragging = true;
        this.dragOffsetX = dx;
        this.dragOffsetY = dy;
        window.Lumina.Gizmo.show(el);
        window.Lumina.SFX.playClick();
        return;
      }
    }

    if (e.target.closest('.gizmo-angle-control')) return;
    this.selectedElement = null;
    window.Lumina.Gizmo.hide();
  },

  onMove(e) {
    const rect = window.Lumina.Renderer.canvas.getBoundingClientRect();
    if (
      e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top && e.clientY <= rect.bottom
    ) {
      const worldPt = window.Lumina.Renderer.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
      const cx = Math.round(Math.max(0, Math.min(1000, worldPt.x)));
      const cy = Math.round(Math.max(0, Math.min(700, worldPt.y)));
      window.Lumina.HUDHeader.updatePointerCoords(cx, cy);
    }

    if (!this.isDragging || !this.selectedElement) return;
    const worldPt = window.Lumina.Renderer.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    this.selectedElement.x = Math.max(40, Math.min(960, worldPt.x - this.dragOffsetX));
    this.selectedElement.y = Math.max(40, Math.min(660, worldPt.y - this.dragOffsetY));
    window.Lumina.Gizmo.updatePosition(this.selectedElement);
  },

  onUp() {
    this.isDragging = false;
  },

  onWheel(e) {
    if (!this.selectedElement || !this.selectedElement.rotatable) return;
    e.preventDefault();
    const delta = Math.sign(e.deltaY) * 5;
    const nextAngle = ((this.selectedElement.angle || 0) + delta + 360) % 360;
    window.Lumina.Gizmo.setAngle(nextAngle);
  }
};