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
      slot.title = elemDef.name || item.type;
      slot.innerHTML = `
        <span class="inv-count">${item.count}</span>
        ${elemDef.icon || ''}
      `;
      slot.addEventListener('click', () => {
        if (item.count > 0) this.spawnItem(item);
      });
      this.trayEl.appendChild(slot);
    });
  },

  spawnItem(item) {
    const game = window.Lumina.Game;
    const elemDef = window.Lumina.Elements[item.type.toUpperCase()] || {};
    const isWall = item.type === 'wall';
    const newEl = {
      type: item.type,
      x: 500,
      y: 350,
      width: elemDef.width || (isWall ? 30 : 80),
      height: elemDef.height || (isWall ? 120 : 80),
      angle: 0,
      movable: true,
      rotatable: true
    };
    game.currentElements.push(newEl);
    item.count--;
    this.renderInventory(game.currentInventory);
    window.Lumina.Gizmo.show(newEl);
    window.Lumina.SFX.playClick();
  }
};