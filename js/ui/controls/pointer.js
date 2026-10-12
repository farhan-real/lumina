window.Lumina = window.Lumina || {};

window.Lumina.Pointer = {
  selectedElement: null,

  init(containerEl) {
    containerEl.addEventListener('pointerdown', (e) => this.onDown(e));
    window.addEventListener('pointermove', (e) => this.onMove(e));
    window.addEventListener('pointerup', () => this.onUp());
    containerEl.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });

    window.addEventListener('keydown', (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedElement) {
        if (window.Lumina.Game.currentScreen === 'gameplay') {
          e.preventDefault();
          const target = this.selectedElement;
          this.selectedElement = null;
          window.Lumina.EditorTransform.target = null;
          window.Lumina.Game.removeElement(target);
        }
      }
    });
  },

  onDown(e) {
    if (window.Lumina.Game.currentScreen !== 'gameplay') return;
    if (window.Lumina.Synth?.ensureContext) window.Lumina.Synth.ensureContext();

    const rect = window.Lumina.Renderer.canvas.getBoundingClientRect();
    const worldPt = window.Lumina.Renderer.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    const game = window.Lumina.Game;
    const xform = window.Lumina.EditorTransform;

    if (this.selectedElement && xform?.handleDown && xform.handleDown(worldPt, this.selectedElement)) {
      return;
    }

    if (!game || !game.currentElements) return;

    for (let i = game.currentElements.length - 1; i >= 0; i--) {
      const el = game.currentElements[i];
      if (!el.movable) continue;
      if (xform?.hitTestBody && xform.hitTestBody(worldPt, el)) {
        this.selectedElement = el;
        xform.handleDown(worldPt, el);
        if (window.Lumina.SFX?.playClick) window.Lumina.SFX.playClick();
        return;
      }
    }

    this.selectedElement = null;
    if (xform) xform.target = null;
  },

  onMove(e) {
    if (window.Lumina.Game.currentScreen !== 'gameplay') return;
    const rect = window.Lumina.Renderer.canvas.getBoundingClientRect();
    const worldPt = window.Lumina.Renderer.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);

    if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
      const cx = Math.round(Math.max(0, Math.min(1000, worldPt.x)));
      const cy = Math.round(Math.max(0, Math.min(700, worldPt.y)));
      if (window.Lumina.HUDHeader?.updatePointerCoords) {
        window.Lumina.HUDHeader.updatePointerCoords(cx, cy);
      }
    }

    if (window.Lumina.EditorTransform?.handleMove) {
      window.Lumina.EditorTransform.handleMove(worldPt);
    }
  },

  onUp() {
    if (window.Lumina.EditorTransform?.handleUp) {
      window.Lumina.EditorTransform.handleUp();
    }
  },

  onWheel(e) {
    if (window.Lumina.Game.currentScreen !== 'gameplay') return;
    if (!this.selectedElement || this.selectedElement.rotatable === false) return;
    e.preventDefault();
    const delta = Math.sign(e.deltaY) * 5;
    this.selectedElement.angle = ((this.selectedElement.angle || 0) + delta + 360) % 360;
    if (window.Lumina.SFX?.playRotate) window.Lumina.SFX.playRotate();
  }
};