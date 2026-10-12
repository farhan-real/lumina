window.Lumina = window.Lumina || {};

window.Lumina.Game = {
  currentScreen: 'menu',
  currentLevel: null,
  currentElements: [],
  currentEmitters: [],
  currentSensors: [],
  currentInventory: [],
  isLevelCleared: false,
  isPreviewMode: false,

  init() {
    this.bindMenuButtons();

    const modules = [
      { name: 'Raycaster', obj: window.Lumina.Raycaster },
      { name: 'ModalManager', obj: window.Lumina.ModalManager },
      { name: 'Gizmo', obj: window.Lumina.Gizmo },
      { name: 'Renderer', obj: window.Lumina.Renderer },
      { name: 'Pointer', obj: window.Lumina.Pointer },
      { name: 'HUDHeader', obj: window.Lumina.HUDHeader },
      { name: 'HUDToolbar', obj: window.Lumina.HUDToolbar },
      { name: 'Editor', obj: window.Lumina.Editor }
    ];

    modules.forEach((m) => {
      if (!m.obj) {
        console.warn(`Lumina module not loaded: ${m.name}. Check script tag in index.html.`);
      }
    });

    if (window.Lumina.Raycaster?.init) window.Lumina.Raycaster.init();
    if (window.Lumina.ModalManager?.init) window.Lumina.ModalManager.init();
    if (window.Lumina.Gizmo?.init) window.Lumina.Gizmo.init();

    const canvas = document.getElementById('viewport-canvas');
    if (canvas && window.Lumina.Renderer?.init) {
      window.Lumina.Renderer.init(canvas);
    }
    if (canvas?.parentElement && window.Lumina.Pointer?.init) {
      window.Lumina.Pointer.init(canvas.parentElement);
    }
    if (window.Lumina.HUDHeader?.init) window.Lumina.HUDHeader.init();
    if (window.Lumina.HUDToolbar?.init) window.Lumina.HUDToolbar.init();
    if (window.Lumina.Editor?.init) window.Lumina.Editor.init();

    const btnExitPreview = document.getElementById('btn-hdr-exit-preview');
    if (btnExitPreview) {
      btnExitPreview.onclick = () => this.exitPreviewMode();
    }

    window.addEventListener('resize', () => {
      if (window.Lumina.Renderer?.resize) window.Lumina.Renderer.resize();
      if (this.currentElements.length > 0 && window.Lumina.Gizmo?.activeElement) {
        window.Lumina.Gizmo.updatePosition(window.Lumina.Gizmo.activeElement);
      }
    });

    this.startLoop();
  },

  bindMenuButtons() {
    const btnPlay = document.getElementById('btn-menu-play');
    const btnEditor = document.getElementById('btn-menu-editor');
    const btnLevels = document.getElementById('btn-menu-levels');
    const btnClear = document.getElementById('btn-menu-clear');

    if (btnPlay) {
      btnPlay.onclick = () => {
        if (window.Lumina.Synth?.ensureContext) window.Lumina.Synth.ensureContext();
        this.switchScreen('gameplay');
        this.loadLevel(window.Lumina.LevelRegistry.getCurrent());
      };
    }

    if (btnEditor) {
      btnEditor.onclick = () => {
        if (window.Lumina.Synth?.ensureContext) window.Lumina.Synth.ensureContext();
        this.switchScreen('editor');
        if (window.Lumina.Editor?.openNew) window.Lumina.Editor.openNew();
      };
    }

    if (btnLevels) {
      btnLevels.onclick = () => {
        if (window.Lumina.ModalManager?.open) window.Lumina.ModalManager.open('level-select');
      };
    }

    if (btnClear) {
      btnClear.onclick = () => {
        if (confirm('Reset all game data, progress, and custom levels?')) {
          if (window.Lumina.LevelRegistry?.clearSaveData) {
            window.Lumina.LevelRegistry.clearSaveData();
          }
          if (window.Lumina.SFX?.playClick) window.Lumina.SFX.playClick();
          alert('All saved progress and custom levels have been reset.');
        }
      };
    }
  },

  exitPreviewMode() {
    this.isPreviewMode = false;
    const btnExit = document.getElementById('btn-hdr-exit-preview');
    if (btnExit) btnExit.classList.add('hidden');
    this.switchScreen('editor');
    if (window.Lumina.Editor?.levelSnapshot) {
      window.Lumina.Editor.loadLevelIntoEditor(window.Lumina.Editor.levelSnapshot);
      window.Lumina.Editor.levelSnapshot = null;
    }
  },

  switchScreen(screenName) {
    this.currentScreen = screenName;
    const menu = document.getElementById('screen-menu');
    const play = document.getElementById('screen-gameplay');
    const editor = document.getElementById('screen-editor');

    if (menu) menu.classList.toggle('hidden', screenName !== 'menu');
    if (play) play.classList.toggle('hidden', screenName !== 'gameplay');
    if (editor) editor.classList.toggle('hidden', screenName !== 'editor');

    if (screenName === 'editor') {
      const canvas = document.getElementById('viewport-canvas');
      const container = document.querySelector('.editor-workspace > div');
      if (canvas && container && canvas.parentElement !== container) {
        container.appendChild(canvas.parentElement);
      }
    } else if (screenName === 'gameplay') {
      const canvas = document.getElementById('viewport-canvas');
      const container = document.getElementById('screen-gameplay');
      if (canvas && container && canvas.parentElement !== container) {
        container.insertBefore(canvas.parentElement, container.firstChild);
      }
    }

    if (window.Lumina.Renderer?.resize) window.Lumina.Renderer.resize();
  },

  loadLevel(levelData) {
    this.currentLevel = levelData;
    this.isLevelCleared = false;
    this.currentElements = JSON.parse(JSON.stringify(levelData.initialPlacements || []));
    if (levelData.staticElements) {
      this.currentElements.push(...JSON.parse(JSON.stringify(levelData.staticElements)));
    }
    this.currentEmitters = JSON.parse(JSON.stringify(levelData.emitters || []));
    this.currentSensors = JSON.parse(JSON.stringify(levelData.sensors || []));
    this.currentInventory = JSON.parse(JSON.stringify(levelData.inventory || []));

    if (window.Lumina.HUDHeader?.updateLevelInfo) window.Lumina.HUDHeader.updateLevelInfo(levelData);
    if (window.Lumina.HUDToolbar?.renderInventory) window.Lumina.HUDToolbar.renderInventory(this.currentInventory);
    if (window.Lumina.Gizmo?.hide) window.Lumina.Gizmo.hide();
  },

  resetCurrentLevel() {
    if (this.currentLevel) this.loadLevel(this.currentLevel);
  },

  loadNextLevel() {
    const reg = window.Lumina.LevelRegistry;
    const nextIdx = reg.currentLevelIndex + 1;
    if (nextIdx < reg.getAll().length) {
      reg.setCurrentIndex(nextIdx);
      this.loadLevel(reg.getCurrent());
    } else {
      this.switchScreen('menu');
    }
  },

  removeElement(element) {
    if (!element || !element.movable) return;
    const idx = this.currentElements.indexOf(element);
    if (idx !== -1) {
      this.currentElements.splice(idx, 1);
      const invItem = this.currentInventory.find((i) => i.type === element.type);
      if (invItem) {
        invItem.count++;
      } else {
        this.currentInventory.push({ type: element.type, count: 1 });
      }
      if (window.Lumina.HUDToolbar?.renderInventory) window.Lumina.HUDToolbar.renderInventory(this.currentInventory);
      if (window.Lumina.Gizmo?.hide) window.Lumina.Gizmo.hide();
      if (window.Lumina.SFX?.playClick) window.Lumina.SFX.playClick();
    }
  },

  checkSolution() {
    if (window.Lumina.Synth?.ensureContext) window.Lumina.Synth.ensureContext();
    const allActive = this.currentSensors.length > 0 && this.currentSensors.every((s) => s.active);
    if (allActive) {
      this.isLevelCleared = true;
      if (window.Lumina.SFX?.playVictory) window.Lumina.SFX.playVictory();
      if (!this.isPreviewMode) {
        window.Lumina.LevelRegistry.markCompleted(window.Lumina.LevelRegistry.currentLevelIndex);
      }
      setTimeout(() => {
        if (window.Lumina.ModalManager?.open) window.Lumina.ModalManager.open('victory');
      }, 350);
    } else {
      if (window.Lumina.SFX?.playClick) window.Lumina.SFX.playClick();
      const btn = document.getElementById('btn-run-check');
      if (btn) {
        btn.style.filter = 'brightness(0.6)';
        setTimeout(() => { btn.style.filter = ''; }, 250);
      }
    }
  },

  startLoop() {
    const loop = () => {
      if (this.currentScreen === 'gameplay' || this.currentScreen === 'editor') {
        this.update();
        this.render();
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  },

  update() {
    if (window.Lumina.Raycaster?.traceScene) {
      window.Lumina.Raycaster.traceScene(
        this.currentEmitters,
        this.currentElements,
        this.currentSensors
      );
    }
    if (this.currentScreen === 'gameplay' && window.Lumina.HUDHeader?.updateSensorStates) {
      window.Lumina.HUDHeader.updateSensorStates(this.currentSensors);
    }
  },

  render() {
    const r = window.Lumina.Renderer;
    if (!r) return;
    r.clear();
    if (window.Lumina.SceneView?.renderScene) {
      window.Lumina.SceneView.renderScene(r.ctx, this.currentEmitters, this.currentElements, this.currentSensors);
    }
    if (window.Lumina.BeamRenderer?.render && window.Lumina.Raycaster) {
      window.Lumina.BeamRenderer.render(r.ctx, window.Lumina.Raycaster.rayPool, window.Lumina.Raycaster.activeRays);
    }
  }
};

window.addEventListener('DOMContentLoaded', () => {
  window.Lumina.Game.init();
});