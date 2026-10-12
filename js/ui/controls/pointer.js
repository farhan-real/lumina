window.Lumina = window.Lumina || {};

window.Lumina.Pointer = {
  selectedElement: null,
  isPanning: false,
  lastScreenX: 0,
  lastScreenY: 0,
  touches: new Map(),
  initialPinchDist: 0,

  init(containerEl) {
    containerEl.addEventListener('pointerdown', (e) => this.onDown(e));
    window.addEventListener('pointermove', (e) => this.onMove(e));
    window.addEventListener('pointerup', (e) => this.onUp(e));
    window.addEventListener('pointercancel', (e) => this.onUp(e));
    containerEl.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });

    containerEl.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    containerEl.addEventListener('dblclick', (e) => {
      if (window.Lumina.Game.currentScreen !== 'gameplay') return;
      const rect = window.Lumina.Renderer.canvas.getBoundingClientRect();
      const worldPt = window.Lumina.Renderer.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
      const hit = this.findHitElement(worldPt);
      if (!hit) {
        window.Lumina.Renderer.resetCamera();
        if (window.Lumina.SFX?.playClick) window.Lumina.SFX.playClick();
      }
    });

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

  findHitElement(worldPt) {
    const game = window.Lumina.Game;
    const xform = window.Lumina.EditorTransform;
    if (!game || !game.currentElements) return null;
    for (let i = game.currentElements.length - 1; i >= 0; i--) {
      const el = game.currentElements[i];
      if (!el.movable) continue;
      if (xform?.hitTestBody && xform.hitTestBody(worldPt, el)) {
        return el;
      }
    }
    return null;
  },

  onDown(e) {
    if (window.Lumina.Game.currentScreen !== 'gameplay') return;
    if (window.Lumina.Synth?.ensureContext) window.Lumina.Synth.ensureContext();

    this.touches.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Multi-touch pinch zoom initiation
    if (this.touches.size === 2) {
      this.isPanning = false;
      const pts = Array.from(this.touches.values());
      this.initialPinchDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      return;
    }

    const rect = window.Lumina.Renderer.canvas.getBoundingClientRect();
    const worldPt = window.Lumina.Renderer.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    const xform = window.Lumina.EditorTransform;

    // Middle click, right click, or spacebar initiates camera panning
    if (e.button === 1 || e.button === 2 || e.spaceKey) {
      this.isPanning = true;
      this.lastScreenX = e.clientX;
      this.lastScreenY = e.clientY;
      return;
    }

    // Check interaction with active piece gizmo handles
    if (this.selectedElement && xform?.handleDown && xform.handleDown(worldPt, this.selectedElement)) {
      return;
    }

    // Check selection of movable piece
    const hit = this.findHitElement(worldPt);
    if (hit) {
      this.selectedElement = hit;
      xform.handleDown(worldPt, hit);
      if (window.Lumina.SFX?.playClick) window.Lumina.SFX.playClick();
      return;
    }

    // Left click on empty space initiates camera panning
    this.selectedElement = null;
    if (xform) xform.target = null;
    this.isPanning = true;
    this.lastScreenX = e.clientX;
    this.lastScreenY = e.clientY;
  },

  onMove(e) {
    if (window.Lumina.Game.currentScreen !== 'gameplay') return;

    if (this.touches.has(e.pointerId)) {
      this.touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    const rect = window.Lumina.Renderer.canvas.getBoundingClientRect();

    // Two-finger touch pinch-zoom and pan
    if (this.touches.size === 2) {
      const pts = Array.from(this.touches.values());
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      if (this.initialPinchDist > 0) {
        const factor = dist / this.initialPinchDist;
        const midX = (pts[0].x + pts[1].x) / 2 - rect.left;
        const midY = (pts[0].y + pts[1].y) / 2 - rect.top;
        window.Lumina.Renderer.zoomAt(midX, midY, factor);
      }
      this.initialPinchDist = dist;
      return;
    }

    // Camera panning
    if (this.isPanning) {
      const dx = e.clientX - this.lastScreenX;
      const dy = e.clientY - this.lastScreenY;
      this.lastScreenX = e.clientX;
      this.lastScreenY = e.clientY;
      window.Lumina.Renderer.pan(dx, dy);
      return;
    }

    // Pointer coordinates readout
    if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
      const worldPt = window.Lumina.Renderer.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
      const cx = Math.round(worldPt.x);
      const cy = Math.round(worldPt.y);
      if (window.Lumina.HUDHeader?.updatePointerCoords) {
        window.Lumina.HUDHeader.updatePointerCoords(cx, cy);
      }
      if (window.Lumina.EditorTransform?.handleMove) {
        window.Lumina.EditorTransform.handleMove(worldPt);
      }
    }
  },

  onUp(e) {
    if (this.touches.has(e.pointerId)) {
      this.touches.delete(e.pointerId);
    }
    if (this.touches.size < 2) {
      this.initialPinchDist = 0;
    }
    this.isPanning = false;
    if (window.Lumina.EditorTransform?.handleUp) {
      window.Lumina.EditorTransform.handleUp();
    }
  },

  onWheel(e) {
    if (window.Lumina.Game.currentScreen !== 'gameplay') return;
    e.preventDefault();

    const rect = window.Lumina.Renderer.canvas.getBoundingClientRect();
    const worldPt = window.Lumina.Renderer.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);

    // If mouse wheel is over selected piece, perform angle stepping
    if (this.selectedElement && this.selectedElement.rotatable !== false && !e.ctrlKey && !e.metaKey) {
      const xform = window.Lumina.EditorTransform;
      if (xform?.hitTestBody && xform.hitTestBody(worldPt, this.selectedElement)) {
        const delta = Math.sign(e.deltaY) * 5;
        this.selectedElement.angle = ((this.selectedElement.angle || 0) + delta + 360) % 360;
        if (window.Lumina.SFX?.playRotate) window.Lumina.SFX.playRotate();
        return;
      }
    }

    // Default mouse wheel action: zoom camera centered on mouse cursor
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    window.Lumina.Renderer.zoomAt(e.clientX - rect.left, e.clientY - rect.top, factor);
  }
};