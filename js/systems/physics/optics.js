window.Lumina = window.Lumina || {};

window.Lumina.OpticsMath = {
  reflect(dx, dy, nx, ny, out) {
    const dot = dx * nx + dy * ny;
    out.dx = dx - 2 * dot * nx;
    out.dy = dy - 2 * dot * ny;
  },

  intersectRaySegment(rx, ry, rdx, rdy, x1, y1, x2, y2, out) {
    const sx = x2 - x1;
    const sy = y2 - y1;
    const denom = rdx * sy - rdy * sx;
    if (Math.abs(denom) < 1e-7) return false;

    const qx = x1 - rx;
    const qy = y1 - ry;
    const t = (qx * sy - qy * sx) / denom;
    const u = (qx * rdy - qy * rdx) / denom;

    const eps = 1e-3;
    if (t > 0.5 && u >= -eps && u <= 1.0 + eps) {
      out.t = t;
      out.x = rx + t * rdx;
      out.y = ry + t * rdy;
      const len = Math.hypot(sx, sy) || 1;
      out.nx = -sy / len;
      out.ny = sx / len;
      return true;
    }
    return false;
  },

  getWallEdges(x, y, width, height, angleDeg) {
    const rad = (angleDeg || 0) * (Math.PI / 180);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const hw = (width || 30) / 2;
    const hh = (height || 120) / 2;

    const toWorld = (lx, ly) => ({
      x: x + lx * cos - ly * sin,
      y: y + lx * sin + ly * cos
    });

    const p1 = toWorld(-hw, -hh);
    const p2 = toWorld(hw, -hh);
    const p3 = toWorld(hw, hh);
    const p4 = toWorld(-hw, hh);

    return [
      { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y },
      { x1: p2.x, y1: p2.y, x2: p3.x, y2: p3.y },
      { x1: p3.x, y1: p3.y, x2: p4.x, y2: p4.y },
      { x1: p4.x, y1: p4.y, x2: p1.x, y2: p1.y }
    ];
  },

  getPrismEdges(x, y, angleDeg, side) {
    const rad = angleDeg * (Math.PI / 180);
    const h = side * Math.sqrt(3) / 2;
    const p1x = 0, p1y = -2 * h / 3;
    const p2x = side / 2, p2y = h / 3;
    const p3x = -side / 2, p3y = h / 3;

    const rotatePoint = (px, py) => ({
      x: x + px * Math.cos(rad) - py * Math.sin(rad),
      y: y + px * Math.sin(rad) + py * Math.cos(rad)
    });

    const v1 = rotatePoint(p1x, p1y);
    const v2 = rotatePoint(p2x, p2y);
    const v3 = rotatePoint(p3x, p3y);

    return [
      { x1: v1.x, y1: v1.y, x2: v2.x, y2: v2.y },
      { x1: v2.x, y1: v2.y, x2: v3.x, y2: v3.y },
      { x1: v3.x, y1: v3.y, x2: v1.x, y2: v1.y }
    ];
  }
};