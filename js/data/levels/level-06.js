window.Lumina = window.Lumina || {};

(function() {
  const level = {
    id: 6,
    title: 'Level 6',
    desc: 'Use a concave lens to diverge light outward to reach distant sensors.',
    emitters: [
      { x: 100, y: 350, angle: 0, color: 'amber' }
    ],
    sensors: [
      { id: 's_up', x: 880, y: 160, requiredColor: 'any', active: false },
      { id: 's_dn', x: 880, y: 540, requiredColor: 'any', active: false }
    ],
    staticElements: [
      { type: 'wall', x: 880, y: 350, width: 40, height: 180 }
    ],
    inventory: [
      { type: 'lens_concave', count: 1 },
      { type: 'mirror', count: 2 }
    ],
    initialPlacements: []
  };

  window.Lumina.LevelRegistry.register(level);
})();