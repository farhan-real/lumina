window.Lumina = window.Lumina || {};

window.Lumina.Constants = {
  MAX_DPR: 1.5,
  MAX_RAY_DEPTH: 48,
  MAX_RAY_POOL_SIZE: 256,

  // Virtual room bounds
  ROOM_WIDTH: 1000,
  ROOM_HEIGHT: 700,

  // Optics Physics
  AIR_INDEX: 1.0,
  GLASS_INDEX: 1.52,
  FOCAL_LENGTH_CONVEX: 250,
  FOCAL_LENGTH_CONCAVE: -180,

  // Sensor parameters
  SENSOR_RADIUS: 24,

  // Calibrated color spectrum map
  COLOR_MAP: {
    white: [1.0, 1.0, 1.0],
    red: [1.0, 0.2, 0.25],
    green: [0.1, 1.0, 0.35],
    blue: [0.1, 0.3, 1.0],
    cyan: [0.0, 0.9, 1.0],
    amber: [1.0, 0.65, 0.0],
    violet: [0.75, 0.1, 1.0]
  }
};