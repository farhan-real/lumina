window.Lumina = window.Lumina || {};

window.Lumina.Renderer = {
  canvas: null,
  ctx: null,
  dpr: 1,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  roomW: 1000,
  roomH: 700,

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

    const level = window.Lumina.Game.currentLevel;
    this.roomW = (level && level.width) || window.Lumina.Constants.ROOM_WIDTH;
    this.roomH = (level && level.height) || window.Lumina.Constants.ROOM_HEIGHT;

    this.scale = Math.min(rect.width / this.roomW, rect.height / this.roomH);
    this.offsetX = (rect.width - this.roomW * this.scale) / 2;
    this.offsetY = (rect.height - this.roomH * this.scale) / 2;
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