window.Lumina = window.Lumina || {};

window.Lumina.Editor = {
  currentLevel: null,
  activeTool: 'select',
  selectedEntity: null,
  isTestMode: false,
  levelSnapshot: null,

  init() {
    this.currentLevel = {
      id: Date.now(),
      title: 'Custom Level',
      width: 1000,
      height: 700,
      emitters: [{ x: 120, y: 350, angle: 0, color: 'white', _isEmitter: true }],
      sensors: [{
        id: 's1', x: 880, y: 350, radius: 24,
        requirements: [{ color: 'any', count: 1 }],
        requiredColor: 'any', requiredBeams: 1,
        active: false, _isSensor: true
      }],
      staticElements: [],
      inventory: [{ type: 'mirror', count: 3 }, { type: 'prism', count: 1 }],
      initialPlacements: []
    };

    const ui = window.Lumina.EditorUI || window.Lumina.UI;
    if (ui?.init) ui.init();

    this.bindButtons();
    this.bindCanvasEvents();
  },

  openNew() {
    this.currentLevel = {
      id: Date.now(),
      title: 'Custom Level',
      width: 1000,
      height: 700,
      emitters: [{ x: 120, y: 350, angle: 0, color: 'white', _isEmitter: true }],
      sensors: [{
        id: 's1', x: 880, y: 350, radius: 24,
        requirements: [{ color: 'any', count: 1 }],
        requiredColor: 'any', requiredBeams: 1,
        active: false, _isSensor: true
      }],
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
    this.currentLevel.title = this.currentLevel.title || 'Custom Level';
    this.currentLevel.staticElements = this.currentLevel.staticElements || [];
    this.currentLevel.emitters = (this.currentLevel.emitters || []).map((em) => { em._isEmitter = true; return em; });
    this.currentLevel.sensors = (this.currentLevel.sensors || []).map((s) => {
      s._isSensor = true;
      s.radius = s.radius || 24;
      return s;
    });
    this.currentLevel.inventory = this.currentLevel.inventory || [];

    this.isTestMode = false;
    this.selectedEntity = null;
    this.setTool('select');
    this.syncGlobalInputs();
    this.syncToGame();
    if (window.Lumina.Gizmo?.hide) window.Lumina.Gizmo.hide();
    const ui = window.Lumina.EditorUI || window.Lumina.UI;
    if (ui?.updateInspector) ui.updateInspector(null);
    if (window.Lumina.Renderer?.resize) window.Lumina.Renderer.resize();
  },

  syncToGame() {
    const g = window.Lumina.Game;
    g.currentLevel = this.currentLevel;
    g.currentElements = this.currentLevel.staticElements;
    g.currentEmitters = this.currentLevel.emitters;
    g.currentSensors = this.currentLevel.sensors;
    g.currentInventory = this.currentLevel.inventory;
  },

  syncGlobalInputs() {
    const mapW = document.getElementById('prop-map-width');
    const mapH = document.getElementById('prop-map-height');
    const lvlTitle = document.getElementById('prop-level-title');
    const headerTitle = document.getElementById('editor-level-name-input');
    const name = this.currentLevel.title || 'Custom Level';

    if (mapW) mapW.value = this.currentLevel.width;
    if (mapH) mapH.value = this.currentLevel.height;
    if (lvlTitle) lvlTitle.value = name;
    if (headerTitle) headerTitle.value = name;
    const ui = window.Lumina.EditorUI || window.Lumina.UI;
    if (ui?.renderInventoryConfig) ui.renderInventoryConfig();
  },

  setTool(toolName) {
    this.activeTool = toolName;
    document.querySelectorAll('.editor-tool-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tool === toolName);
    });
  },

  bindButtons() {
    document.querySelectorAll('.editor-tool-btn').forEach((btn) => {
      btn.addEventListener('click', () => this.setTool(btn.dataset.tool));
    });

    const btnOpen = document.getElementById('btn-editor-open');
    if (btnOpen) {
      btnOpen.addEventListener('click', () => {
        if (window.Lumina.ModalManager?.open) window.Lumina.ModalManager.open('level-select');
      });
    }

    const btnTest = document.getElementById('btn-editor-test');
    if (btnTest) {
      btnTest.addEventListener('click', () => {
        this.startPreviewPlaytest();
      });
    }

    const btnCode = document.getElementById('btn-editor-code');
    if (btnCode) {
      btnCode.addEventListener('click', () => {
        const io = window.Lumina.EditorIO || window.Lumina.IO;
        const code = io?.generateCode ? io.generateCode(this.currentLevel) : '';
        if (window.Lumina.ModalManager?.open) window.Lumina.ModalManager.open('editor-code', { code });
      });
    }

    const btnSave = document.getElementById('btn-editor-save');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        const io = window.Lumina.EditorIO || window.Lumina.IO;
        if (io?.saveToStorage) io.saveToStorage(this.currentLevel);
        alert(`Level "${this.currentLevel.title}" saved to Custom Levels list.`);
      });
    }

    const btnExit = document.getElementById('btn-editor-exit');
    if (btnExit) {
      btnExit.addEventListener('click', () => {
        window.Lumina.Game.switchScreen('menu');
      });
    }
  },

  startPreviewPlaytest() {
    this.levelSnapshot = JSON.parse(JSON.stringify(this.currentLevel));
    window.Lumina.Game.isPreviewMode = true;

    const btnExit = document.getElementById('btn-hdr-exit-preview');
    if (btnExit) btnExit.classList.remove('hidden');

    window.Lumina.Game.switchScreen('gameplay');
    window.Lumina.Game.loadLevel(this.currentLevel);
  },

  bindCanvasEvents() {
    const canvas = document.getElementById('viewport-canvas');
    if (!canvas) return;
    const container = canvas.parentElement;

    container.addEventListener('pointerdown', (e) => {
      if (window.Lumina.Game.currentScreen !== 'editor') return;
      const rect = canvas.getBoundingClientRect();
      const pt = window.Lumina.Renderer.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);

      if (this.activeTool === 'select') {
        const xform = window.Lumina.EditorTransform;
        if (this.selectedEntity && xform?.handleDown && xform.handleDown(pt, this.selectedEntity)) {
          return;
        }

        const clicked = this.findAtPoint(pt);
        this.selectedEntity = clicked;
        const ui = window.Lumina.EditorUI || window.Lumina.UI;
        if (ui?.updateInspector) ui.updateInspector(clicked);
        if (clicked && xform?.handleDown) {
          xform.handleDown(pt, clicked);
        }
      } else {
        this.spawnToolEntity(this.activeTool, pt);
      }
    });

    window.addEventListener('pointermove', (e) => {
      if (window.Lumina.Game.currentScreen !== 'editor') return;
      const rect = canvas.getBoundingClientRect();
      const pt = window.Lumina.Renderer.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
      if (window.Lumina.EditorTransform?.handleMove) window.Lumina.EditorTransform.handleMove(pt);
    });

    window.addEventListener('pointerup', () => {
      if (window.Lumina.Game.currentScreen !== 'editor') return;
      if (window.Lumina.EditorTransform?.handleUp) window.Lumina.EditorTransform.handleUp();
    });
  },

  findAtPoint(pt) {
    const all = [
      ...this.currentLevel.sensors,
      ...this.currentLevel.emitters,
      ...this.currentLevel.staticElements
    ];

    const xform = window.Lumina.EditorTransform;
    for (let i = all.length - 1; i >= 0; i--) {
      if (xform?.hitTestBody && xform.hitTestBody(pt, all[i])) {
        return all[i];
      }
    }
    return null;
  },

  spawnToolEntity(tool, pt) {
    const x = Math.round(pt.x);
    const y = Math.round(pt.y);
    let spawned = null;

    if (tool === 'sensor') {
      spawned = {
        id: 's_' + Date.now(), x, y, radius: 24, _isSensor: true,
        requirements: [{ color: 'any', count: 1 }],
        requiredColor: 'any', requiredBeams: 1, active: false
      };
      this.currentLevel.sensors.push(spawned);
    } else if (tool === 'emitter') {
      spawned = { x, y, angle: 0, color: 'white', _isEmitter: true };
      this.currentLevel.emitters.push(spawned);
    } else if (tool === 'wall') {
      spawned = { type: 'wall', x, y, width: 30, height: 120, angle: 0 };
      this.currentLevel.staticElements.push(spawned);
    } else if (tool === 'mirror') {
      spawned = { type: 'mirror', x, y, length: 80, angle: 0, movable: true, rotatable: true };
      this.currentLevel.staticElements.push(spawned);
    } else if (tool === 'mirror_concave') {
      spawned = { type: 'mirror_concave', x, y, length: 90, curvature: 260, angle: 0, movable: true, rotatable: true };
      this.currentLevel.staticElements.push(spawned);
    } else if (tool === 'mirror_convex') {
      spawned = { type: 'mirror_convex', x, y, length: 90, curvature: 260, angle: 0, movable: true, rotatable: true };
      this.currentLevel.staticElements.push(spawned);
    } else if (tool === 'prism') {
      spawned = { type: 'prism', x, y, side: 70, angle: 0, movable: true, rotatable: true };
      this.currentLevel.staticElements.push(spawned);
    } else if (tool === 'lens_convex') {
      spawned = { type: 'lens_convex', x, y, height: 160, focalLength: 250, angle: 0, movable: true, rotatable: true };
      this.currentLevel.staticElements.push(spawned);
    } else if (tool === 'lens_concave') {
      spawned = { type: 'lens_concave', x, y, height: 160, focalLength: -180, angle: 0, movable: true, rotatable: true };
      this.currentLevel.staticElements.push(spawned);
    } else if (tool === 'beam_splitter') {
      spawned = { type: 'beam_splitter', x, y, size: 50, angle: 45, movable: true, rotatable: true };
      this.currentLevel.staticElements.push(spawned);
    } else if (tool === 'portal') {
      spawned = { type: 'portal', x, y, length: 70, angle: 90, id: 'p_' + Date.now(), movable: true, rotatable: true };
      this.currentLevel.staticElements.push(spawned);
    } else if (tool === 'black_hole') {
      spawned = { type: 'black_hole', x, y, radius: 24 };
      this.currentLevel.staticElements.push(spawned);
    }

    this.syncToGame();
    this.selectedEntity = spawned;
    const ui = window.Lumina.EditorUI || window.Lumina.UI;
    if (ui?.updateInspector) ui.updateInspector(spawned);
    this.setTool('select');
  },

  deleteEntity(ent) {
    if (ent._isSensor) {
      this.currentLevel.sensors = this.currentLevel.sensors.filter((s) => s !== ent);
    } else if (ent._isEmitter) {
      this.currentLevel.emitters = this.currentLevel.emitters.filter((em) => em !== ent);
    } else {
      this.currentLevel.staticElements = this.currentLevel.staticElements.filter((el) => el !== ent);
    }
    this.selectedEntity = null;
    this.syncToGame();
  }
};