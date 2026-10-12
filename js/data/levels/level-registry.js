window.Lumina = window.Lumina || {};

window.Lumina.LevelRegistry = {
  levels: [],
  currentLevelIndex: 0,
  isSandboxMode: false,
  isCustomLevelMode: false,
  activeCustomLevel: null,

  register(levelData) {
    this.levels.push(levelData);
  },

  getAll() {
    return this.levels;
  },

  getCurrent() {
    if (this.isCustomLevelMode && this.activeCustomLevel) {
      return this.activeCustomLevel;
    }
    if (this.isSandboxMode) {
      return this.getSandboxLevel();
    }
    return this.levels[this.currentLevelIndex] || this.levels[0];
  },

  setCurrentIndex(index) {
    this.isSandboxMode = false;
    this.isCustomLevelMode = false;
    this.activeCustomLevel = null;
    if (index >= 0 && index < this.levels.length) {
      this.currentLevelIndex = index;
    }
  },

  loadCustomLevel(levelObj) {
    this.isSandboxMode = false;
    this.isCustomLevelMode = true;
    this.activeCustomLevel = levelObj;
  },

  isUnlocked(index) {
    if (index === 0) return true;
    return localStorage.getItem('lumina_level_' + (index - 1)) === 'cleared';
  },

  markCompleted(index) {
    if (!this.isSandboxMode && !this.isCustomLevelMode) {
      localStorage.setItem('lumina_level_' + index, 'cleared');
    }
  },

  clearSaveData() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('lumina_level_')) keysToRemove.push(key);
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    this.currentLevelIndex = 0;
  },

  getSandboxLevel() {
    return {
      id: 999,
      title: 'Sandbox',
      width: 1000,
      height: 700,
      emitters: [{ x: 120, y: 350, angle: 0, color: 'white', movable: true }],
      sensors: [
        { id: 's1', x: 880, y: 250, requiredColor: 'any', requiredBeams: 1, active: false },
        { id: 's2', x: 880, y: 450, requiredColor: 'any', requiredBeams: 1, active: false }
      ],
      staticElements: [],
      inventory: [
        { type: 'mirror', count: 4 }, { type: 'prism', count: 2 },
        { type: 'lens_convex', count: 2 }, { type: 'lens_concave', count: 2 },
        { type: 'beam_splitter', count: 2 }, { type: 'wall', count: 4 }
      ],
      initialPlacements: []
    };
  }
};