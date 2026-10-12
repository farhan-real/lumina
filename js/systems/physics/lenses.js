window.Lumina = window.Lumina || {};

window.Lumina.Lenses = {
  // Returns the physical aperture segment perpendicular to the lens optical axis
  getApertureSegment(lens) {
    const rad = ((lens.angle || 0) * Math.PI) / 180;
    const halfH = (lens.height || 160) / 2;
    const sinA = Math.sin(rad);
    const cosA = Math.cos(rad);
    return {
      x1: lens.x + sinA * halfH,
      y1: lens.y - cosA * halfH,
      x2: lens.x - sinA * halfH,
      y2: lens.y + cosA * halfH
    };
  },

  // Calculates thin-lens deflection using forward-transmitting optical mechanics
  calculateDeflection(lens, hitX, hitY, dx, dy, out) {
    const rad = ((lens.angle || 0) * Math.PI) / 180;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);

    // Transverse displacement along the lens aperture (-sinA, cosA)
    const h = (hitX - lens.x) * (-sinA) + (hitY - lens.y) * cosA;

    const isConvex = lens.type === 'lens_convex';
    const focalLength = isConvex ? 250 : -180;

    // Check whether ray propagates through the lens in the forward or reverse direction
    const forwardProj = dx * cosA + dy * sinA;
    const forwardSign = forwardProj >= 0 ? 1 : -1;

    // Single-argument atan prevents negative focal lengths from flipping the ray 180 degrees
    const deflection = -forwardSign * Math.atan(h / focalLength);

    const rayAngle = Math.atan2(dy, dx);
    const finalAngle = rayAngle + deflection;

    out.dx = Math.cos(finalAngle);
    out.dy = Math.sin(finalAngle);
  }
};