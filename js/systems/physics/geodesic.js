window.Lumina = window.Lumina || {};

window.Lumina.Geodesic = {
  GRAV_RADIUS: 260,

  traverseBlackHole(rx, ry, rdx, rdy, bh, maxStraightT, obstacleChecker) {
    const ox = bh.x - rx;
    const oy = bh.y - ry;
    const proj = ox * rdx + oy * rdy;
    const rGrav = bh.gravRadius || this.GRAV_RADIUS;
    const rAbs = bh.radius || 26;

    if (proj <= 1.0) {
      const dist = Math.hypot(ox, oy);
      if (dist <= rAbs && maxStraightT > 0.05) {
        return {
          started: true,
          absorbed: true,
          points: [{ x: rx, y: ry }, { x: rx + rdx * 0.1, y: ry + rdy * 0.1 }]
        };
      }
      return null;
    }

    const perpSq = (ox * ox + oy * oy) - proj * proj;
    if (perpSq >= rGrav * rGrav || perpSq < 0) return null;

    const halfFieldChord = Math.sqrt(Math.max(0, rGrav * rGrav - perpSq));
    const tEnter = Math.max(0, proj - halfFieldChord);

    if (tEnter >= maxStraightT) return null;

    const enterX = rx + tEnter * rdx;
    const enterY = ry + tEnter * rdy;

    const points = [];
    if (tEnter > 1.0) {
      points.push({ x: rx, y: ry });
    }
    points.push({ x: enterX, y: enterY });

    let cx = enterX;
    let cy = enterY;
    let cdx = rdx;
    let cdy = rdy;
    const stepSize = 22;
    let absorbed = false;
    let hitObstacle = null;
    const tempOut = { t: 0, nx: 0, ny: 0, el: null };

    for (let step = 0; step < 22; step++) {
      const toBhX = bh.x - cx;
      const toBhY = bh.y - cy;
      const distSq = toBhX * toBhX + toBhY * toBhY;
      const dist = Math.sqrt(distSq);

      if (dist <= rAbs) {
        absorbed = true;
        break;
      }

      if (dist < rGrav) {
        const falloff = Math.pow(1.0 - (dist - rAbs) / (rGrav - rAbs), 1.35);
        const force = 0.52 * falloff;
        cdx += (toBhX / dist) * force;
        cdy += (toBhY / dist) * force;
        const norm = Math.hypot(cdx, cdy) || 1;
        cdx /= norm;
        cdy /= norm;
      } else if (step > 2) {
        const dotAway = (cx - bh.x) * cdx + (cy - bh.y) * cdy;
        if (dotAway > 0) break;
      }

      const nextX = cx + cdx * stepSize;
      const nextY = cy + cdy * stepSize;

      if (obstacleChecker(cx, cy, cdx, cdy, tempOut)) {
        if (tempOut.t > 0.05 && tempOut.t < stepSize) {
          const obX = cx + cdx * tempOut.t;
          const obY = cy + cdy * tempOut.t;
          points.push({ x: obX, y: obY });
          hitObstacle = {
            el: tempOut.el,
            x: obX,
            y: obY,
            nx: tempOut.nx,
            ny: tempOut.ny,
            dx: cdx,
            dy: cdy
          };
          break;
        }
      }

      cx = nextX;
      cy = nextY;
      points.push({ x: cx, y: cy });
    }

    return {
      started: true,
      points,
      absorbed,
      hitObstacle,
      finalDx: cdx,
      finalDy: cdy
    };
  },

  mapPortal(hx, hy, dx, dy, srcPortal, dstPortal, out) {
    const srcAngle = ((srcPortal.angle || 0) * Math.PI) / 180;
    const dstAngle = ((dstPortal.angle || 0) * Math.PI) / 180;
    const deltaAngle = dstAngle - srcAngle;

    const relX = hx - srcPortal.x;
    const relY = hy - srcPortal.y;

    const cosD = Math.cos(deltaAngle);
    const sinD = Math.sin(deltaAngle);

    out.dx = dx * cosD - dy * sinD;
    out.dy = dx * sinD + dy * cosD;

    const exitX = dstPortal.x + (relX * cosD - relY * sinD);
    const exitY = dstPortal.y + (relX * sinD + relY * cosD);

    out.x = exitX + out.dx * 3;
    out.y = exitY + out.dy * 3;
  }
};