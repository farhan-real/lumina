window.Lumina = window.Lumina || {};

(function() {
  const level = {
    id: 10,
    title: 'Level 10',
    desc: 'Black holes curve light with intense gravity. Curve the ray around the wall.',
    emitters: [
      { x: 120, y: 180, angle: 5, color: 'white' }
    ],
    sensors: [
      { id: 's_bh', x: 880, y: 540, requiredColor: 'any', active: false }
    ],
    staticElements: [
      { type: 'blocker', x: 500, y: 350, width: 35, height: 180 },
      { type: 'black_hole', x: 500, y: 350, radius: 24 }
    ],
    inventory: [
      { type: 'mirror', count: 2 },
      { type: 'prism', count: 1 }
    ],
    initialPlacements: []
  };

  window.Lumina.LevelRegistry.register(level);
})();