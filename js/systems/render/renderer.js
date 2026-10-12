window.Lumina = window.Lumina || {};

window.Lumina.Renderer = {
  canvas: null,
  ctx: null,
  dpr: 1,
  scale: 1,
  offsetX: 0,
  offsetY: 0,

  init(canvasEl) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d', { alpha: false });
    this.resize();
  },

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, window.Lumina.Constants.MAX_DPR);

    this.canvas.width = Math.floor(rect.width * this.dpr);
    this.canvas.height = Math.floor(rect.height * this.dpr);

    const roomW = window.Lumina.Constants.ROOM_WIDTH;
    const roomH = window.Lumina.Constants.ROOM_HEIGHT;

    this.scale = Math.min(rect.width / roomW, rect.height / roomH);
    this.offsetX = (rect.width - roomW * this.scale) / 2;
    this.offsetY = (rect.height - roomH * this.scale) / 2;
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
    // Pure Pitch Black Void
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.scale(this.dpr, this.dpr);
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);

    this.drawTacticalGrid(ctx);
  },

  drawTacticalGrid(ctx) {
    // 1. Minor Subgrid (Step: 20px) - Subtle guide lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.032)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= 1000; x += 20) {
      if (x % 100 !== 0) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 700);
      }
    }
    for (let y = 0; y <= 700; y += 20) {
      if (y % 100 !== 0) {
        ctx.moveTo(0, y);
        ctx.lineTo(1000, y);
      }
    }
    ctx.stroke();

    // 2. Major Tactical Grid (Step: 100px) - Gentle reference lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.075)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= 1000; x += 100) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 700);
    }
    for (let y = 0; y <= 700; y += 100) {
      ctx.moveTo(0, y);
      ctx.lineTo(1000, y);
    }
    ctx.stroke();

    // 3. Specular Obsidian Boundary Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, 1000, 700);
  }
};