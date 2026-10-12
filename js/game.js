window.Lumina = window.Lumina || {};

window.Lumina.Game = {
  currentScreen: 'menu',
  currentLevel: null,
  currentElements: [],
  currentEmitters: [],
  currentSensors: [],
  currentInventory: [],
  isLevelCleared: false,

  init() {
    window.Lumina.Raycaster.init();
    window.Lumina.ModalManager.init();
    window.Lumina.Gizmo.init();

    const canvas = document.getElementById('viewport-canvas');
    window.Lumina.Renderer.init(canvas);
    window.Lumina.Pointer.init(canvas.parentElement);
    window.Lumina.HUDHeader.init();
    window.Lumina.HUDToolbar.init();

    document.getElementById('btn-menu-play').addEventListener('click', () => {
      window.Lumina.Synth.ensureContext();
      this.switchScreen('gameplay');
      this.loadLevel(window.Lumina.LevelRegistry.getCurrent());
    });

    document.getElementById('btn-menu-sandbox').addEventListener('click', () => {
      window.Lumina.Synth.ensureContext();
      window.Lumina.LevelRegistry.isSandboxMode = true;
      this.switchScreen('gameplay');
      this.loadLevel(window.Lumina.LevelRegistry.getSandboxLevel());
    });

    document.getElementById('btn-menu-levels').addEventListener('click', () => {
      window.Lumina.ModalManager.open('level-select');
    });

    document.getElementById('btn-menu-help').addEventListener('click', () => {
      window.Lumina.ModalManager.open('help');
    });

    document.getElementById('btn-menu-clear').addEventListener('click', () => {
      if (confirm('Reset all saved progress and lock completed levels?')) {
        window.Lumina.LevelRegistry.clearSaveData();
        window.Lumina.SFX.playClick();
      }
    });

    window.addEventListener('resize', () => {
      window.Lumina.Renderer.resize();
      if (this.currentElements.length > 0 && window.Lumina.Gizmo.activeElement) {
        window.Lumina.Gizmo.updatePosition(window.Lumina.Gizmo.activeElement);
      }
    });

    this.startLoop();
  },

  switchScreen(screenName) {
    this.currentScreen = screenName;
    const menu = document.getElementById('screen-menu');
    const play = document.getElementById('screen-gameplay');

    if (screenName === 'menu') {
      menu.classList.remove('hidden');
      play.classList.add('hidden');
    } else {
      menu.classList.add('hidden');
      play.classList.remove('hidden');
      window.Lumina.Renderer.resize();
    }
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

    window.Lumina.HUDHeader.updateLevelInfo(levelData);
    window.Lumina.HUDToolbar.renderInventory(this.currentInventory);
    window.Lumina.Gizmo.hide();
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
      const invItem = this.currentInventory.find(i => i.type === element.type);
      if (invItem) {
        invItem.count++;
      } else {
        this.currentInventory.push({ type: element.type, count: 1 });
      }
      window.Lumina.HUDToolbar.renderInventory(this.currentInventory);
      window.Lumina.Gizmo.hide();
      window.Lumina.SFX.playClick();
    }
  },

  checkSolution() {
    if (window.Lumina.LevelRegistry.isSandboxMode) return;
    window.Lumina.Synth.ensureContext();

    const allActive = this.currentSensors.length > 0 && this.currentSensors.every(s => s.active);
    if (allActive) {
      this.isLevelCleared = true;
      window.Lumina.SFX.playVictory();
      window.Lumina.LevelRegistry.markCompleted(window.Lumina.LevelRegistry.currentLevelIndex);
      setTimeout(() => {
        window.Lumina.ModalManager.open('victory');
      }, 350);
    } else {
      window.Lumina.SFX.playClick();
      const btn = document.getElementById('btn-run-check');
      if (btn) {
        btn.style.filter = 'brightness(0.6)';
        setTimeout(() => { btn.style.filter = ''; }, 250);
      }
    }
  },

  startLoop() {
    const loop = () => {
      if (this.currentScreen === 'gameplay') {
        this.update();
        this.render();
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  },

  update() {
    window.Lumina.Raycaster.traceScene(
      this.currentEmitters,
      this.currentElements,
      this.currentSensors
    );
    window.Lumina.HUDHeader.updateSensorStates(this.currentSensors);
  },

  render() {
    const r = window.Lumina.Renderer;
    r.clear();
    window.Lumina.OpticsView.renderScene(r.ctx, this.currentEmitters, this.currentElements, this.currentSensors);
    window.Lumina.BeamRenderer.render(r.ctx, window.Lumina.Raycaster.rayPool, window.Lumina.Raycaster.activeRays);
  }
};

window.addEventListener('DOMContentLoaded', () => {
  window.Lumina.Game.init();
});