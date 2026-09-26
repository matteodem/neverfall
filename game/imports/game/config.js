export const PLAYER = {
  speed: 4,
};

export const CAMERA = {
  radius: 14,
  minRadius: 4,
  maxRadius: 30,

  minBeta: 0.25,
  maxBeta: Math.PI / 2 - 0.05,

  mouseSensitivity: 0.005,
  zoomSensitivity: 0.01,
};

export const ATTACK = {
  duration: 500,
  range: 2.5,
  knockback: 0.5,
  cooldown: 250,
};

export const WARRIOR_SKILLS = {
  Digit1: { damageMultiplier: 1, cooldown: ATTACK.cooldown, range: ATTACK.range },
  Digit2: { damageMultiplier: 2, cooldown: 4000, range: ATTACK.range },
  Digit3: { damageMultiplier: 1.25, cooldown: 6000, range: 2.5, aoe: true },
};

export const HEAL = {
  amount: 40,
  cooldown: 15000,
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
