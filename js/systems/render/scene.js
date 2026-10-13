window.Lumina = window.Lumina || {};

window.Lumina.SceneView = {
  renderScene(ctx, emitters, elements, sensors, selectedEntity = null) {
    this.renderEmitters(ctx, emitters);
    this.renderSensors(ctx, sensors);
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].type !== 'black_hole') this.renderElement(ctx, elements[i]);
    }
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].type === 'black_hole') this.renderElement(ctx, elements[i]);
    }

    if (selectedEntity && window.Lumina.EditorTransform?.render) {
      window.Lumina.EditorTransform.render(ctx, selectedEntity);
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
      const r = s.radius || 24;
      const b = r + 4;
      const bl = Math.max(5, Math.round(r * 0.28));
      const hasReqs = s.requirements && s.requirements.length > 0;
      const totalReq = hasReqs ? s.requirements.reduce((acc, rq) => acc + (rq.count || 1), 0) : (s.requiredBeams || 1);
      const hits = s.currentHits || 0;
      const isCharging = hits > 0 && !s.active;

      ctx.save();
      ctx.translate(s.x, s.y);

      ctx.strokeStyle = s.active ? '#00f5a0' : (isCharging ? '#fbbf24' : '#38bdf8');
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-b, -b + bl); ctx.lineTo(-b, -b); ctx.lineTo(-b + bl, -b);
      ctx.moveTo(b - bl, -b); ctx.lineTo(b, -b); ctx.lineTo(b, -b + bl);
      ctx.moveTo(-b, b - bl); ctx.lineTo(-b, b); ctx.lineTo(-b + bl, b);
      ctx.moveTo(b - bl, b); ctx.lineTo(b, b); ctx.lineTo(b, b - bl);
      ctx.stroke();

      ctx.fillStyle = s.active ? 'rgba(0, 245, 160, 0.25)' : (isCharging ? 'rgba(251, 191, 36, 0.15)' : 'rgba(0, 0, 0, 0.85)');
      ctx.beginPath();
      ctx.arc(0, 0, r - 2, 0, Math.PI * 2);
      ctx.fill();

      if (hasReqs && s.requirements.length >= 2) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = colorMap[s.requirements[0].color] || '#ffffff';
        ctx.beginPath(); ctx.arc(0, 0, r - 2, Math.PI, 0); ctx.stroke();
        ctx.strokeStyle = colorMap[s.requirements[1].color] || '#ffffff';
        ctx.beginPath(); ctx.arc(0, 0, r - 2, 0, Math.PI); ctx.stroke();
      } else {
        const singleColor = hasReqs ? s.requirements[0].color : (s.requiredColor || 'any');
        ctx.strokeStyle = s.active ? '#00f5a0' : (isCharging ? '#fbbf24' : (colorMap[singleColor] || '#ffffff'));
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, r - 2, 0, Math.PI * 2); ctx.stroke();
      }

      if (totalReq > 1) {
        ctx.strokeStyle = s.active ? '#00f5a0' : (isCharging ? '#fbbf24' : '#38bdf8');
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(0, 0, Math.max(8, r * 0.58), 0, Math.PI * 2); ctx.stroke();
      }

      ctx.fillStyle = s.active ? '#ffffff' : (isCharging ? '#fbbf24' : '#38bdf8');
      ctx.beginPath();
      const pipR = s.active ? Math.max(6, r * 0.36) : Math.max(4, r * 0.24);
      ctx.arc(0, 0, pipR, 0, Math.PI * 2);
      ctx.fill();

      let labelText = '';
      if (hasReqs) {
        labelText = 'λ ' + s.requirements.map((rq) => `${rq.count}x${rq.color.substring(0, 3).toUpperCase()}`).join('+');
      } else {
        labelText = s.requiredColor === 'any' ? 'λ ANY' : `λ ${(s.requiredColor || '').toUpperCase()}`;
      }
      if (totalReq > 1) labelText += ` [${hits}/${totalReq}]`;

      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const tw = ctx.measureText(labelText).width;
      const badgeY = r + 11;
      ctx.fillStyle = '#020612';
      ctx.fillRect(-tw / 2 - 4, badgeY - 7, tw + 8, 14);
      ctx.strokeStyle = s.active ? '#00f5a0' : (isCharging ? '#fbbf24' : '#38bdf8');
      ctx.lineWidth = 1;
      ctx.strokeRect(-tw / 2 - 4, badgeY - 7, tw + 8, 14);
      ctx.fillStyle = s.active ? '#00f5a0' : (isCharging ? '#fbbf24' : '#38bdf8');
      ctx.fillText(labelText, 0, badgeY);

      ctx.restore();
    }
  },

  renderElement(ctx, el) {
    ctx.save();
    ctx.translate(el.x, el.y);
    ctx.rotate(((el.angle || 0) * Math.PI) / 180);

    if (el.type === 'mirror') {
      const hl = (el.length || 80) / 2;
      ctx.strokeStyle = '#e0f4ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-hl, 0); ctx.lineTo(hl, 0); ctx.stroke();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-hl, 1.5); ctx.lineTo(hl, 1.5); ctx.stroke();
    } else if (el.type === 'mirror_concave' || el.type === 'mirror_convex') {
      const hl = (el.length || 90) / 2;
      const sag = (el.type === 'mirror_concave' ? 1 : -1) * Math.min(24, Math.max(8, hl * 0.28));
      ctx.strokeStyle = '#e0f4ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-hl, 0); ctx.quadraticCurveTo(0, 2 * sag, hl, 0); ctx.stroke();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-hl, sag * 0.4); ctx.quadraticCurveTo(0, 2 * sag + (sag > 0 ? 2 : -2), hl, sag * 0.4); ctx.stroke();
    } else if (el.type === 'prism') {
      const side = el.side || 70;
      const h = (side * Math.sqrt(3)) / 2;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, (-2 * h) / 3); ctx.lineTo(side / 2, h / 3); ctx.lineTo(-side / 2, h / 3); ctx.closePath();
      ctx.fill(); ctx.stroke();
    } else if (el.type === 'lens_convex') {
      const hh = (el.height || 160) / 2;
      const bulge = Math.min(26, Math.max(8, hh * 0.20));
      ctx.fillStyle = 'rgba(0, 240, 255, 0.18)';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -hh); ctx.quadraticCurveTo(bulge, 0, 0, hh); ctx.quadraticCurveTo(-bulge, 0, 0, -hh); ctx.closePath();
      ctx.fill(); ctx.stroke();
    } else if (el.type === 'lens_concave') {
      const hh = (el.height || 160) / 2;
      const hw = Math.min(24, Math.max(8, hh * 0.16));
      const waist = Math.max(3, hw * 0.28);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.14)';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-hw, -hh); ctx.lineTo(hw, -hh); ctx.quadraticCurveTo(waist, 0, hw, hh);
      ctx.lineTo(-hw, hh); ctx.quadraticCurveTo(-waist, 0, -hw, -hh); ctx.closePath();
      ctx.fill(); ctx.stroke();
    } else if (el.type === 'beam_splitter') {
      const sz = el.size || 50;
      const hs = sz / 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.strokeRect(-hs, -hs, sz, sz);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-hs, hs); ctx.lineTo(hs, -hs); ctx.stroke();
    } else if (el.type === 'portal') {
      const hl = (el.length || 70) / 2;
      ctx.strokeStyle = '#bd00ff';
      ctx.fillStyle = 'rgba(189, 0, 255, 0.15)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, hl, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    } else if (el.type === 'black_hole') {
      if (window.Lumina.SingularityView?.render) {
        window.Lumina.SingularityView.render(ctx, el);
      }
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