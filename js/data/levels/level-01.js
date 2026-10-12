window.Lumina = window.Lumina || {};

(function() {
  const level = {
    id: 1,
    title: 'Level 1',
    desc: 'Bounce the beam of light off the mirror to reach the target.',
    emitters: [
      { x: 140, y: 350, angle: 0, color: 'white' }
    ],
    sensors: [
      { id: 's1', x: 840, y: 160, requiredColor: 'any', active: false }
    ],
    staticElements: [
      { type: 'wall', x: 500, y: 410, width: 36, height: 180 }
    ],
    inventory: [
      { type: 'mirror', count: 1 }
    ],
    initialPlacements: []
  };

  window.Lumina.LevelRegistry.register(level);
})();