window.Lumina = window.Lumina || {};

window.Lumina.Collider = {
  getOBB(el) {
    const def = window.Lumina.Elements[el.type?.toUpperCase()] || {};
    let hw = 40;
    let hh = 40;

    if (el.type === 'wall') {
      hw = (el.width || def.width || 30) / 2;
      hh = (el.height || def.height || 120) / 2;
    } else if (el.type === 'lens_convex' || el.type === 'lens_concave') {
      hw = 16;
      hh = (el.height || def.height || 160) / 2;
    } else if (el.type === 'mirror') {
      hw = (el.length || def.length || 80) / 2;
      hh = 6;
    } else if (el.type === 'mirror_concave' || el.type === 'mirror_convex') {
      hw = (el.length || def.length || 90) / 2;
      hh = 12;
    } else if (el.type === 'portal') {
      hw = (el.length || def.length || 70) / 2;
      hh = 10;
    } else if (el.type === 'beam_splitter') {
      const sz = (el.size || def.size || 50) / 2;
      hw = sz;
      hh = sz;
    } else if (el.type === 'prism') {
      const s = el.side || def.side || 70;
      hw = s / 2;
      hh = (s * 0.866) / 2;
    } else if (el._isSensor || el.type === 'black_hole') {
      const r = el.radius || def.radius || 24;
      hw = r;
      hh = r;
    } else if (el._isEmitter) {
      hw = 18;
      hh = 14;
    }

    const rad = ((el.angle || 0) * Math.PI) / 180;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);

    const corners = [
      { x: el.x + (-hw) * cosA - (-hh) * sinA, y: el.y + (-hw) * sinA + (-hh) * cosA },
      { x: el.x + (hw) * cosA - (-hh) * sinA,  y: el.y + (hw) * sinA + (-hh) * cosA },
      { x: el.x + (hw) * cosA - (hh) * sinA,   y: el.y + (hw) * sinA + (hh) * cosA },
      { x: el.x + (-hw) * cosA - (hh) * sinA,  y: el.y + (-hw) * sinA + (hh) * cosA }
    ];

    const axes = [
      { x: cosA, y: sinA },
      { x: -sinA, y: cosA }
    ];

    return { corners, axes, center: { x: el.x, y: el.y }, hw, hh };
  },

  testOBBOverlap(obbA, obbB) {
    const axes = [
      obbA.axes[0],
      obbA.axes[1],
      obbB.axes[0],
      obbB.axes[1]
    ];

    let minOverlap = Infinity;
    let smallestAxis = null;

    for (let i = 0; i < axes.length; i++) {
      const axis = axes[i];
      let minA = Infinity, maxA = -Infinity;
      for (let j = 0; j < obbA.corners.length; j++) {
        const p = obbA.corners[j].x * axis.x + obbA.corners[j].y * axis.y;
        if (p < minA) minA = p;
        if (p > maxA) maxA = p;
      }

      let minB = Infinity, maxB = -Infinity;
      for (let j = 0; j < obbB.corners.length; j++) {
        const p = obbB.corners[j].x * axis.x + obbB.corners[j].y * axis.y;
        if (p < minB) minB = p;
        if (p > maxB) maxB = p;
      }

      if (maxA <= minB || maxB <= minA) {
        return null;
      }

      const overlap = Math.min(maxA - minB, maxB - minA);
      if (overlap < minOverlap) {
        minOverlap = overlap;
        smallestAxis = axis;
      }
    }

    const dirX = obbA.center.x - obbB.center.x;
    const dirY = obbA.center.y - obbB.center.y;
    const sign = (dirX * smallestAxis.x + dirY * smallestAxis.y) >= 0 ? 1 : -1;

    return {
      overlap: minOverlap,
      axis: { x: smallestAxis.x * sign, y: smallestAxis.y * sign }
    };
  },

  checkWallCollision(el, elements) {
    if (!el || !elements) return null;
    const obbEl = this.getOBB(el);

    for (let i = 0; i < elements.length; i++) {
      const item = elements[i];
      if (item === el || item.type !== 'wall') continue;

      const obbWall = this.getOBB(item);
      const hit = this.testOBBOverlap(obbEl, obbWall);
      if (hit) {
        return { wall: item, mtv: { x: hit.axis.x * hit.overlap, y: hit.axis.y * hit.overlap } };
      }
    }
    return null;
  },

  clampToRoom(el, roomW = 1000, roomH = 700) {
    const obb = this.getOBB(el);
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    for (let i = 0; i < obb.corners.length; i++) {
      const c = obb.corners[i];
      if (c.x < minX) minX = c.x;
      if (c.x > maxX) maxX = c.x;
      if (c.y < minY) minY = c.y;
      if (c.y > maxY) maxY = c.y;
    }

    const pad = 6;
    if (minX < pad) el.x += (pad - minX);
    if (maxX > roomW - pad) el.x -= (maxX - (roomW - pad));
    if (minY < pad) el.y += (pad - minY);
    if (maxY > roomH - pad) el.y -= (maxY - (roomH - pad));
  },

  resolveTranslation(el, elements, prevX, prevY, roomW, roomH) {
    this.clampToRoom(el, roomW, roomH);

    const col = this.checkWallCollision(el, elements);
    if (!col) return true;

    const targetX = el.x;
    const targetY = el.y;

    el.y = prevY;
    if (!this.checkWallCollision(el, elements)) {
      this.clampToRoom(el, roomW, roomH);
      return true;
    }

    el.x = prevX;
    el.y = targetY;
    if (!this.checkWallCollision(el, elements)) {
      this.clampToRoom(el, roomW, roomH);
      return true;
    }

    el.x = targetX + col.mtv.x;
    el.y = targetY + col.mtv.y;
    this.clampToRoom(el, roomW, roomH);
    if (!this.checkWallCollision(el, elements)) {
      return true;
    }

    el.x = prevX;
    el.y = prevY;
    return false;
  },

  resolveRotation(el, elements, prevAngle) {
    if (this.checkWallCollision(el, elements)) {
      el.angle = prevAngle;
      return false;
    }
    return true;
  },

  findSafeSpawn(sampleEl, elements, roomW = 1000, roomH = 700) {
    const testEl = { ...sampleEl, x: sampleEl.x, y: sampleEl.y };
    if (!this.checkWallCollision(testEl, elements)) {
      return { x: testEl.x, y: testEl.y };
    }

    const step = 36;
    for (let r = step; r <= Math.max(roomW, roomH); r += step) {
      for (let angle = 0; angle < 360; angle += 45) {
        const rad = (angle * Math.PI) / 180;
        testEl.x = Math.round(sampleEl.x + Math.cos(rad) * r);
        testEl.y = Math.round(sampleEl.y + Math.sin(rad) * r);
        this.clampToRoom(testEl, roomW, roomH);

        if (!this.checkWallCollision(testEl, elements)) {
          return { x: testEl.x, y: testEl.y };
        }
      }
    }

    return { x: sampleEl.x, y: sampleEl.y };
  }
};