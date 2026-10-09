import { FOREST_GIANT_HILL, SNOWY_MOUNTAINS, SOUTHWEST_LAKE, getForestGiantHillHeight } from "./worldConfig";

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
  attackDamage: 5,
  healthPerLevel: 50,
  damagePerLevel: 8,
  xpReward: 40,
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
    xpReward: 20,
    animations: ANIMAL_ANIMATIONS,
  },
  wolf: {
    name: "Wolf",
    model: "wolf.glb",
    scale: 0.4,
    rotationY: 0,
    animations: { idle: "Idle", attack: "Attack", walk: "Gallop" },
  },
  goat: {
    name: "Goat",
    model: "goat.glb",
    scale: 0.3,
    rotationY: 0,
    health: 120,
    healthPerLevel: 120,
    xpReward: 50,
    animations: ANIMAL_ANIMATIONS,
  },
  rat: {
    name: "Rat",
    model: "rat.glb",
    scale: 0.18,
    rotationY: 0,
    health: 120,
    healthPerLevel: 120,
    animations: ANIMAL_ANIMATIONS,
  },
  bee: {
    hitStatus: "poison",
    name: "Bee",
    model: "bee.glb",
    scale: 0.15,
    rotationY: 0,
    health: 120,
    healthPerLevel: 120,
    animations: ANIMAL_ANIMATIONS,
  },
  seal: {
    name: "Seal",
    model: "seal.glb",
    scale: 0.3,
    rotationY: 0,
    health: 120,
    healthPerLevel: 120,
    animations: ANIMAL_ANIMATIONS,
  },
  forestGiant: {
    heavyHitStatus: "slow",
    bossMechanics: BOSS_MECHANICS,
    aggroRadius: 12,
    accessoryDropChance: 0.50,
    name: "Forest Giant",
    model: "bosses/ogre-boss.glb",
    scale: 2.75,
    rotationY: 0,
    healthBarY: 5.30,
    nameplateY: 4.90,
    health: 2500,
    healthPerLevel: 100,
    attackDamage: 80,
    damagePerLevel: 0,
    attackRange: 2.5,
    attackCooldown: 1200,
    wanderRadius: 4,
    respawnDelay: 180000,
    xpReward: 0,
    moneyReward: 10000,
    animations: {
      idle: "Idle_11",
      walk: "Walking",
      run: "Running",
      attack: "Attack",
    },
  },
};

ENEMY_TYPES.awakenedForestGiant = {
  ...ENEMY_TYPES.forestGiant,
  name: "Awakened Forest Giant",
  health: ENEMY_TYPES.forestGiant.health * 1.5,
  attackDamage: ENEMY_TYPES.forestGiant.attackDamage * 1.25,
  xpReward: 200,
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
  healthPerLevel: 100,
  attackDamage: 60,
  damagePerLevel: 0,
  speed: 3,
  attackRange: 2.2,
  aggroRadius: 40,
  bossMechanics: BOSS_MECHANICS,
  xpReward: 200,
  accessoryDropChance: 0.2,
};

ENEMY_TYPES.snowWolf = {
  ...ENEMY_TYPES.wolf,
  hitStatus: "slow",
  name: "Snow Wolf",
  health: 240,
  healthPerLevel: 80,
  attackDamage: 10,
  damagePerLevel: 8,
  xpReward: 140,
};
ENEMY_TYPES.mountainGoat = {
  ...ENEMY_TYPES.goat,
  name: "Mountain Goat",
  health: 300,
  attackDamage: 12,
  xpReward: 180,
};
ENEMY_TYPES.frostboundSentinel = {
  ...ENEMY_TYPES.snowWolf,
  name: "Frostbound Sentinel",
  scale: 0.65,
  health: 850,
  healthPerLevel: 90,
  attackDamage: 45,
  damagePerLevel: 8,
  xpReward: 250,
  respawnDelay: 180000,
};
ENEMY_TYPES.frostOgre = {
  ...ENEMY_TYPES.forestGiant,
  bossMechanics: {
    ...BOSS_MECHANICS,
    aoe: { ...BOSS_MECHANICS.aoe, name: "Frost Slam", color: "#72ddff" },
  },
  animations: { ...ENEMY_TYPES.forestGiant.animations, heavyAttack: "Attack" },
  name: "Frost Ogre",
  health: 3200,
  attackDamage: 110,
  xpReward: 500,
  moneyReward: 20000,
  accessoryDropChance: 0.6,
  emissiveColor: [0.06, 0.13, 0.18],
};

ENEMY_TYPES.hammerBoss = {
  ...ENEMY_TYPES.forestGiant,
  bossMechanics: {
    ...BOSS_MECHANICS,
    aoe: { ...BOSS_MECHANICS.aoe, name: "Hammer Smash", color: "#ffb347", telegraphDuration: 1800 },
  },
  name: "Hammer Guardian",
  model: "bosses/hammer-boss.glb",
  scale: 1.4,
  healthBarY: 3.8,
  nameplateY: 4.15,
  health: 12000,
  healthPerLevel: 0,
  attackDamage: 375,
  speed: 3.5,
  xpReward: 650,
  moneyReward: 22000,
  animations: {
    idle: "Idle_9",
    walk: "Walking",
    run: "Running",
    attack: "Attack",
    heavyAttack: "Heavy_Hammer_Swing",
    death: "dying_backwards",
  },
};

// Reuse the ogre boss asset and animations for the small dungeon bosses.
ENEMY_TYPES.dungeonGuardian = {
  ...ENEMY_TYPES.forestGiant,
  accessoryDropChance: 0.20,
  name: "Dungeon Guardian", health: 350, attackDamage: 30, moneyReward: 0,
  healthPerLevel: 200, damagePerLevel: 10,
};
ENEMY_TYPES.dungeonWarden = {
  ...ENEMY_TYPES.forestGiant,
  name: "Dungeon Warden", health: 650, attackDamage: 40, moneyReward: 0, scale: 3.25,
  healthBarY: 6.75, nameplateY: 4.85,
  healthPerLevel: 200, damagePerLevel: 10,
};

ENEMY_TYPES.ruinRaider = {
  ...ENEMY_TYPES.wolf,
  name: "Ruin Raider",
  health: 180,
  healthPerLevel: 48,
  attackDamage: 10,
  damagePerLevel: 7,
  xpReward: 130,
};
ENEMY_TYPES.highlandsRelicGuardian = {
  ...ENEMY_TYPES.ruinRaider,
  name: "Highlands Relic Guardian",
  scale: 0.8,
  health: 750,
  healthPerLevel: 60,
  attackDamage: 45,
  damagePerLevel: 3,
  xpReward: 200,
  respawnDelay: 180000,
};
ENEMY_TYPES.sunkenGuardian = {
  ...ENEMY_TYPES.dungeonGuardian,
  bossMechanics: undefined,
  name: "Sunken Guardian",
  health: 400,
  healthPerLevel: 70,
  attackDamage: 18,
  damagePerLevel: 9,
  xpReward: 180,
  accessoryDropChance: 0.08,
};
ENEMY_TYPES.drownedWarden = {
  ...ENEMY_TYPES.dungeonWarden,
  bossMechanics: {
    ...BOSS_MECHANICS,
    aoe: { ...BOSS_MECHANICS.aoe, name: "Crushing Undertow", color: "#63e6c6" },
  },
  animations: { ...ENEMY_TYPES.dungeonWarden.animations, heavyAttack: "Attack" },
  name: "The Drowned Warden",
  health: 900,
  attackDamage: 45,
  xpReward: 0,
  accessoryDropChance: 0.45,
  emissiveColor: [0.06, 0.16, 0.18],
};

// Tune the early encounter after derived bosses copy the original ogre defaults.
// This keeps the Awakened Giant, dungeon bosses, Frost Ogre and Hammer Guardian unchanged.
ENEMY_TYPES.forestGiant = {
  ...ENEMY_TYPES.forestGiant,
  health: 3000,
  healthPerLevel: 0,
  attackDamage: 40,
  speed: 4 / 2.3, // WorldRoom applies the existing 2.3x movement multiplier.
  attackCooldown: 1600,
  damageOverTimeMultiplier: 0.1,
  bossMechanics: {
    aoe: { ...BOSS_MECHANICS.aoe, name: "Forest Slam", color: "#e5b55b",
      telegraphDuration: 2000, cooldown: 10000 },
    charge: { ...BOSS_MECHANICS.charge, windup: 1400, speed: 10, maxDistance: 12, cooldown: 14000 },
    enrage: { ...BOSS_MECHANICS.enrage, damageMultiplier: 1.2, speedMultiplier: 1.1 },
  },
  animations: { ...ENEMY_TYPES.forestGiant.animations, heavyAttack: "Attack" },
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
  { id: "wolf-1", type: "wolf", level: 2, x: -55, y: 0, z: 60 },
  { id: "wolf-2", type: "wolf", level: 2, x: -68, y: 0, z: 58 },
  { id: "wolf-3", type: "wolf", level: 2, x: -80, y: 0, z: 65 },
  { id: "wolf-4", type: "wolf", level: 2, x: -60, y: 0, z: 80 },
  { id: "wolf-5", type: "wolf", level: 2, x: -77, y: 0, z: 82 },
  { id: "forest-giant", type: "forestGiant", level: 3, ...FOREST_GIANT_HILL.center,
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
  { id: "highlands-relic-guardian", type: "highlandsRelicGuardian", level: 10, x: 105, y: 0, z: 180 },
  { id: "snow-wolf-1", type: "snowWolf", level: 10, x: 224, y: 0, z: 43 },
  { id: "snow-wolf-2", type: "snowWolf", level: 10, x: 240, y: 0, z: 55 },
  { id: "snow-wolf-3", type: "snowWolf", level: 10, x: 252, y: 0, z: 39 },
  { id: "mountain-goat-1", type: "mountainGoat", level: 12, x: 188, y: 0, z: -42 },
  { id: "mountain-goat-2", type: "mountainGoat", level: 12, x: 202, y: 0, z: -52 },
  { id: "mountain-goat-3", type: "mountainGoat", level: 12, x: 219, y: 0, z: -38 },
  { id: "frostbound-sentinel", type: "frostboundSentinel", level: 12, x: 235, y: 0, z: -110 },
  { id: "frost-ogre", type: "frostOgre", level: 14, y: 0, ...SNOWY_MOUNTAINS.boss },
  { id: "hammer-guardian", type: "hammerBoss", level: 17, x: -225, y: 0, z: -210 },
  ...Array.from({ length: 5 }, (_, index) => {
    const angle = index * Math.PI * 2 / 5;
    const distance = SOUTHWEST_LAKE.radius + 7;
    return { id: `seal-${index + 1}`, type: "seal", level: 15,
      x: SOUTHWEST_LAKE.center.x + Math.cos(angle) * distance,
      y: 0,
      z: SOUTHWEST_LAKE.center.z + Math.sin(angle) * distance };
  }),
];
