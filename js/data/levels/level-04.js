window.Lumina = window.Lumina || {};

(function() {
  const level = {
    id: 4,
    title: 'Level 4',
    desc: 'Use the convex mirror to diverge a single beam into both separated sensors.',
    emitters: [
      { x: 120, y: 350, angle: 0, color: 'amber' }
    ],
    sensors: [
      { id: 's_cv_bot', x: 260, y: 510, requiredColor: 'amber', active: false }
    ],
    staticElements: [
      { type: 'wall', x: 260, y: 350, width: 24, height: 160 }
    ],
    inventory: [
      { type: 'mirror_convex', count: 1 }
    ],
    initialPlacements: []
  };

  window.Lumina.LevelRegistry.register(level);
})();