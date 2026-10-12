window.Lumina = window.Lumina || {};

window.Lumina.LevelRegistry = {
  levels: [],
  currentLevelIndex: 0,
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
    return localStorage.getItem('lumina_level_' + (index - 1)) === 'cleared';
  },

  markCompleted(index) {
    if (!this.isCustomLevelMode) {
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
  }
};