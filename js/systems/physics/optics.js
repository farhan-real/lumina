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
    if (t > 0.05 && u >= -eps && u <= 1.0 + eps) {
      out.t = t;
      out.x = rx + t * rdx;
      out.y = ry + t * rdy;
      const len = Math.hypot(sx, sy) || 1;
      let nx = -sy / len;
      let ny = sx / len;
      if (rdx * nx + rdy * ny > 0) {
        nx = -nx;
        ny = -ny;
      }
      out.nx = nx;
      out.ny = ny;
      return true;
    }
    return false;
  },

  // Intersects ray against curved mirror arc ly = S * (1 - lx^2 / hl^2)
  intersectRayParabola(ox, oy, dx, dy, cx, cy, angleDeg, hl, S, out) {
    const rad = (angleDeg || 0) * (Math.PI / 180);
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);

    const relX = ox - cx;
    const relY = oy - cy;
    const lox = relX * cosA + relY * sinA;
    const loy = -relX * sinA + relY * cosA;
    const ldx = dx * cosA + dy * sinA;
    const ldy = -dx * sinA + dy * cosA;

    const hl2 = hl * hl;
    const A = (S * ldx * ldx) / hl2;
    const B = ldy + (2 * S * lox * ldx) / hl2;
    const C = loy - S + (S * lox * lox) / hl2;

    let bestT = Infinity;
    let bestLx = 0;

    if (Math.abs(A) < 1e-9) {
      if (Math.abs(B) > 1e-9) {
        const t = -C / B;
        if (t > 0.05) {
          const lx = lox + t * ldx;
          if (Math.abs(lx) <= hl + 1e-3) {
            bestT = t;
            bestLx = lx;
          }
        }
      }
    } else {
      const disc = B * B - 4 * A * C;
      if (disc >= 0) {
        const sDisc = Math.sqrt(disc);
        const t1 = (-B - sDisc) / (2 * A);
        const t2 = (-B + sDisc) / (2 * A);

        [t1, t2].forEach((t) => {
          if (t > 0.05 && t < bestT) {
            const lx = lox + t * ldx;
            if (Math.abs(lx) <= hl + 1e-3) {
              bestT = t;
              bestLx = lx;
            }
          }
        });
      }
    }

    if (bestT === Infinity) return false;

    out.t = bestT;
    out.x = ox + bestT * dx;
    out.y = oy + bestT * dy;

    // Normal to ly = S * (1 - lx^2 / hl^2)
    let lnx = (2 * S * bestLx) / hl2;
    let lny = 1;
    const nLen = Math.hypot(lnx, lny) || 1;
    lnx /= nLen;
    lny /= nLen;

    if (ldx * lnx + ldy * lny > 0) {
      lnx = -lnx;
      lny = -lny;
    }

    out.nx = lnx * cosA - lny * sinA;
    out.ny = lnx * sinA + lny * cosA;
    return true;
  },

  intersectRayBox(ox, oy, dx, dy, cx, cy, width, height, angleDeg, out) {
    const rad = (angleDeg || 0) * (Math.PI / 180);
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);
    const hw = (width || 30) / 2;
    const hh = (height || 120) / 2;

    const relX = ox - cx;
    const relY = oy - cy;
    const lox = relX * cosA + relY * sinA;
    const loy = -relX * sinA + relY * cosA;
    const ldx = dx * cosA + dy * sinA;
    const ldy = -dx * sinA + dy * cosA;

    if (Math.abs(lox) <= hw && Math.abs(loy) <= hh) {
      out.t = 0.001;
      out.x = ox;
      out.y = oy;
      out.nx = -dx;
      out.ny = -dy;
      return true;
    }

    let tmin = -Infinity;
    let tmax = Infinity;
    let hitNormalLocalX = 0;
    let hitNormalLocalY = 0;

    if (Math.abs(ldx) > 1e-9) {
      let t1 = (-hw - lox) / ldx;
      let t2 = (hw - lox) / ldx;
      let n1 = -1;
      if (t1 > t2) {
        const tmp = t1; t1 = t2; t2 = tmp;
        n1 = 1;
      }
      if (t1 > tmin) {
        tmin = t1;
        hitNormalLocalX = n1;
        hitNormalLocalY = 0;
      }
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return false;
    } else if (Math.abs(lox) > hw) return false;

    if (Math.abs(ldy) > 1e-9) {
      let t1 = (-hh - loy) / ldy;
      let t2 = (hh - loy) / ldy;
      let n1 = -1;
      if (t1 > t2) {
        const tmp = t1; t1 = t2; t2 = tmp;
        n1 = 1;
      }
      if (t1 > tmin) {
        tmin = t1;
        hitNormalLocalX = 0;
        hitNormalLocalY = n1;
      }
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return false;
    } else if (Math.abs(loy) > hh) return false;

    if (tmax < 0.05) return false;
    const t = tmin > 0.05 ? tmin : tmax;
    if (t <= 0.05) return false;

    out.t = t;
    out.x = ox + t * dx;
    out.y = oy + t * dy;
    out.nx = hitNormalLocalX * cosA - hitNormalLocalY * sinA;
    out.ny = hitNormalLocalX * sinA + hitNormalLocalY * cosA;
    return true;
  },

  getPrismEdges(x, y, angleDeg, side) {
    const rad = angleDeg * (Math.PI / 180);
    const h = (side * Math.sqrt(3)) / 2;
    const p1x = 0, p1y = (-2 * h) / 3;
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