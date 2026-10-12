window.Lumina = window.Lumina || {};

window.Lumina.Lenses = {
  // Returns the physical aperture segment perpendicular to the lens optical axis
  getApertureSegment(lens) {
    const rad = (lens.angle || 0) * (Math.PI / 180);
    const halfH = (lens.height || 160) / 2;
    // At angle 0, the optical axis is horizontal (X), so the aperture stands vertically (Y)
    const sinA = Math.sin(rad);
    const cosA = Math.cos(rad);
    return {
      x1: lens.x + sinA * halfH,
      y1: lens.y - cosA * halfH,
      x2: lens.x - sinA * halfH,
      y2: lens.y + cosA * halfH
    };
  },

  // Calculates thin-lens deflection using optical transfer mechanics
  calculateDeflection(lens, hitX, hitY, dx, dy, out) {
    const rad = (lens.angle || 0) * (Math.PI / 180);
    const sinA = Math.sin(rad);
    const cosA = Math.cos(rad);

    // Optical aperture transverse coordinate (-sinA, cosA)
    const h = (hitX - lens.x) * (-sinA) + (hitY - lens.y) * cosA;

    const isConvex = lens.type === 'lens_convex';
    const focalLength = isConvex ? 250 : -180;

    // Incoming angle relative to lens optical axis
    const rayAngle = Math.atan2(dy, dx);
    const relIncidence = rayAngle - rad;

    // Thin-lens deflection formula
    const deflection = -Math.atan2(h, focalLength);
    const finalRelAngle = relIncidence + deflection;
    const finalWorldAngle = rad + finalRelAngle;

    out.dx = Math.cos(finalWorldAngle);
    out.dy = Math.sin(finalWorldAngle);
  }
};