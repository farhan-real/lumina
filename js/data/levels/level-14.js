window.Lumina = window.Lumina || {};

(function() {
  const level = {
    "id": 14,
    "title": "Level 14",
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
        "x": 684,
        "y": 339,
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
        "x": 495,
        "y": 309,
        "angle": 0,
        "width": 30,
        "height": 500
      },
      {
        "type": "black_hole",
        "x": 583,
        "y": 375,
        "radius": 24
      }
    ],
    "inventory": [
      {
        "type": "mirror_convex",
        "count": 1,
        "length": 90
      },
      {
        "type": "mirror",
        "count": 1,
        "length": 80
      }
    ],
    "initialPlacements": []
  };

  window.Lumina.LevelRegistry.register(level);
})();