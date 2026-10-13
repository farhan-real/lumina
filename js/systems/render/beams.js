window.Lumina = window.Lumina || {};

window.Lumina.BeamRenderer = {
  render(ctx, rayPool, count) {
    if (!ctx || count === 0) return;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // 1. Broad Outer Glow Pass
    this.drawChainedPass(ctx, rayPool, count, 10, (ray) => {
      const r = Math.floor(ray.r * 255);
      const g = Math.floor(ray.g * 255);
      const b = Math.floor(ray.b * 255);
      return `rgba(${r},${g},${b},${0.2 * ray.intensity})`;
    });

    // 2. Focused Core Pass
    this.drawChainedPass(ctx, rayPool, count, 2.5, (ray) => {
      const r = Math.floor(ray.r * 255);
      const g = Math.floor(ray.g * 255);
      const b = Math.floor(ray.b * 255);
      return `rgba(${r},${g},${b},${0.9 * ray.intensity})`;
    });

    // 3. Crisp White Centerline Pass
    this.drawChainedPass(ctx, rayPool, count, 1, () => 'rgba(255, 255, 255, 0.9)');

    ctx.restore();
  },

  drawChainedPass(ctx, rayPool, count, width, colorFn) {
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let curColor = '';
    let inPath = false;

    for (let i = 0; i < count; i++) {
      const ray = rayPool[i];
      const col = colorFn(ray);

      if (col !== curColor || !inPath) {
        if (inPath) ctx.stroke();
        curColor = col;
        ctx.strokeStyle = col;
        ctx.beginPath();
        ctx.moveTo(ray.x1, ray.y1);
        ctx.lineTo(ray.x2, ray.y2);
        inPath = true;
      } else {
        const prev = rayPool[i - 1];
        if (Math.hypot(ray.x1 - prev.x2, ray.y1 - prev.y2) < 1.0) {
          ctx.lineTo(ray.x2, ray.y2);
        } else {
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(ray.x1, ray.y1);
          ctx.lineTo(ray.x2, ray.y2);
        }
      }
    }

    if (inPath) ctx.stroke();
  }
};