export const PLAYER = {
  speed: 4,
};

export const CAMERA = {
  radius: 9,
  minRadius: 4,
  maxRadius: 14,

  minBeta: 0.25,
  maxBeta: Math.PI / 2 - 0.05,

  mouseSensitivity: 0.005,
  zoomSensitivity: 0.01,
};

export const ATTACK = {
  damage: 25,
  duration: 500,
  range: 2.5,
  knockback: 0.5,
  cooldown: 1000,
};

export const JUMP = {
  velocity: 6,
  gravity: 16,
  groundY: 0,
};

export const SWORD = {
  position: {
    x: 0,
    y: 0,
    z: 0,
  },

  rotation: {
    x: Math.PI / 2,
    y: 0,
    z: 0,
  },

  scale: 0.7,
};