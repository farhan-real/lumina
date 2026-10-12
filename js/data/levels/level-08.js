window.Lumina = window.Lumina || {};

(function() {
  const level = {
    id: 8,
    title: 'Level 8',
    desc: 'The beam splitter divides light in two. Hit both green targets at once.',
    emitters: [
      { x: 100, y: 200, angle: 0, color: 'green' }
    ],
    sensors: [
      { id: 's_str', x: 900, y: 200, requiredColor: 'green', active: false },
      { id: 's_bot', x: 500, y: 620, requiredColor: 'green', active: false }
    ],
    staticElements: [
      { type: 'blocker', x: 500, y: 360, width: 30, height: 60 }
    ],
    inventory: [
      { type: 'beam_splitter', count: 1 },
      { type: 'mirror', count: 1 }
    ],
    initialPlacements: []
  };

  window.Lumina.LevelRegistry.register(level);
})();