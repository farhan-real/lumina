window.Lumina = window.Lumina || {};

(function() {
  const level = {
    id: 5,
    title: 'Level 5',
    desc: 'Use a convex lens to focus both beams into the middle target opening.',
    emitters: [
      { x: 120, y: 280, angle: 0, color: 'cyan' },
      { x: 120, y: 420, angle: 0, color: 'cyan' }
    ],
    sensors: [
      { id: 's_focal', x: 880, y: 350, requiredColor: 'cyan', requiredBeams: 2, active: false }
    ],
    staticElements: [
      { type: 'blocker', x: 740, y: 190, width: 30, height: 160 },
      { type: 'blocker', x: 740, y: 510, width: 30, height: 160 }
    ],
    inventory: [
      { type: 'lens_convex', count: 1 }
    ],
    initialPlacements: []
  };

  window.Lumina.LevelRegistry.register(level);
})();