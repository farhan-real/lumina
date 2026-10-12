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
      // Deflect ray towards black hole center
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
  }
};