window.Lumina = window.Lumina || {};

(function() {
  const level = {
    id: 3,
    title: 'Level 3',
    desc: 'Use the concave mirror to converge dual parallel beams onto the receptor.',
    emitters: [
      { x: 120, y: 280, angle: 0, color: 'green' },
      { x: 120, y: 420, angle: 0, color: 'green' }
    ],
    sensors: [
      { id: 's_concave', x: 420, y: 350, requirements: [{ color: 'green', count: 2 }], requiredColor: 'green', requiredBeams: 2, active: false }
    ],
    staticElements: [
      { type: 'wall', x: 420, y: 230, width: 24, height: 80 },
      { type: 'wall', x: 420, y: 470, width: 24, height: 80 }
    ],
    inventory: [
      { type: 'mirror_concave', count: 1 }
    ],
    initialPlacements: []
  };

  window.Lumina.LevelRegistry.register(level);
})();