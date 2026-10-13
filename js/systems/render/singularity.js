window.Lumina = window.Lumina || {};

window.Lumina.SingularityView = {
  render(ctx, el) {
    const r = el.radius || 26;

    ctx.save();

    // 1. Tilted Elliptical Coordinate Space (-12° inclination)
    ctx.save();
    ctx.rotate((-12 * Math.PI) / 180);
    ctx.scale(1.0, 0.46);

    // 2. Seamless Continuous Fiery Accretion Disk (Single unified radial gradient)
    const diskGrad = ctx.createRadialGradient(0, 0, r * 0.85, 0, 0, r * 2.85);
    diskGrad.addColorStop(0.00, 'rgba(255, 255, 255, 1.0)');
    diskGrad.addColorStop(0.12, 'rgba(254, 240, 138, 0.95)');
    diskGrad.addColorStop(0.32, 'rgba(245, 158, 11, 0.85)');
    diskGrad.addColorStop(0.58, 'rgba(234, 88, 12, 0.55)');
    diskGrad.addColorStop(0.82, 'rgba(180, 40, 10, 0.20)');
    diskGrad.addColorStop(1.00, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = diskGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.85, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 3. Pure Obsidian Event Horizon Void (Perfect circular shadow on top)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // 4. Razor-Sharp Photon Sphere Ring (Crisp, brilliant caustic boundary)
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.65)';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(0, 0, r + 0.6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(0, 0, r + 0.2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
};