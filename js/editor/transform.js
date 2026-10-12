window.Lumina = window.Lumina || {};

window.Lumina.EditorTransform = {
  mode: 'idle',
  target: null,
  dragOffset: { x: 0, y: 0 },

  handleDown(pt, entity) {
    if (!entity) return false;
    this.target = entity;
    const hInfo = this.hitTestHandles(pt, entity);

    if (hInfo) {
      this.mode = hInfo.mode;
      return true;
    }

    if (this.hitTestBody(pt, entity)) {
      this.mode = 'translate';
      this.dragOffset.x = pt.x - entity.x;
      this.dragOffset.y = pt.y - entity.y;
      return true;
    }

    return false;
  },

  handleMove(pt) {
    if (this.mode === 'idle' || !this.target) return false;
    const ent = this.target;
    const rad = ((ent.angle || 0) * Math.PI) / 180;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);

    if (this.mode === 'translate') {
      ent.x = Math.round(pt.x - this.dragOffset.x);
      ent.y = Math.round(pt.y - this.dragOffset.y);
    } else if (this.mode === 'rotate') {
      const angleRad = Math.atan2(pt.y - ent.y, pt.x - ent.x);
      let deg = Math.round((angleRad * 180) / Math.PI) + 90;
      ent.angle = ((deg % 360) + 360) % 360;
    } else if (this.mode === 'aim') {
      const angleRad = Math.atan2(pt.y - ent.y, pt.x - ent.x);
      let deg = Math.round((angleRad * 180) / Math.PI);
      ent.angle = ((deg % 360) + 360) % 360;
    } else if (this.mode === 'resize-h') {
      const loy = -(pt.x - ent.x) * sinA + (pt.y - ent.y) * cosA;
      ent.height = Math.max(16, Math.min(800, Math.round(Math.abs(loy) * 2)));
    } else if (this.mode === 'resize-w') {
      const lox = (pt.x - ent.x) * cosA + (pt.y - ent.y) * sinA;
      ent.width = Math.max(12, Math.min(500, Math.round(Math.abs(lox) * 2)));
    } else if (this.mode === 'resize-corner') {
      const lox = (pt.x - ent.x) * cosA + (pt.y - ent.y) * sinA;
      const loy = -(pt.x - ent.x) * sinA + (pt.y - ent.y) * cosA;
      ent.width = Math.max(12, Math.min(500, Math.round(Math.abs(lox) * 2)));
      ent.height = Math.max(16, Math.min(800, Math.round(Math.abs(loy) * 2)));
    } else if (this.mode === 'resize-radius') {
      const dist = Math.hypot(pt.x - ent.x, pt.y - ent.y);
      ent.radius = Math.max(12, Math.min(100, Math.round(dist)));
    } else if (this.mode === 'resize-length') {
      const dist = Math.hypot(pt.x - ent.x, pt.y - ent.y);
      ent.length = Math.max(24, Math.min(400, Math.round(dist * 2)));
    }

    // Live update inspector fields without rebuilding the DOM
    window.Lumina.EditorUI.syncValues(ent);
    return true;
  },

  handleUp() {
    this.mode = 'idle';
  },

  toWorld(cx, cy, lx, ly, rad) {
    return {
      x: cx + lx * Math.cos(rad) - ly * Math.sin(rad),
      y: cy + lx * Math.sin(rad) + ly * Math.cos(rad)
    };
  },

  hitTestHandles(pt, ent) {
    const rad = ((ent.angle || 0) * Math.PI) / 180;
    const tol = 14;

    if (ent.type === 'wall') {
      const hw = (ent.width || 30) / 2;
      const hh = (ent.height || 120) / 2;

      const rot = this.toWorld(ent.x, ent.y, 0, -hh - 24, rad);
      if (Math.hypot(pt.x - rot.x, pt.y - rot.y) <= tol) return { mode: 'rotate' };

      const cor = this.toWorld(ent.x, ent.y, hw, -hh, rad);
      if (Math.hypot(pt.x - cor.x, pt.y - cor.y) <= tol) return { mode: 'resize-corner' };

      const top = this.toWorld(ent.x, ent.y, 0, -hh, rad);
      const bot = this.toWorld(ent.x, ent.y, 0, hh, rad);
      if (Math.hypot(pt.x - top.x, pt.y - top.y) <= tol || Math.hypot(pt.x - bot.x, pt.y - bot.y) <= tol) {
        return { mode: 'resize-h' };
      }

      const right = this.toWorld(ent.x, ent.y, hw, 0, rad);
      const left = this.toWorld(ent.x, ent.y, -hw, 0, rad);
      if (Math.hypot(pt.x - right.x, pt.y - right.y) <= tol || Math.hypot(pt.x - left.x, pt.y - left.y) <= tol) {
        return { mode: 'resize-w' };
      }
    } else if (ent._isEmitter) {
      const aim = { x: ent.x + Math.cos(rad) * 36, y: ent.y + Math.sin(rad) * 36 };
      if (Math.hypot(pt.x - aim.x, pt.y - aim.y) <= tol) return { mode: 'aim' };
    } else if (ent.type === 'black_hole') {
      const r = ent.radius || 24;
      const rh = { x: ent.x + r, y: ent.y };
      if (Math.hypot(pt.x - rh.x, pt.y - rh.y) <= tol) return { mode: 'resize-radius' };
    } else if (ent.type === 'mirror' || ent.type === 'portal') {
      const hl = (ent.length || 80) / 2;
      const rot = this.toWorld(ent.x, ent.y, 0, -hl - 20, rad);
      if (Math.hypot(pt.x - rot.x, pt.y - rot.y) <= tol) return { mode: 'rotate' };
      const tip = this.toWorld(ent.x, ent.y, hl, 0, rad);
      if (Math.hypot(pt.x - tip.x, pt.y - tip.y) <= tol) return { mode: 'resize-length' };
    }

    return null;
  },

  hitTestBody(pt, ent) {
    const rad = ((ent.angle || 0) * Math.PI) / 180;
    const lox = (pt.x - ent.x) * Math.cos(rad) + (pt.y - ent.y) * Math.sin(rad);
    const loy = -(pt.x - ent.x) * Math.sin(rad) + (pt.y - ent.y) * Math.cos(rad);

    if (ent.type === 'wall') {
      const hw = (ent.width || 30) / 2 + 10;
      const hh = (ent.height || 120) / 2 + 10;
      return Math.abs(lox) <= hw && Math.abs(loy) <= hh;
    }
    const hitRadius = ent.radius || (ent.side ? ent.side / 2 : 24);
    return Math.hypot(pt.x - ent.x, pt.y - ent.y) <= hitRadius + 10;
  },

  render(ctx, ent) {
    if (!ent) return;
    const rad = ((ent.angle || 0) * Math.PI) / 180;

    ctx.save();
    ctx.translate(ent.x, ent.y);
    ctx.rotate(rad);

    if (ent.type === 'wall') {
      const hw = (ent.width || 30) / 2;
      const hh = (ent.height || 120) / 2;

      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(-hw - 4, -hh - 4, (hw + 4) * 2, (hh + 4) * 2);
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.moveTo(0, -hh - 4);
      ctx.lineTo(0, -hh - 24);
      ctx.strokeStyle = '#00f0ff';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, -hh - 24, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#00f0ff';
      ctx.fill();

      this.drawSquareHandle(ctx, 0, -hh);
      this.drawSquareHandle(ctx, 0, hh);
      this.drawSquareHandle(ctx, hw, 0);
      this.drawSquareHandle(ctx, -hw, 0);
      this.drawSquareHandle(ctx, hw, -hh);

      this.drawBadge(ctx, 0, hh + 22, `${ent.width || 30}×${ent.height || 120} | ${ent.angle || 0}°`);
    } else if (ent._isEmitter) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(36, 0);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(36, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#00f0ff';
      ctx.fill();

      this.drawBadge(ctx, 0, 26, `ANG: ${ent.angle || 0}°`);
    } else if (ent.type === 'black_hole') {
      const r = ent.radius || 24;
      ctx.strokeStyle = '#00f0ff';
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(-r - 4, -r - 4, (r + 4) * 2, (r + 4) * 2);
      ctx.setLineDash([]);
      this.drawSquareHandle(ctx, r, 0);
      this.drawBadge(ctx, 0, r + 18, `R: ${r}px`);
    } else {
      ctx.strokeStyle = '#00f0ff';
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(-28, -28, 56, 56);
      ctx.setLineDash([]);
      this.drawBadge(ctx, 0, 38, `X:${Math.round(ent.x)} Y:${Math.round(ent.y)}`);
    }

    ctx.restore();
  },

  drawSquareHandle(ctx, x, y) {
    ctx.fillStyle = '#020612';
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.5;
    ctx.fillRect(x - 4, y - 4, 8, 8);
    ctx.strokeRect(x - 4, y - 4, 8, 8);
  },

  drawBadge(ctx, x, y, text) {
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const tw = ctx.measureText(text).width;
    ctx.fillStyle = '#020612';
    ctx.fillRect(x - tw / 2 - 4, y - 7, tw + 8, 14);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - tw / 2 - 4, y - 7, tw + 8, 14);
    ctx.fillStyle = '#00f0ff';
    ctx.fillText(text, x, y);
  }
};