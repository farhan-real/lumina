window.Lumina = window.Lumina || {};

(function() {
  const level = {
    id: 10,
    title: 'Level 10',
    desc: 'The beam splitter divides light in two. Hit both green targets at once.',
    emitters: [
      { x: 100, y: 200, angle: 0, color: 'green' }
    ],
    sensors: [
      {
        id: 's_str',
        x: 880,
        y: 200,
        requirements: [{ color: 'green', count: 1 }],
        requiredColor: 'green',
        requiredBeams: 1,
        active: false
      },
      {
        id: 's_bot',
        x: 650,
        y: 460,
        requirements: [{ color: 'green', count: 1 }],
        requiredColor: 'green',
        requiredBeams: 1,
        active: false
      }
    ],
    staticElements: [
      { type: 'wall', x: 480, y: 340, width: 24, height: 100 }
    ],
    inventory: [
      { type: 'beam_splitter', count: 1 },
      { type: 'mirror', count: 1 }
    ],
    initialPlacements: []
  };

  window.Lumina.LevelRegistry.register(level);
})();