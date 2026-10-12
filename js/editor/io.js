window.Lumina = window.Lumina || {};

window.Lumina.EditorIO = {
  // Generates complete JavaScript level file content
  generateCode(levelData) {
    const data = levelData || (window.Lumina.Editor && window.Lumina.Editor.currentLevel) || {};
    const titleInp = document.getElementById('editor-level-name-input') || document.getElementById('prop-level-title');
    const levelTitle = (titleInp && titleInp.value.trim()) || data.title || 'Custom Level';

    const cleanLevel = {
      id: data.id || Date.now(),
      title: levelTitle,
      desc: data.desc || 'Custom designed optical puzzle.',
      width: data.width || 1000,
      height: data.height || 700,
      emitters: (data.emitters || []).map((e) => ({
        x: Math.round(e.x),
        y: Math.round(e.y),
        angle: e.angle || 0,
        color: e.color || 'white'
      })),
      sensors: (data.sensors || []).map((s) => {
        const item = {
          id: s.id || ('s_' + Math.random().toString(36).substr(2, 5)),
          x: Math.round(s.x),
          y: Math.round(s.y)
        };
        if (s.radius !== undefined) item.radius = Math.round(s.radius);
        item.requirements = (s.requirements && s.requirements.length > 0)
          ? s.requirements.map((r) => ({ color: r.color, count: r.count }))
          : [{ color: s.requiredColor || 'any', count: s.requiredBeams || 1 }];
        item.requiredColor = s.requiredColor || 'any';
        item.requiredBeams = s.requiredBeams || 1;
        item.active = false;
        return item;
      }),
      staticElements: (data.staticElements || []).map((el) => {
        const item = { type: el.type, x: Math.round(el.x), y: Math.round(el.y) };
        if (el.angle !== undefined) item.angle = el.angle;
        if (el.width !== undefined) item.width = el.width;
        if (el.height !== undefined) item.height = el.height;
        if (el.length !== undefined) item.length = el.length;
        if (el.size !== undefined) item.size = el.size;
        if (el.side !== undefined) item.side = el.side;
        if (el.radius !== undefined) item.radius = el.radius;
        if (el.curvature !== undefined) item.curvature = el.curvature;
        if (el.focalLength !== undefined) item.focalLength = el.focalLength;
        if (el.linkId !== undefined) item.linkId = el.linkId;
        return item;
      }),
      inventory: (data.inventory || []).map((i) => {
        const inv = { type: i.type, count: i.count };
        if (i.length !== undefined) inv.length = i.length;
        if (i.height !== undefined) inv.height = i.height;
        if (i.size !== undefined) inv.size = i.size;
        if (i.side !== undefined) inv.side = i.side;
        if (i.radius !== undefined) inv.radius = i.radius;
        if (i.curvature !== undefined) inv.curvature = i.curvature;
        if (i.focalLength !== undefined) inv.focalLength = i.focalLength;
        return inv;
      }),
      initialPlacements: []
    };

    const jsonStr = JSON.stringify(cleanLevel, null, 2);
    const indented = jsonStr.split('\n').map((line, i) => (i === 0 ? line : '  ' + line)).join('\n');
    return `window.Lumina = window.Lumina || {};\n\n(function() {\n  const level = ${indented};\n\n  window.Lumina.LevelRegistry.register(level);\n})();`;
  },

  parseCode(codeString) {
    try {
      const str = codeString.trim();
      const startIdx = str.indexOf('{');
      const endIdx = str.lastIndexOf('}');
      if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
        throw new Error('Could not find level configuration object in provided text.');
      }
      const jsonSnippet = str.substring(startIdx, endIdx + 1);
      const parsed = JSON.parse(jsonSnippet);
      if (!parsed.emitters || !parsed.sensors) {
        throw new Error('Code must contain emitters and sensors arrays.');
      }
      return parsed;
    } catch (err) {
      alert('Failed to import code: ' + err.message);
      return null;
    }
  },

  saveToStorage(levelData) {
    const titleInp = document.getElementById('editor-level-name-input') || document.getElementById('prop-level-title');
    if (titleInp && titleInp.value.trim()) {
      levelData.title = titleInp.value.trim();
    }
    const customLevels = this.getCustomLevels();
    const existingIdx = customLevels.findIndex((lvl) => lvl.id === levelData.id);
    if (existingIdx !== -1) {
      customLevels[existingIdx] = levelData;
    } else {
      customLevels.push(levelData);
    }
    localStorage.setItem('lumina_custom_levels', JSON.stringify(customLevels));
  },

  deleteFromStorage(levelId) {
    let customLevels = this.getCustomLevels();
    customLevels = customLevels.filter((lvl) => lvl.id !== levelId);
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