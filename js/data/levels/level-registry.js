window.Lumina = window.Lumina || {};

window.Lumina.LevelRegistry = {
  levels: [],
  currentLevelIndex: 0,
  isCustomLevelMode: false,
  activeCustomLevel: null,

  register(levelData) {
    const exists = this.levels.some((l) => l.id === levelData.id);
    if (!exists) {
      this.levels.push(levelData);
    }
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
    if (index === 0) return true;
    // Check both standard and legacy storage keys
    const cleared = localStorage.getItem('lumina_level_' + (index - 1)) === 'cleared'
      || localStorage.getItem('lumina_level_cleared_' + (index - 1)) === 'true';
    return cleared;
  },

  markCompleted(index) {
    if (!this.isCustomLevelMode) {
      localStorage.setItem('lumina_level_' + index, 'cleared');
    }
  },

  // Cleans all progression, legacy flags, and custom saves from localStorage
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