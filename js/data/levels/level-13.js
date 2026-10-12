window.Lumina = window.Lumina || {};

(function() {
  const level = {
    "id": 13,
    "title": "Level 13",
    "desc": "",
    "width": 1000,
    "height": 700,
    "emitters": [
      {
        "x": 120,
        "y": 350,
        "angle": 0,
        "color": "white"
      }
    ],
    "sensors": [
      {
        "id": "s1",
        "x": 880,
        "y": 350,
        "radius": 24,
        "requirements": [
          {
            "color": "any",
            "count": 1
          }
        ],
        "requiredColor": "any",
        "requiredBeams": 1,
        "active": false
      }
    ],
    "staticElements": [
      {
        "type": "wall",
        "x": 557,
        "y": 279,
        "angle": 0,
        "width": 30,
        "height": 500
      }
    ],
    "inventory": [
      {
        "type": "mirror_concave",
        "count": 1,
        "length": 90
      },
      {
        "type": "mirror_convex",
        "count": 1,
        "length": 90
      }
    ],
    "initialPlacements": []
  };

  window.Lumina.LevelRegistry.register(level);
})();