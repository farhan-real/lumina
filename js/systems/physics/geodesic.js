window.Lumina = window.Lumina || {};

window.Lumina.Geodesic = {
  checkBlackHole(rx, ry, rdx, rdy, bh) {
    const ox = bh.x - rx;
    const oy = bh.y - ry;
    const proj = ox * rdx + oy * rdy;
    if (proj <= 0) return null;

    const perpX = rx + proj * rdx - bh.x;
    const perpY = ry + proj * rdy - bh.y;
    const dist = Math.hypot(perpX, perpY);

    if (dist < bh.radius) {
      return { absorbed: true, x: rx + proj * rdx, y: ry + proj * rdy };
    }

    if (dist < bh.radius * 4.5) {
      const defFactor = 0.5 * (1.0 - dist / (bh.radius * 4.5));
      const ndx = rdx + (ox / dist) * defFactor;
      const ndy = rdy + (oy / dist) * defFactor;
      const norm = Math.hypot(ndx, ndy) || 1;
      return {
        deflected: true,
        x: rx + proj * rdx,
        y: ry + proj * rdy,
        dx: ndx / norm,
        dy: ndy / norm
      };
    }
    return null;
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