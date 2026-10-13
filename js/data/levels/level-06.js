window.Lumina = window.Lumina || {};

(function() {
  const level = {
    id: 6,
    title: 'Level 6',
    desc: 'Separate the beam into Red, Green, and Blue rays to hit all 3 targets.',
    emitters: [
      { x: 100, y: 350, angle: 0, color: 'white' }
    ],
    sensors: [
      { id: 's_r', x: 750, y: 200, requiredColor: 'red', active: false },
      { id: 's_g', x: 750, y: 350, requiredColor: 'green', active: false },
      { id: 's_b', x: 750, y: 500, requiredColor: 'blue', active: false }
    ],
    staticElements: [
      { type: 'wall', x: 650, y: 265, width: 24, height: 50 },
      { type: 'wall', x: 650, y: 430, width: 24, height: 50 }
    ],
    inventory: [
      { type: 'prism', count: 1 },
      { type: 'mirror', count: 2 }
    ],
    initialPlacements: []
  };

  window.Lumina.LevelRegistry.register(level);
})();