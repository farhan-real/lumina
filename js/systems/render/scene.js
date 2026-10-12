window.Lumina = window.Lumina || {};

window.Lumina.SceneView = {
  renderScene(ctx, emitters, elements, sensors) {
    this.renderEmitters(ctx, emitters);
    this.renderSensors(ctx, sensors);
    for (let i = 0; i < elements.length; i++) {
      this.renderElement(ctx, elements[i]);
    }

    if (window.Lumina.Game.currentScreen === 'editor' && !window.Lumina.Editor.isTestMode) {
      window.Lumina.EditorTransform.render(ctx, window.Lumina.Editor.selectedEntity);
    }
  },

  renderEmitters(ctx, emitters) {
    for (let i = 0; i < emitters.length; i++) {
      const em = emitters[i];
      ctx.save();
      ctx.translate(em.x, em.y);
      ctx.rotate((em.angle * Math.PI) / 180);

      ctx.fillStyle = '#061024';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(-18, -12, 30, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(12, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },

  renderSensors(ctx, sensors) {
    const colorMap = {
      red: '#ff3366', green: '#00f5a0', blue: '#2299ff',
      cyan: '#00e5ff', amber: '#fbbf24', violet: '#bd00ff', any: '#ffffff'
    };

    for (let i = 0; i < sensors.length; i++) {
      const s = sensors[i];
      const hasReqs = s.requirements && s.requirements.length > 0;
      const totalReq = hasReqs ? s.requirements.reduce((acc, r) => acc + (r.count || 1), 0) : (s.requiredBeams || 1);
      const hits = s.currentHits || 0;
      const isCharging = hits > 0 && !s.active;

      ctx.save();
      ctx.translate(s.x, s.y);

      // 1. Tactical Brackets
      ctx.strokeStyle = s.active ? '#00f5a0' : (isCharging ? '#fbbf24' : '#38bdf8');
      ctx.lineWidth = 1.8;
      const b = 28, bl = 7;
      ctx.beginPath();
      ctx.moveTo(-b, -b + bl); ctx.lineTo(-b, -b); ctx.lineTo(-b + bl, -b);
      ctx.moveTo(b - bl, -b); ctx.lineTo(b, -b); ctx.lineTo(b, -b + bl);
      ctx.moveTo(-b, b - bl); ctx.lineTo(-b, b); ctx.lineTo(-b + bl, b);
      ctx.moveTo(b - bl, b); ctx.lineTo(b, b); ctx.lineTo(b, b - bl);
      ctx.stroke();

      // 2. Optical Well
      ctx.fillStyle = s.active ? 'rgba(0, 245, 160, 0.25)' : (isCharging ? 'rgba(251, 191, 36, 0.15)' : 'rgba(0, 0, 0, 0.85)');
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();

      // 3. Spectral Wavelength Rings
      if (hasReqs && s.requirements.length >= 2) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = colorMap[s.requirements[0].color] || '#ffffff';
        ctx.beginPath(); ctx.arc(0, 0, 22, Math.PI, 0); ctx.stroke();
        ctx.strokeStyle = colorMap[s.requirements[1].color] || '#ffffff';
        ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI); ctx.stroke();
      } else {
        const singleColor = hasReqs ? s.requirements[0].color : (s.requiredColor || 'any');
        ctx.strokeStyle = s.active ? '#00f5a0' : (isCharging ? '#fbbf24' : (colorMap[singleColor] || '#ffffff'));
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.stroke();
      }

      if (totalReq > 1) {
        ctx.strokeStyle = s.active ? '#00f5a0' : (isCharging ? '#fbbf24' : '#38bdf8');
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.stroke();
      }

      // 4. Center Core
      ctx.fillStyle = s.active ? '#ffffff' : (isCharging ? '#fbbf24' : '#38bdf8');
      ctx.beginPath();
      ctx.arc(0, 0, s.active ? 8.5 : 5.5, 0, Math.PI * 2);
      ctx.fill();

      // 5. Badge Label
      let labelText = '';
      if (hasReqs) {
        labelText = 'λ ' + s.requirements.map(r => `${r.count}x${r.color.substring(0, 3).toUpperCase()}`).join('+');
      } else {
        labelText = s.requiredColor === 'any' ? 'λ ANY' : `λ ${(s.requiredColor || '').toUpperCase()}`;
      }
      if (totalReq > 1) labelText += ` [${hits}/${totalReq}]`;

      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const tw = ctx.measureText(labelText).width;
      ctx.fillStyle = '#020612';
      ctx.fillRect(-tw / 2 - 4, 32, tw + 8, 14);
      ctx.strokeStyle = s.active ? '#00f5a0' : (isCharging ? '#fbbf24' : '#38bdf8');
      ctx.lineWidth = 1;
      ctx.strokeRect(-tw / 2 - 4, 32, tw + 8, 14);
      ctx.fillStyle = s.active ? '#00f5a0' : (isCharging ? '#fbbf24' : '#38bdf8');
      ctx.fillText(labelText, 0, 39);

      ctx.restore();
    }
  },

  renderElement(ctx, el) {
    ctx.save();
    ctx.translate(el.x, el.y);
    ctx.rotate(((el.angle || 0) * Math.PI) / 180);

    if (el.type === 'mirror') {
      const hl = (el.length || 80) / 2;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.strokeStyle = '#e0f4ff';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-hl, -3, el.length || 80, 6);
      ctx.fillRect(-hl, -3, el.length || 80, 6);
    } else if (el.type === 'prism') {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -35); ctx.lineTo(35, 30); ctx.lineTo(-35, 30);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    } else if (el.type === 'lens_convex') {
      const hh = (el.height || 160) / 2;
      ctx.fillStyle = 'rgba(0, 240, 255, 0.18)';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -hh);
      ctx.quadraticCurveTo(18, 0, 0, hh);
      ctx.quadraticCurveTo(-18, 0, 0, -hh);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    } else if (el.type === 'lens_concave') {
      const hh = (el.height || 160) / 2;
      ctx.fillStyle = 'rgba(0, 240, 255, 0.14)';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-16, -hh); ctx.lineTo(16, -hh);
      ctx.quadraticCurveTo(5, 0, 16, hh);
      ctx.lineTo(-16, hh);
      ctx.quadraticCurveTo(-5, 0, -16, -hh);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    } else if (el.type === 'beam_splitter') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.strokeRect(-25, -25, 50, 50);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-25, 25); ctx.lineTo(25, -25);
      ctx.stroke();
    } else if (el.type === 'portal') {
      const hl = (el.length || 70) / 2;
      ctx.strokeStyle = '#bd00ff';
      ctx.fillStyle = 'rgba(189, 0, 255, 0.15)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, hl, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    } else if (el.type === 'wall') {
      const w = el.width || 30;
      const h = el.height || 120;
      ctx.fillStyle = '#060b17';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
    }
    ctx.restore();
  }
};

window.Lumina.OpticsView = window.Lumina.SceneView;