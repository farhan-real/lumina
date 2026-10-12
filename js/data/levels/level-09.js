window.Lumina = window.Lumina || {};

(function() {
  const level = {
    id: 9,
    title: 'Level 9',
    desc: 'Light entering Portal A emerges from Portal B. Cross the sealed wall.',
    emitters: [
      { x: 120, y: 180, angle: 0, color: 'blue' }
    ],
    sensors: [
      { id: 's_v', x: 880, y: 550, requiredColor: 'blue', active: false }
    ],
    staticElements: [
      { type: 'blocker', x: 500, y: 350, width: 40, height: 700 },
      { type: 'portal', x: 380, y: 180, angle: 90, linkId: 'p2' },
      { type: 'portal', x: 620, y: 550, angle: 90, linkId: 'p1' }
    ],
    inventory: [
      { type: 'mirror', count: 2 }
    ],
    initialPlacements: []
  };

  window.Lumina.LevelRegistry.register(level);
})();