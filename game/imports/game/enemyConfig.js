const BASE_STATS = {
  health: 100,
  attackDamage: 10,
  healthPerLevel: 50,
  damagePerLevel: 5,
  xpReward: 20,
  speed: 2,
  attackRange: 1.8,
  attackCooldown: 1000,
  respawnDelay: 5000,
  wanderRadius: 3,
  wanderWait: 1500,
};

export const ENEMY_TYPES = {
  boar: {
    name: "Boar",
    model: "boar.glb",
    scale: 0.3,
    rotationY: 0,
    animations: {
      idle: { from: 0, to: 29 },
      attack: { from: 30, to: 59 },
      walk: { from: 90, to: 119 },
    },
  },
  wolf: {
    name: "Wolf",
    model: "wolf.glb",
    scale: 0.4,
    rotationY: 0,
    animations: { idle: "Idle", attack: "Attack", walk: "Walk" },
  },
};

export const getEnemyStats = (type = "boar", level = 1) => {
  const config = { ...BASE_STATS, ...ENEMY_TYPES[type] };
  return {
    ...config,
    health: config.health + (level - 1) * config.healthPerLevel,
    attackDamage: config.attackDamage + (level - 1) * config.damagePerLevel,
  };
};

// North is +Z, west is -X, relative to the camp at the origin.
export const WOLF_AREA = { minX: -95, maxX: -40, minZ: 40, maxZ: 95 };
export const FOREST_SIZE = 200;

export const ENEMY_SPAWNS = [
  { id: "boar-1", type: "boar", level: 1, x: -20, y: 0, z: 16 },
  { id: "boar-2", type: "boar", level: 1, x: 19, y: 0, z: 18 },
  { id: "boar-3", type: "boar", level: 1, x: -19, y: 0, z: -17 },
  { id: "boar-4", type: "boar", level: 1, x: 20, y: 0, z: -15 },
  { id: "boar-5", type: "boar", level: 1, x: 22, y: 0, z: 2 },
  { id: "wolf-1", type: "wolf", level: 3, x: -55, y: 0, z: 60 },
  { id: "wolf-2", type: "wolf", level: 3, x: -68, y: 0, z: 58 },
  { id: "wolf-3", type: "wolf", level: 3, x: -80, y: 0, z: 65 },
  { id: "wolf-4", type: "wolf", level: 3, x: -60, y: 0, z: 80 },
  { id: "wolf-5", type: "wolf", level: 3, x: -77, y: 0, z: 82 },
];
