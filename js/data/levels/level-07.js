window.Lumina = window.Lumina || {};

(function() {
  const level = {
    id: 7,
    title: 'Level 7',
    desc: 'Combine concave and convex lenses to guide the beam through the narrow slit.',
    emitters: [
      { x: 100, y: 350, angle: 0, color: 'violet' }
    ],
    sensors: [
      { id: 's_tgt', x: 900, y: 350, requiredColor: 'any', active: false }
    ],
    staticElements: [
      { type: 'wall', x: 650, y: 200, width: 30, height: 230 },
      { type: 'wall', x: 650, y: 500, width: 30, height: 230 }
    ],
    inventory: [
      { type: 'lens_concave', count: 1 },
      { type: 'lens_convex', count: 1 }
    ],
    initialPlacements: []
  };

  window.Lumina.LevelRegistry.register(level);
})();