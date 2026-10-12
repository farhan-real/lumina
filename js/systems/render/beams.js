window.Lumina = window.Lumina || {};

window.Lumina.BeamRenderer = {
  render(ctx, rayPool, count) {
    if (!ctx || count === 0) return;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';

    // Outer Glow
    for (let i = 0; i < count; i++) {
      const ray = rayPool[i];
      const r = Math.floor(ray.r * 255);
      const g = Math.floor(ray.g * 255);
      const b = Math.floor(ray.b * 255);
      ctx.strokeStyle = `rgba(${r},${g},${b},${0.2 * ray.intensity})`;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(ray.x1, ray.y1);
      ctx.lineTo(ray.x2, ray.y2);
      ctx.stroke();
    }

    // Concentrated Core
    for (let i = 0; i < count; i++) {
      const ray = rayPool[i];
      const r = Math.floor(ray.r * 255);
      const g = Math.floor(ray.g * 255);
      const b = Math.floor(ray.b * 255);
      ctx.strokeStyle = `rgba(${r},${g},${b},${0.9 * ray.intensity})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(ray.x1, ray.y1);
      ctx.lineTo(ray.x2, ray.y2);
      ctx.stroke();
    }

    // White Centerline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const ray = rayPool[i];
      ctx.moveTo(ray.x1, ray.y1);
      ctx.lineTo(ray.x2, ray.y2);
    }
    ctx.stroke();

    ctx.restore();
  }
};