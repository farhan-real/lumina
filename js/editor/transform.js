window.Lumina = window.Lumina || {};

window.Lumina.EditorTransform = {
  mode: 'idle',
  target: null,
  dragOffset: { x: 0, y: 0 },

  getBounds(ent) {
    if (!ent) return { hw: 40, hh: 40 };
    const def = window.Lumina.Elements[ent.type?.toUpperCase()] || {};
    if (ent.type === 'wall') {
      return { hw: (ent.width || def.width || 30) / 2, hh: (ent.height || def.height || 120) / 2 };
    }
    if (ent.type === 'lens_convex' || ent.type === 'lens_concave') {
      return { hw: 18, hh: (ent.height || def.height || 160) / 2 };
    }
    if (ent.type === 'mirror' || ent.type === 'mirror_concave' || ent.type === 'mirror_convex' || ent.type === 'portal') {
      const defLen = def.length || (ent.type === 'portal' ? 70 : (ent.type === 'mirror' ? 80 : 90));
      return { hw: (ent.length || defLen) / 2, hh: 12 };
    }
    if (ent._isSensor || ent.type === 'black_hole') {
      const r = ent.radius || def.radius || 24;
      return { hw: r + 4, hh: r + 4 };
    }
    const sz = (ent.side || ent.size || def.side || def.size || 50) / 2;
    return { hw: sz, hh: sz };
  },

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
      ent.height = Math.max(30, Math.min(500, Math.round(Math.abs(loy) * 2)));
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
      ent.radius = Math.max(14, Math.min(80, Math.round(dist)));
    } else if (this.mode === 'resize-length') {
      const dist = Math.hypot(pt.x - ent.x, pt.y - ent.y);
      ent.length = Math.max(30, Math.min(400, Math.round(dist * 2)));
    }

    if (window.Lumina.EditorUI?.syncValues) window.Lumina.EditorUI.syncValues(ent);
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
    const tol = 12;
    const { hw, hh } = this.getBounds(ent);

    // Rotation handle is functional in both gameplay and editor
    if (ent.rotatable !== false && !ent._isSensor && ent.type !== 'black_hole') {
      const rot = this.toWorld(ent.x, ent.y, 0, -hh - 24, rad);
      if (Math.hypot(pt.x - rot.x, pt.y - rot.y) <= tol) return { mode: 'rotate' };
    }

    if (ent._isEmitter) {
      const aim = { x: ent.x + Math.cos(rad) * 36, y: ent.y + Math.sin(rad) * 36 };
      if (Math.hypot(pt.x - aim.x, pt.y - aim.y) <= tol) return { mode: 'aim' };
    }

    // Resizing is disabled while playing; allowed only in editor mode
    if (window.Lumina.Game?.currentScreen === 'gameplay') {
      return null;
    }

    if (ent.type === 'wall') {
      const cor = this.toWorld(ent.x, ent.y, hw, -hh, rad);
      if (Math.hypot(pt.x - cor.x, pt.y - cor.y) <= tol) return { mode: 'resize-corner' };
      const top = this.toWorld(ent.x, ent.y, 0, -hh, rad);
      const bot = this.toWorld(ent.x, ent.y, 0, hh, rad);
      if (Math.hypot(pt.x - top.x, pt.y - top.y) <= tol || Math.hypot(pt.x - bot.x, pt.y - bot.y) <= tol) return { mode: 'resize-h' };
      const right = this.toWorld(ent.x, ent.y, hw, 0, rad);
      const left = this.toWorld(ent.x, ent.y, -hw, 0, rad);
      if (Math.hypot(pt.x - right.x, pt.y - right.y) <= tol || Math.hypot(pt.x - left.x, pt.y - left.y) <= tol) return { mode: 'resize-w' };
    } else if (ent.type === 'lens_convex' || ent.type === 'lens_concave') {
      const top = this.toWorld(ent.x, ent.y, 0, -hh, rad);
      const bot = this.toWorld(ent.x, ent.y, 0, hh, rad);
      if (Math.hypot(pt.x - top.x, pt.y - top.y) <= tol || Math.hypot(pt.x - bot.x, pt.y - bot.y) <= tol) return { mode: 'resize-h' };
    } else if (ent.type === 'mirror' || ent.type === 'mirror_concave' || ent.type === 'mirror_convex' || ent.type === 'portal') {
      const tipR = this.toWorld(ent.x, ent.y, hw, 0, rad);
      const tipL = this.toWorld(ent.x, ent.y, -hw, 0, rad);
      if (Math.hypot(pt.x - tipR.x, pt.y - tipR.y) <= tol || Math.hypot(pt.x - tipL.x, pt.y - tipL.y) <= tol) return { mode: 'resize-length' };
    } else if (ent._isSensor || ent.type === 'black_hole') {
      const rh = this.toWorld(ent.x, ent.y, hw, 0, rad);
      if (Math.hypot(pt.x - rh.x, pt.y - rh.y) <= tol) return { mode: 'resize-radius' };
    }
    return null;
  },

  hitTestBody(pt, ent) {
    const rad = ((ent.angle || 0) * Math.PI) / 180;
    const lox = (pt.x - ent.x) * Math.cos(rad) + (pt.y - ent.y) * Math.sin(rad);
    const loy = -(pt.x - ent.x) * Math.sin(rad) + (pt.y - ent.y) * Math.cos(rad);
    const { hw, hh } = this.getBounds(ent);
    return Math.abs(lox) <= hw + 8 && Math.abs(loy) <= hh + 8;
  },

  render(ctx, ent) {
    if (!ent) return;
    const rad = ((ent.angle || 0) * Math.PI) / 180;
    const { hw, hh } = this.getBounds(ent);
    const isGameplay = window.Lumina.Game?.currentScreen === 'gameplay';
    const def = window.Lumina.Elements[ent.type?.toUpperCase()] || {};

    ctx.save();
    ctx.translate(ent.x, ent.y);
    ctx.rotate(rad);

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(-hw - 4, -hh - 4, (hw + 4) * 2, (hh + 4) * 2);
    ctx.setLineDash([]);

    if (ent.rotatable !== false && !ent._isSensor && ent.type !== 'black_hole') {
      ctx.beginPath();
      ctx.moveTo(0, -hh - 4);
      ctx.lineTo(0, -hh - 24);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, -hh - 24, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#020612';
      ctx.fill();
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Resize square handles are drawn only in editor mode
    if (!isGameplay) {
      if (ent.type === 'wall') {
        this.drawSquareHandle(ctx, 0, -hh);
        this.drawSquareHandle(ctx, 0, hh);
        this.drawSquareHandle(ctx, hw, 0);
        this.drawSquareHandle(ctx, -hw, 0);
        this.drawSquareHandle(ctx, hw, -hh);
      } else if (ent.type === 'lens_convex' || ent.type === 'lens_concave') {
        this.drawSquareHandle(ctx, 0, -hh);
        this.drawSquareHandle(ctx, 0, hh);
      } else if (ent.type === 'mirror' || ent.type === 'mirror_concave' || ent.type === 'mirror_convex' || ent.type === 'portal') {
        this.drawSquareHandle(ctx, -hw, 0);
        this.drawSquareHandle(ctx, hw, 0);
      } else if (ent._isSensor || ent.type === 'black_hole') {
        this.drawSquareHandle(ctx, hw, 0);
      }
    }

    let badgeText = '';
    if (ent.type === 'wall') {
      badgeText = `${ent.width || def.width || 30}×${ent.height || def.height || 120} | ${ent.angle || 0}°`;
    } else if (ent.type === 'lens_convex' || ent.type === 'lens_concave') {
      const hVal = ent.height || def.height || 160;
      badgeText = `H: ${hVal}px | ${ent.angle || 0}°`;
    } else if (ent.type === 'mirror' || ent.type === 'mirror_concave' || ent.type === 'mirror_convex' || ent.type === 'portal') {
      const defLen = def.length || (ent.type === 'portal' ? 70 : (ent.type === 'mirror' ? 80 : 90));
      const lVal = ent.length || defLen;
      badgeText = `L: ${lVal}px | ${ent.angle || 0}°`;
    } else if (ent._isSensor || ent.type === 'black_hole') {
      const rVal = ent.radius || def.radius || 24;
      badgeText = `R: ${rVal}px`;
    } else if (ent._isEmitter) {
      badgeText = `ANG: ${ent.angle || 0}°`;
    }

    if (badgeText) {
      this.drawBadge(ctx, 0, hh + 20, badgeText);
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