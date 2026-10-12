window.Lumina = window.Lumina || {};

(function() {
  const level = {
    id: 2,
    title: 'Level 2',
    desc: 'Use two mirrors to route light around both obstacles.',
    emitters: [
      { x: 120, y: 200, angle: 0, color: 'white' }
    ],
    sensors: [
      { id: 's1', x: 880, y: 500, requiredColor: 'any', active: false }
    ],
    staticElements: [
      { type: 'blocker', x: 380, y: 200, width: 30, height: 160 },
      { type: 'blocker', x: 620, y: 500, width: 30, height: 160 }
    ],
    inventory: [
      { type: 'mirror', count: 2 }
    ],
    initialPlacements: []
  };

  window.Lumina.LevelRegistry.register(level);
})();