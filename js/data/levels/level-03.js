window.Lumina = window.Lumina || {};

(function() {
  const level = {
    id: 3,
    title: 'Level 3',
    desc: 'Prisms split white light into colors. Direct Red and Blue to their targets.',
    emitters: [
      { x: 120, y: 350, angle: 0, color: 'white' }
    ],
    sensors: [
      { id: 's_red', x: 860, y: 240, requiredColor: 'red', active: false },
      { id: 's_blue', x: 860, y: 460, requiredColor: 'blue', active: false }
    ],
    staticElements: [
      { type: 'wall', x: 640, y: 350, width: 30, height: 80 }
    ],
    inventory: [
      { type: 'prism', count: 1 },
      { type: 'mirror', count: 1 }
    ],
    initialPlacements: []
  };

  window.Lumina.LevelRegistry.register(level);
})();