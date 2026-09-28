export const DUNGEONS = [
  {
    id: "dungeon-01",
    name: "Forest Dungeon",
    roomName: "dungeon",
    recommendedLevel: 7,
    interactionTarget: "dungeon-entrance",
    entrance: { x: 0, y: 0, z: -90 },
    spawn: { x: 0, z: 0 },
    chest: { x: 0, z: 86 },
    exit: { x: 0, z: 96 },
    interactionDistance: 3,
    enemyHealthMultiplier: 1.5,
    enemyDamageMultiplier: 1.5,
    enemySpeedMultiplier: 2.3,
    environment: { sky: "#1b202b", ground: "#333946", stone: "#404654" },
    rewards: { xp: 250, money: 10000, lootType: "dungeonChest" },
    miniBoss: { type: "dungeonGuardian" },
    finalBoss: { type: "dungeonWarden" },
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
      { name: "Final Boss", enemies: [
        { id: "dungeon-final-boss", type: "dungeonWarden", level: 11, x: 0, y: 0, z: 77 },
      ] },
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
    chest: { x: 0, z: 86 },
    exit: { x: 0, z: 96 },
    interactionDistance: 3,
    enemyHealthMultiplier: 1.6,
    enemyDamageMultiplier: 1.6,
    enemySpeedMultiplier: 2.3,
    environment: { sky: "#17212b", ground: "#293b46", stone: "#465d68" },
    rewards: { xp: 400, money: 20000, lootType: "northernRuinsChest" },
    miniBoss: { type: "alphaWolf" },
    finalBoss: { type: "dungeonWarden" },
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
      { name: "Ruins Warden", enemies: [
        { id: "ruins-warden", type: "dungeonWarden", level: 13, x: 0, y: 0, z: 77 },
      ] },
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
export const DUNGEON_PLAYER_FIELDS = ["health", "maxHealth", "currentLevel", "currentXp", "ring", "accessory", "movementSpeedMultiplier", "respawnProtectedUntil"];
