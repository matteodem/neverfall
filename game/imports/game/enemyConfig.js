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
  forestGiant: {
    name: "Forest Giant",
    model: "mini-boss-ogre.glb",
    scale: 1.1,
    rotationY: 0,
    healthBarY: 3.5,
    nameplateY: 3.85,
    health: 2500,
    healthPerLevel: 0,
    attackDamage: 40,
    damagePerLevel: 0,
    attackRange: 2.5,
    attackCooldown: 1200,
    speed: 4.5,
    wanderRadius: 4,
    respawnDelay: 180000,
    xpReward: 0,
    moneyReward: 10000,
    animations: {
      idle: "CharacterArmature|Idle",
      walk: "CharacterArmature|Walk",
      attack: "CharacterArmature|Weapon",
    },
  },
};

// Reuse the existing ogre asset and animations for the small dungeon bosses.
ENEMY_TYPES.dungeonGuardian = {
  ...ENEMY_TYPES.forestGiant,
  name: "Dungeon Guardian", health: 350, attackDamage: 15, moneyReward: 0, speed: 2.5,
  healthPerLevel: 100, damagePerLevel: 5,
};
ENEMY_TYPES.dungeonWarden = {
  ...ENEMY_TYPES.forestGiant,
  name: "Dungeon Warden", health: 650, attackDamage: 20, moneyReward: 0, speed: 3, scale: 1.3,
  healthPerLevel: 100, damagePerLevel: 5,
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
  { id: "forest-giant", type: "forestGiant", level: 5, x: 70, y: 0, z: 72 },
];
