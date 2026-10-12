window.Lumina = window.Lumina || {};

window.Lumina.EditorIO = {
  generateCode(levelData) {
    const cleanLevel = {
      id: levelData.id || 101,
      title: levelData.title || 'Custom Level',
      desc: levelData.desc || 'Custom designed optical puzzle.',
      width: levelData.width || 1000,
      height: levelData.height || 700,
      emitters: levelData.emitters || [],
      sensors: levelData.sensors || [],
      staticElements: levelData.staticElements || [],
      inventory: levelData.inventory || [],
      initialPlacements: levelData.initialPlacements || []
    };
    return JSON.stringify(cleanLevel, null, 2);
  },

  parseCode(codeString) {
    try {
      let trimmed = codeString.trim();
      if (trimmed.startsWith('const ') || trimmed.startsWith('let ') || trimmed.startsWith('var ')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) trimmed = trimmed.substring(eqIdx + 1).trim();
      }
      if (trimmed.endsWith(';')) trimmed = trimmed.slice(0, -1);

      const parsed = JSON.parse(trimmed);
      if (!parsed.emitters || !parsed.sensors) {
        throw new Error('Missing emitters or sensors array.');
      }
      return parsed;
    } catch (err) {
      alert('Invalid level code: ' + err.message);
      return null;
    }
  },

  saveToStorage(levelData) {
    const customLevels = this.getCustomLevels();
    const existingIdx = customLevels.findIndex(lvl => lvl.id === levelData.id);
    if (existingIdx !== -1) {
      customLevels[existingIdx] = levelData;
    } else {
      customLevels.push(levelData);
    }
    localStorage.setItem('lumina_custom_levels', JSON.stringify(customLevels));
  },

  deleteFromStorage(levelId) {
    let customLevels = this.getCustomLevels();
    customLevels = customLevels.filter(lvl => lvl.id !== levelId);
    localStorage.setItem('lumina_custom_levels', JSON.stringify(customLevels));
  },

  getCustomLevels() {
    try {
      const data = localStorage.getItem('lumina_custom_levels');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }
};

window.Lumina.IO = window.Lumina.EditorIO;