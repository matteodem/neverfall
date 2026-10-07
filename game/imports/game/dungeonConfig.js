const corridorMap = {
  walls: [
    { name: "WallWest", size: { width: 1, height: 5, depth: 118 }, position: [-13, 2.5, 48] },
    { name: "WallEast", size: { width: 1, height: 5, depth: 118 }, position: [13, 2.5, 48] },
    { name: "WallSouth", size: { width: 27, height: 5, depth: 1 }, position: [0, 2.5, -11] },
    { name: "WallNorth", size: { width: 27, height: 5, depth: 1 }, position: [0, 2.5, 107] },
  ],
  pillars: [12, 32, 52, 72, 92].flatMap((z) => [-10, 10].map((x) => ({
    size: { width: 1.4, height: 6, depth: 1.4 }, position: [x, 3, z],
  }))),
};

export const DUNGEONS = [
  {
    id: "dungeon-01",
    name: "Forest Dungeon",
    roomName: "dungeon",
    recommendedLevel: 7,
    interactionTarget: "dungeon-entrance",
    entrance: { x: 0, y: 0, z: -90 },
    spawn: { x: 0, z: 0 },
    challengeMote: { position: { x: -6, y: 1.5, z: -2 } },
    chest: { x: 0, z: 86 },
    exit: { x: 0, z: 96 },
    interactionDistance: 3,
    enemyHealthMultiplier: 1.5,
    enemyDamageMultiplier: 1.5,
    enemySpeedMultiplier: 2.3,
    environment: { sky: "#1b202b", ground: "#333946", stone: "#404654" },
    map: corridorMap,
    rewards: { xp: 250, money: 10000, lootType: "dungeonChest" },
    miniBoss: { type: "dungeonGuardian" },
    finalBoss: { id: "dungeon-final-boss", type: "dungeonWarden", level: 11,
      position: { x: 0, y: 0, z: 77 } },
    stages: [
      { name: "Enemy Pack 1", enemies: [
        { id: "pack-1-a", type: "boar", level: 7, x: -3, y: 0, z: 18 },
        { id: "pack-1-b", type: "boar", level: 7, x: 3, y: 0, z: 21 },
      ] },
      { name: "Enemy Pack 2", enemies: [
        { id: "pack-2-a", type: "wolf", level: 8, x: -3, y: 0, z: 37 },
        { id: "pack-2-b", type: "wolf", level: 8, x: 3, y: 0, z: 40 },
      ] },
      { name: "Mini-Boss", enemies: [
        { id: "dungeon-mini-boss", type: "dungeonGuardian", level: 9, x: 0, y: 0, z: 58 },
      ] },
      { name: "Final Boss", boss: true },
    ],
  },
  {
    id: "northern-ruins",
    name: "Northern Ruins",
    roomName: "dungeon",
    recommendedLevel: 10,
    interactionTarget: "northern-ruins-entrance",
    entrance: { x: 80, y: 0, z: 180 },
    spawn: { x: 0, z: 0 },
    challengeMote: { position: { x: -6, y: 1.5, z: -2 } },
    chest: { x: 0, z: 86 },
    exit: { x: 0, z: 96 },
    interactionDistance: 3,
    enemyHealthMultiplier: 1.6,
    enemyDamageMultiplier: 1.6,
    enemySpeedMultiplier: 2.3,
    environment: { sky: "#17212b", ground: "#293b46", stone: "#465d68" },
    map: corridorMap,
    rewards: { xp: 400, money: 20000, lootType: "northernRuinsChest" },
    miniBoss: { type: "alphaWolf" },
    finalBoss: { id: "ruins-warden", type: "dungeonWarden", level: 13,
      position: { x: 0, y: 0, z: 77 } },
    stages: [
      { name: "Ruined Gate", enemies: [
        { id: "ruins-gate-a", type: "rat", level: 10, x: -3, y: 0, z: 18 },
        { id: "ruins-gate-b", type: "rat", level: 10, x: 3, y: 0, z: 21 },
      ] },
      { name: "Collapsed Halls", enemies: [
        { id: "ruins-hall-a", type: "bee", level: 11, x: -3, y: 0, z: 37 },
        { id: "ruins-hall-b", type: "wolf", level: 11, x: 3, y: 0, z: 40 },
      ] },
      { name: "Wolf Sentinel", enemies: [
        { id: "ruins-sentinel", type: "alphaWolf", level: 12, x: 0, y: 0, z: 58 },
      ] },
      { name: "Ruins Warden", boss: true },
    ],
  },
  {
    id: "sunken-ruins",
    name: "Sunken Ruins",
    roomName: "dungeon",
    recommendedLevel: 15,
    interactionTarget: "sunken-ruins-entrance",
    entrance: { x: -160, y: 0, z: -220 },
    spawn: { x: 0, z: 0 },
    challengeMote: { position: { x: -6, y: 1.5, z: -2 } },
    chest: { x: 0, z: 86 },
    exit: { x: 0, z: 96 },
    interactionDistance: 3,
    enemyHealthMultiplier: 1.5,
    enemyDamageMultiplier: 1.5,
    enemySpeedMultiplier: 2.3,
    environment: { sky: "#172b34", ground: "#34484b", stone: "#556d68" },
    map: {
      walls: corridorMap.walls,
      pillars: [12, 32, 52, 72, 92].flatMap((z, index) => [-10, 10].map((x) => ({
        size: { width: 1.6, height: index % 2 ? 3.5 : 5, depth: 1.6 },
        position: [x, index % 2 ? 1.75 : 2.5, z],
      }))),
      water: [
        { x: -7, z: 24, width: 8, depth: 10 },
        { x: 7, z: 46, width: 8, depth: 12 },
        { x: -7, z: 69, width: 8, depth: 11 },
      ],
    },
    rewards: { xp: 650, money: 25000, lootType: "sunkenRuinsChest" },
    miniBoss: { id: "sunken-guard-a" },
    finalBoss: { id: "sunken-final-boss", type: "drownedWarden", level: 17,
      position: { x: 0, y: 0, z: 77 } },
    stages: [
      { name: "Flooded Gate", enemies: [
        { id: "sunken-gate-a", type: "ruinRaider", level: 15, x: -3, y: 0, z: 17 },
        { id: "sunken-gate-b", type: "ruinRaider", level: 15, x: 3, y: 0, z: 19 },
        { id: "sunken-gate-c", type: "ruinRaider", level: 15, x: 0, y: 0, z: 23 },
      ] },
      { name: "Collapsed Hall", enemies: [
        { id: "sunken-hall-a", type: "ruinRaider", level: 15, x: -3, y: 0, z: 36 },
        { id: "sunken-hall-b", type: "ruinRaider", level: 15, x: 3, y: 0, z: 39 },
        { id: "sunken-hall-c", type: "sunkenGuardian", level: 16, x: -2, y: 0, z: 43,
          scaling: { speed: 2.8 } },
      ] },
      { name: "Guardian Chamber", enemies: [
        { id: "sunken-guard-a", type: "sunkenGuardian", level: 16, x: -3, y: 0, z: 58,
          scaling: { speed: 2.8, health: 1.4, damage: 1.15 } },
        { id: "sunken-guard-b", type: "sunkenGuardian", level: 16, x: 3, y: 0, z: 60,
          scaling: { speed: 2.8 } },
        { id: "sunken-guard-c", type: "ruinRaider", level: 15, x: 0, y: 0, z: 62 },
      ] },
      { name: "The Drowned Warden", boss: true },
    ],
  },
];

export const DUNGEON = DUNGEONS[0];
export const getDungeonConfig = (id) => DUNGEONS.find((dungeon) => dungeon.id === id);

export const nearDungeonObject = (position, object, distance = 3) => {
  if (!position || !object) return false;
  const dx = position.x - object.x;
  const dz = position.z - object.z;
  return dx * dx + dz * dz <= distance ** 2;
};

// Fields mirrored between an active dungeon player and their party presence.
export const DUNGEON_PLAYER_FIELDS = ["skill1", "skill2", "skill3", "skill4", "health", "maxHealth", "currentLevel", "currentXp", "ring", "accessory", "movementSpeedMultiplier", "speedPotionUntil", "powerPotionUntil", "respawnProtectedUntil", "talent5", "talent10", "talent15", "talent20"];
