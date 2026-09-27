export const PERFORMANCE = {
  movementInterval: 50,
  statePatchInterval: 100,
  inactiveEnemyInterval: 500,
  activeEnemyDistance: 250,
};

export const QUALITY_PRESETS = {
  standard: { density: 1, resolutionScale: 1, glowTextureSize: 512, enemyDistance: 190, playerDistance: 220, labelDistance: 70 },
  low: { density: 0.5, resolutionScale: 1.5, glowTextureSize: 256, enemyDistance: 120, playerDistance: 150, labelDistance: 45 },
};
