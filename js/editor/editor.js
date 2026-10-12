window.Lumina = window.Lumina || {};

window.Lumina.Editor = {
  currentLevel: null,
  activeTool: 'select',
  selectedEntity: null,
  isTestMode: false,

  init() {
    window.Lumina.EditorUI.init();
    this.bindButtons();
    this.bindCanvasEvents();
  },

  openNew() {
    this.currentLevel = {
      id: Date.now(),
      title: 'Custom Level',
      width: 1000,
      height: 700,
      emitters: [{ x: 120, y: 350, angle: 0, color: 'white' }],
      sensors: [{ id: 's1', x: 880, y: 350, requiredColor: 'any', requiredBeams: 1, requiredMix: ['any'], active: false }],
      staticElements: [],
      inventory: [{ type: 'mirror', count: 3 }, { type: 'prism', count: 1 }],
      initialPlacements: []
    };
    this.loadLevelIntoEditor(this.currentLevel);
  },

  loadLevelIntoEditor(levelData) {
    this.currentLevel = JSON.parse(JSON.stringify(levelData));
    this.currentLevel.width = this.currentLevel.width || 1000;
    this.currentLevel.height = this.currentLevel.height || 700;
    this.isTestMode = false;
    this.setTool('select');
    this.syncGlobalInputs();
    window.Lumina.Game.loadLevel(this.currentLevel);
    window.Lumina.Renderer.resize();
  },

  syncGlobalInputs() {
    const mapW = document.getElementById('prop-map-width');
    const mapH = document.getElementById('prop-map-height');
    const lvlTitle = document.getElementById('prop-level-title');
    if (mapW) mapW.value = this.currentLevel.width;
    if (mapH) mapH.value = this.currentLevel.height;
    if (lvlTitle) lvlTitle.value = this.currentLevel.title;
  },

  setTool(toolName) {
    this.activeTool = toolName;
    document.querySelectorAll('.editor-tool-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === toolName);
    });
  },

  bindButtons() {
    document.querySelectorAll('.editor-tool-btn').forEach(btn => {
      btn.addEventListener('click', () => this.setTool(btn.dataset.tool));
    });

    document.getElementById('btn-editor-test').addEventListener('click', () => {
      this.toggleTestMode();
    });

    document.getElementById('btn-editor-code').addEventListener('click', () => {
      const code = window.Lumina.EditorIO.generateCode(this.currentLevel);
      window.Lumina.ModalManager.open('editor-code', { code });
    });

    document.getElementById('btn-editor-save').addEventListener('click', () => {
      window.Lumina.EditorIO.saveToStorage(this.currentLevel);
      alert('Level saved to Custom Levels list.');
    });

    document.getElementById('btn-editor-exit').addEventListener('click', () => {
      window.Lumina.Game.switchScreen('menu');
    });
  },

  toggleTestMode() {
    this.isTestMode = !this.isTestMode;
    const badge = document.getElementById('editor-test-badge');
    const btn = document.getElementById('btn-editor-test');
    if (badge) badge.classList.toggle('hidden', !this.isTestMode);
    if (btn) btn.textContent = this.isTestMode ? 'Stop Preview' : 'Preview Level';

    if (this.isTestMode) {
      window.Lumina.Game.loadLevel(this.currentLevel);
    } else {
      window.Lumina.Game.loadLevel(this.currentLevel);
      this.selectedEntity = null;
      window.Lumina.EditorUI.updateInspector(null);
    }
  },

  bindCanvasEvents() {
    const canvas = document.getElementById('viewport-canvas');
    canvas.parentElement.addEventListener('pointerdown', (e) => {
      if (this.isTestMode || window.Lumina.Game.currentScreen !== 'editor') return;
      const rect = canvas.getBoundingClientRect();
      const pt = window.Lumina.Renderer.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);

      if (this.activeTool === 'select') {
        this.selectAtPoint(pt);
      } else {
        this.spawnToolEntity(this.activeTool, pt);
      }
    });
  },

  selectAtPoint(pt) {
    const all = [
      ...this.currentLevel.sensors.map(s => { s._isSensor = true; return s; }),
      ...this.currentLevel.emitters.map(em => { em._isEmitter = true; return em; }),
      ...this.currentLevel.staticElements
    ];

    for (let i = all.length - 1; i >= 0; i--) {
      const ent = all[i];
      const dx = pt.x - ent.x;
      const dy = pt.y - ent.y;
      if (dx * dx + dy * dy <= 30 * 30) {
        this.selectedEntity = ent;
        window.Lumina.EditorUI.updateInspector(ent);
        return;
      }
    }
    this.selectedEntity = null;
    window.Lumina.EditorUI.updateInspector(null);
  },

  spawnToolEntity(tool, pt) {
    const x = Math.round(pt.x);
    const y = Math.round(pt.y);

    if (tool === 'sensor') {
      this.currentLevel.sensors.push({
        id: 's_' + Date.now(), x, y,
        requiredColor: 'any', requiredBeams: 1, requiredMix: ['any'], active: false
      });
    } else if (tool === 'emitter') {
      this.currentLevel.emitters.push({ x, y, angle: 0, color: 'white' });
    } else if (tool === 'wall') {
      this.currentLevel.staticElements.push({ type: 'wall', x, y, width: 30, height: 120, angle: 0 });
    } else if (tool === 'black_hole') {
      this.currentLevel.staticElements.push({ type: 'black_hole', x, y, radius: 24 });
    }

    window.Lumina.Game.loadLevel(this.currentLevel);
    this.setTool('select');
  },

  deleteEntity(ent) {
    if (ent._isSensor) {
      this.currentLevel.sensors = this.currentLevel.sensors.filter(s => s !== ent);
    } else if (ent._isEmitter) {
      this.currentLevel.emitters = this.currentLevel.emitters.filter(em => em !== ent);
    } else {
      this.currentLevel.staticElements = this.currentLevel.staticElements.filter(el => el !== ent);
    }
    window.Lumina.Game.loadLevel(this.currentLevel);
  }
};