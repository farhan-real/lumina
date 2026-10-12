window.Lumina = window.Lumina || {};

window.Lumina.LevelRegistry = {
  maxLevel: 13,
  levels: [],
  currentLevelIndex: 0,
  isCustomLevelMode: false,
  activeCustomLevel: null,
  _loadPromise: null,

  register(levelData) {
    const exists = this.levels.some((l) => l.id === levelData.id);
    if (!exists) {
      this.levels.push(levelData);
      this.levels.sort((a, b) => a.id - b.id);
    }
  },

  loadScript(src) {
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve(true);
      s.onerror = () => {
        s.remove();
        resolve(false);
      };
      document.head.appendChild(s);
    });
  },

  async loadLevels() {
    const count = this.maxLevel || 13;
    const promises = [];
    for (let i = 1; i <= count; i++) {
      const num = i < 10 ? `0${i}` : `${i}`;
      promises.push(this.loadScript(`js/data/levels/level-${num}.js`));
    }
    await Promise.all(promises);
    return this.levels;
  },

  ensureLoaded() {
    if (!this._loadPromise) {
      this._loadPromise = this.loadLevels();
    }
    return this._loadPromise;
  },

  getAll() {
    return this.levels;
  },

  getCurrent() {
    if (this.isCustomLevelMode && this.activeCustomLevel) {
      return this.activeCustomLevel;
    }
    return this.levels[this.currentLevelIndex] || this.levels[0];
  },

  setCurrentIndex(index) {
    this.isCustomLevelMode = false;
    this.activeCustomLevel = null;
    if (index >= 0 && index < this.levels.length) {
      this.currentLevelIndex = index;
    }
  },

  loadCustomLevel(levelObj) {
    this.isCustomLevelMode = true;
    this.activeCustomLevel = levelObj;
  },

  isUnlocked(index) {
    if (window.Lumina.DevMode?.isUnlockedAll?.()) return true;
    if (index === 0) return true;
    const cleared = localStorage.getItem('lumina_level_' + (index - 1)) === 'cleared'
      || localStorage.getItem('lumina_level_cleared_' + (index - 1)) === 'true';
    return cleared;
  },

  markCompleted(index) {
    if (!this.isCustomLevelMode) {
      localStorage.setItem('lumina_level_' + index, 'cleared');
    }
  },

  clearSaveData() {
    try {
      const allKeys = Object.keys(localStorage);
      allKeys.forEach((key) => {
        if (key.toLowerCase().startsWith('lumina')) {
          localStorage.removeItem(key);
        }
      });
    } catch (err) {
      localStorage.clear();
    }
    this.currentLevelIndex = 0;
    this.isCustomLevelMode = false;
    this.activeCustomLevel = null;
  }
};

// Initiate background level resolution as soon as registry loads
window.Lumina.LevelRegistry.ensureLoaded();