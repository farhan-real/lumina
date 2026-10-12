window.Lumina = window.Lumina || {};

window.Lumina.Renderer = {
  canvas: null,
  ctx: null,
  dpr: 1,
  scale: 1,
  baseScale: 1,
  zoom: 1.0,
  offsetX: 0,
  offsetY: 0,
  roomW: 1000,
  roomH: 700,

  init(canvasEl) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d', { alpha: false });
    this.resetCamera();
    this.resize();
  },

  resetCamera() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const level = window.Lumina.Game?.currentLevel;
    this.roomW = (level && level.width) || window.Lumina.Constants.ROOM_WIDTH;
    this.roomH = (level && level.height) || window.Lumina.Constants.ROOM_HEIGHT;

    this.zoom = 1.0;
    this.baseScale = Math.min(rect.width / this.roomW, rect.height / this.roomH);
    this.scale = this.baseScale * this.zoom;
    this.offsetX = (rect.width - this.roomW * this.scale) / 2;
    this.offsetY = (rect.height - this.roomH * this.scale) / 2;

    if (window.Lumina.HUDHeader?.updateCameraZoom) {
      window.Lumina.HUDHeader.updateCameraZoom(this.zoom);
    }
  },

  resize() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, window.Lumina.Constants.MAX_DPR);

    this.canvas.width = Math.floor(rect.width * this.dpr);
    this.canvas.height = Math.floor(rect.height * this.dpr);

    const level = window.Lumina.Game?.currentLevel;
    this.roomW = (level && level.width) || window.Lumina.Constants.ROOM_WIDTH;
    this.roomH = (level && level.height) || window.Lumina.Constants.ROOM_HEIGHT;

    const prevBase = this.baseScale || 1;
    this.baseScale = Math.min(rect.width / this.roomW, rect.height / this.roomH);

    if (this.offsetX === 0 && this.offsetY === 0) {
      this.scale = this.baseScale * this.zoom;
      this.offsetX = (rect.width - this.roomW * this.scale) / 2;
      this.offsetY = (rect.height - this.roomH * this.scale) / 2;
    } else {
      const ratio = this.baseScale / prevBase;
      this.scale = this.baseScale * this.zoom;
    }
  },

  zoomAt(screenX, screenY, factor) {
    const minZoom = 0.45;
    const maxZoom = 3.5;
    const nextZoom = Math.max(minZoom, Math.min(maxZoom, this.zoom * factor));
    if (Math.abs(nextZoom - this.zoom) < 1e-4) return;

    const nextScale = this.baseScale * nextZoom;
    const worldX = (screenX - this.offsetX) / this.scale;
    const worldY = (screenY - this.offsetY) / this.scale;

    this.zoom = nextZoom;
    this.scale = nextScale;
    this.offsetX = screenX - worldX * nextScale;
    this.offsetY = screenY - worldY * nextScale;

    if (window.Lumina.HUDHeader?.updateCameraZoom) {
      window.Lumina.HUDHeader.updateCameraZoom(this.zoom);
    }
  },

  pan(dx, dy) {
    this.offsetX += dx;
    this.offsetY += dy;
  },

  screenToWorld(sx, sy) {
    return {
      x: (sx - this.offsetX) / this.scale,
      y: (sy - this.offsetY) / this.scale
    };
  },

  worldToScreen(wx, wy) {
    return {
      x: this.offsetX + wx * this.scale,
      y: this.offsetY + wy * this.scale
    };
  },

  clear() {
    const ctx = this.ctx;
    ctx.resetTransform();
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.scale(this.dpr, this.dpr);
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);

    this.drawTacticalGrid(ctx);
  },

  drawTacticalGrid(ctx) {
    // 1. Minor Subgrid (Step: 20px)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.032)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= this.roomW; x += 20) {
      if (x % 100 !== 0) {
        ctx.moveTo(x, 0); ctx.lineTo(x, this.roomH);
      }
    }
    for (let y = 0; y <= this.roomH; y += 20) {
      if (y % 100 !== 0) {
        ctx.moveTo(0, y); ctx.lineTo(this.roomW, y);
      }
    }
    ctx.stroke();

    // 2. Major Tactical Grid (Step: 100px)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.075)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= this.roomW; x += 100) {
      ctx.moveTo(x, 0); ctx.lineTo(x, this.roomH);
    }
    for (let y = 0; y <= this.roomH; y += 100) {
      ctx.moveTo(0, y); ctx.lineTo(this.roomW, y);
    }
    ctx.stroke();

    // 3. Specular Obsidian Boundary Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, this.roomW, this.roomH);
  }
};