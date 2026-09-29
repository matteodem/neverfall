import { FOREST_GIANT_HILL, SOUTHWEST_LAKE, getForestGiantHillHeight } from "./worldConfig";

export const ENEMY_COMBAT_SPEED_MULTIPLIER = 1.0;

export const RARE_ENEMY = {
  chance: 0.05,
  healthMultiplier: 1.5,
  damageMultiplier: 1.25,
  scaleMultiplier: 1.1,
  lootChanceMultiplier: 2,
};

const BOSS_MECHANICS = {
  aoe: { telegraphDuration: 1500, radius: 3, cooldown: 8000 },
  charge: { windup: 800, speed: 18, radius: 1.5, maxDistance: 20, cooldown: 12000 },
  enrage: { threshold: 0.3, damageMultiplier: 1.25, speedMultiplier: 1.2 },
};

const BASE_STATS = {
  health: 100,
  attackDamage: 10,
  healthPerLevel: 50,
  damagePerLevel: 8,
  xpReward: 20,
  speed: 3.0,
  attackRange: 1.8,
  attackCooldown: 1000,
  respawnDelay: 5000,
  wanderRadius: 3,
  wanderWait: 1500,
  chaseRadius: 35,
};

const ANIMAL_ANIMATIONS = {
  idle: { from: 0, to: 29 },
  attack: { from: 30, to: 59 },
  walk: { from: 90, to: 119 },
};

export const ENEMY_TYPES = {
  boar: {
    name: "Boar",
    model: "boar.glb",
    scale: 0.3,
    rotationY: 0,
    animations: ANIMAL_ANIMATIONS,
  },
  wolf: {
    name: "Wolf",
    model: "wolf.glb",
    scale: 0.4,
    rotationY: 0,
    animations: { idle: "Idle", attack: "Attack", walk: "Walk" },
  },
  goat: {
    name: "Goat",
    model: "goat.glb",
    scale: 0.3,
    rotationY: 0,
    health: 120,
    healthPerLevel: 120,
    xpReward: 25,
    animations: ANIMAL_ANIMATIONS,
  },
  rat: {
    name: "Rat",
    model: "rat.glb",
    scale: 0.18,
    rotationY: 0,
    health: 120,
    healthPerLevel: 120,
    xpReward: 15,
    animations: ANIMAL_ANIMATIONS,
  },
  bee: {
    name: "Bee",
    model: "bee.glb",
    scale: 0.15,
    rotationY: 0,
    health: 120,
    healthPerLevel: 120,
    xpReward: 15,
    animations: ANIMAL_ANIMATIONS,
  },
  seal: {
    name: "Seal",
    model: "seal.glb",
    scale: 0.3,
    rotationY: 0,
    animations: ANIMAL_ANIMATIONS,
  },
  forestGiant: {
    bossMechanics: BOSS_MECHANICS,
    aggroRadius: 12,
    accessoryDropChance: 0.50,
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

ENEMY_TYPES.awakenedForestGiant = {
  ...ENEMY_TYPES.forestGiant,
  name: "Awakened Forest Giant",
  health: ENEMY_TYPES.forestGiant.health * 1.5,
  attackDamage: ENEMY_TYPES.forestGiant.attackDamage * 1.25,
  xpReward: 100,
  moneyReward: 0,
  equipmentDropChance: 0.35,
  accessoryDropChance: 0.75,
  emissiveColor: [0.10, 0.06, 0.14],
};

ENEMY_TYPES.alphaWolf = {
  ...ENEMY_TYPES.wolf,
  name: "Alpha Wolf",
  scale: 0.65,
  health: 1800,
  healthPerLevel: 0,
  attackDamage: 30,
  damagePerLevel: 0,
  speed: 3,
  attackRange: 2.2,
  aggroRadius: 40,
  bossMechanics: BOSS_MECHANICS,
  xpReward: 100,
  accessoryDropChance: 0.2,
};

// Reuse the existing ogre asset and animations for the small dungeon bosses.
ENEMY_TYPES.dungeonGuardian = {
  ...ENEMY_TYPES.forestGiant,
  accessoryDropChance: 0.20,
  name: "Dungeon Guardian", health: 350, attackDamage: 15, moneyReward: 0,
  healthPerLevel: 100, damagePerLevel: 5,
};
ENEMY_TYPES.dungeonWarden = {
  ...ENEMY_TYPES.forestGiant,
  name: "Dungeon Warden", health: 650, attackDamage: 20, moneyReward: 0, scale: 1.3,
  healthPerLevel: 100, damagePerLevel: 5,
};

export const getEnemyStats = (type = "boar", level = 1, rare = false) => {
  const config = { ...BASE_STATS, ...ENEMY_TYPES[type] };
  const variant = rare && !config.bossMechanics;
  return {
    ...config,
    name: variant ? `Rare ${config.name}` : config.name,
    scale: config.scale * (variant ? RARE_ENEMY.scaleMultiplier : 1),
    health: (config.health + (level - 1) * config.healthPerLevel) * (variant ? RARE_ENEMY.healthMultiplier : 1),
    attackDamage: (config.attackDamage + (level - 1) * config.damagePerLevel) * (variant ? RARE_ENEMY.damageMultiplier : 1),
  };
};

// North is +Z, west is -X, relative to the camp at the origin.
export const WOLF_AREA = { minX: -95, maxX: -40, minZ: 40, maxZ: 95 };
export { WORLD_SIZE as FOREST_SIZE } from "./worldConfig";

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
  { id: "forest-giant", type: "forestGiant", level: 5, ...FOREST_GIANT_HILL.center,
    y: getForestGiantHillHeight(FOREST_GIANT_HILL.center.x, FOREST_GIANT_HILL.center.z) },
  // Northern highlands: goats west, rats central, bees east.
  { id: "goat-1", type: "goat", level: 5, x: -160, y: 0, z: 180 },
  { id: "goat-2", type: "goat", level: 5, x: -176, y: 0, z: 198 },
  { id: "goat-3", type: "goat", level: 5, x: -144, y: 0, z: 212 },
  { id: "rat-1", type: "rat", level: 7, x: -12, y: 0, z: 200 },
  { id: "rat-2", type: "rat", level: 7, x: 14, y: 0, z: 218 },
  { id: "rat-3", type: "rat", level: 7, x: -16, y: 0, z: 234 },
  { id: "bee-1", type: "bee", level: 9, x: 160, y: 0, z: 220 },
  { id: "bee-2", type: "bee", level: 9, x: 176, y: 0, z: 238 },
  { id: "bee-3", type: "bee", level: 9, x: 144, y: 0, z: 254 },
  ...Array.from({ length: 5 }, (_, index) => {
    const angle = index * Math.PI * 2 / 5;
    const distance = SOUTHWEST_LAKE.radius + 7;
    return { id: `seal-${index + 1}`, type: "seal", level: 15,
      x: SOUTHWEST_LAKE.center.x + Math.cos(angle) * distance,
      y: 0,
      z: SOUTHWEST_LAKE.center.z + Math.sin(angle) * distance };
  }),
];
