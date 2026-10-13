window.Lumina = window.Lumina || {};

window.Lumina.HUDToolbar = {
  trayEl: null,

  init() {
    this.trayEl = document.getElementById('inventory-tray');
  },

  renderInventory(inventory) {
    if (!this.trayEl) return;
    this.trayEl.innerHTML = '';

    inventory.forEach((item) => {
      const elemDef = window.Lumina.Elements[item.type.toUpperCase()] || {};
      const slot = document.createElement('div');
      slot.className = 'inv-slot' + (item.count <= 0 ? ' empty' : '');

      const dim = item.height || item.length || item.size || item.side || elemDef.height || elemDef.length || elemDef.size || elemDef.side;
      const dimLabel = dim ? `${dim}px` : '';
      slot.title = `${elemDef.name || item.type}${dimLabel ? ` (${dimLabel})` : ''}`;

      const iconSvg = this.generateSlotIcon(item);

      slot.innerHTML = `
        <span class="inv-count">${item.count}</span>
        ${dimLabel ? `<span class="inv-dim-badge">${dimLabel}</span>` : ''}
        ${iconSvg}
      `;

      slot.addEventListener('click', () => {
        if (item.count > 0) this.spawnItem(item);
      });
      this.trayEl.appendChild(slot);
    });
  },

  generateSlotIcon(item) {
    const type = item.type;
    const elemDef = window.Lumina.Elements[type.toUpperCase()] || {};
    const len = item.length || elemDef.length || 80;
    const h = item.height || elemDef.height || 160;

    if (type === 'mirror') {
      const base = elemDef.length || 80;
      const scale = Math.min(1.4, Math.max(0.45, len / base));
      const halfL = 15 * scale;
      const x1 = Math.round(24 - halfL * 0.707);
      const y1 = Math.round(24 + halfL * 0.707);
      const x2 = Math.round(24 + halfL * 0.707);
      const y2 = Math.round(24 - halfL * 0.707);
      return `<svg width="40" height="40" viewBox="0 0 48 48">
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--theme-accent)" stroke-width="1.2" stroke-linecap="round"/>
      </svg>`;
    }

    if (type === 'mirror_concave' || type === 'mirror_convex') {
      const base = elemDef.length || 90;
      const scale = Math.min(1.4, Math.max(0.45, len / base));
      const halfL = 16 * scale;
      const sag = (type === 'mirror_concave' ? 8 : -8) * scale;
      const y1 = 24 - halfL;
      const y2 = 24 + halfL;
      return `<svg width="40" height="40" viewBox="0 0 48 48">
        <path d="M24,${y1} Q${24 + sag},24 24,${y2}" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
        <path d="M24,${y1} Q${24 + sag},24 24,${y2}" fill="none" stroke="var(--theme-accent)" stroke-width="1.2"/>
      </svg>`;
    }

    if (type === 'lens_convex') {
      const base = elemDef.height || 160;
      const scale = Math.min(1.35, Math.max(0.45, h / base));
      const halfH = 17 * scale;
      const bulge = Math.max(4, 8 * Math.sqrt(scale));
      const top = 24 - halfH;
      const bot = 24 + halfH;
      return `<svg width="40" height="40" viewBox="0 0 48 48">
        <path d="M24,${top} Q${24 + bulge},24 24,${bot} Q${24 - bulge},24 24,${top} Z" fill="rgba(0, 240, 255, 0.2)" stroke="var(--color-cyan)" stroke-width="2"/>
      </svg>`;
    }

    if (type === 'lens_concave') {
      const base = elemDef.height || 160;
      const scale = Math.min(1.35, Math.max(0.45, h / base));
      const halfH = 17 * scale;
      const hw = Math.max(4, 7 * scale);
      const top = 24 - halfH;
      const bot = 24 + halfH;
      return `<svg width="40" height="40" viewBox="0 0 48 48">
        <path d="M${24 - hw},${top} L${24 + hw},${top} Q24,24 ${24 + hw},${bot} L${24 - hw},${bot} Q24,24 ${24 - hw},${top} Z" fill="rgba(0, 240, 255, 0.15)" stroke="var(--color-cyan)" stroke-width="2"/>
      </svg>`;
    }

    if (type === 'prism') {
      const side = item.side || elemDef.side || 70;
      const scale = Math.min(1.3, Math.max(0.5, side / (elemDef.side || 70)));
      const r = 16 * scale;
      const p1 = `24,${24 - r}`;
      const p2 = `${24 + r * 0.866},${24 + r * 0.5}`;
      const p3 = `${24 - r * 0.866},${24 + r * 0.5}`;
      return `<svg width="40" height="40" viewBox="0 0 48 48">
        <polygon points="${p1} ${p2} ${p3}" fill="rgba(56, 189, 248, 0.2)" stroke="var(--theme-accent)" stroke-width="2"/>
      </svg>`;
    }

    if (type === 'beam_splitter') {
      const sz = item.size || elemDef.size || 50;
      const scale = Math.min(1.3, Math.max(0.5, sz / (elemDef.size || 50)));
      const hs = 14 * scale;
      return `<svg width="40" height="40" viewBox="0 0 48 48">
        <rect x="${24 - hs}" y="${24 - hs}" width="${hs * 2}" height="${hs * 2}" fill="none" stroke="rgba(255, 255, 255, 0.4)" stroke-width="1.5"/>
        <line x1="${24 - hs}" y1="${24 + hs}" x2="${24 + hs}" y2="${24 - hs}" stroke="var(--theme-accent)" stroke-width="2"/>
      </svg>`;
    }

    if (type === 'portal') {
      const base = elemDef.length || 70;
      const scale = Math.min(1.4, Math.max(0.5, len / base));
      const ry = 16 * scale;
      return `<svg width="40" height="40" viewBox="0 0 48 48">
        <ellipse cx="24" cy="24" rx="7" ry="${ry}" fill="rgba(189, 0, 255, 0.2)" stroke="#bd00ff" stroke-width="2"/>
      </svg>`;
    }

    if (type === 'wall') {
      const w = Math.min(30, Math.max(8, (item.width || elemDef.width || 30) * 0.3));
      const hh = Math.min(20, Math.max(8, (item.height || elemDef.height || 120) * 0.16));
      return `<svg width="40" height="40" viewBox="0 0 48 48">
        <rect x="${24 - w / 2}" y="${24 - hh}" width="${w}" height="${hh * 2}" fill="#060b17" stroke="#334155" stroke-width="1.5"/>
      </svg>`;
    }

    return elemDef.icon || '';
  },

  spawnItem(item) {
    const game = window.Lumina.Game;
    const elemDef = window.Lumina.Elements[item.type.toUpperCase()] || {};
    const isWall = item.type === 'wall';
    const roomW = (game.currentLevel?.width) || window.Lumina.Constants.ROOM_WIDTH;
    const roomH = (game.currentLevel?.height) || window.Lumina.Constants.ROOM_HEIGHT;

    const newEl = {
      type: item.type,
      x: Math.round(roomW / 2),
      y: Math.round(roomH / 2),
      angle: 0,
      movable: true,
      rotatable: true
    };

    if (item.length || elemDef.length) newEl.length = item.length || elemDef.length;
    if (item.height || elemDef.height) newEl.height = item.height || elemDef.height;
    if (item.width || elemDef.width) newEl.width = item.width || elemDef.width;
    if (item.size || elemDef.size) newEl.size = item.size || elemDef.size;
    if (item.side || elemDef.side) newEl.side = item.side || elemDef.side;
    if (item.radius || elemDef.radius) newEl.radius = item.radius || elemDef.radius;
    if (item.focalLength || elemDef.focalLength) newEl.focalLength = item.focalLength || elemDef.focalLength;
    if (item.curvature || elemDef.curvature) newEl.curvature = item.curvature || elemDef.curvature;

    if (isWall) {
      newEl.width = newEl.width || 30;
      newEl.height = newEl.height || 120;
    }

    if (window.Lumina.Collider?.findSafeSpawn) {
      const safe = window.Lumina.Collider.findSafeSpawn(newEl, game.currentElements, roomW, roomH);
      newEl.x = safe.x;
      newEl.y = safe.y;
    }

    game.currentElements.push(newEl);
    item.count--;
    this.renderInventory(game.currentInventory);

    if (window.Lumina.Pointer) window.Lumina.Pointer.selectedElement = newEl;
    if (window.Lumina.EditorTransform) window.Lumina.EditorTransform.target = newEl;
    if (window.Lumina.SFX?.playClick) window.Lumina.SFX.playClick();
  }
};