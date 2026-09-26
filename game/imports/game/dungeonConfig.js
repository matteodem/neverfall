export const DUNGEON = {
  entrance: { x: 0, z: -90 },
  spawn: { x: 0, z: 0 },
  chest: { x: 0, z: 86 },
  exit: { x: 0, z: 96 },
  interactionDistance: 3,
  rewardXp: 250,
  rewardMoney: 10000,
  stages: [
    { name: "Enemy Pack 1", enemies: [
      { id: "pack-1-a", type: "boar", level: 5, x: -3, y: 0, z: 18 },
      { id: "pack-1-b", type: "boar", level: 5, x: 3, y: 0, z: 21 },
    ] },
    { name: "Enemy Pack 2", enemies: [
      { id: "pack-2-a", type: "wolf", level: 5, x: -3, y: 0, z: 37 },
      { id: "pack-2-b", type: "wolf", level: 5, x: 3, y: 0, z: 40 },
    ] },
    { name: "Mini-Boss", enemies: [
      { id: "dungeon-mini-boss", type: "dungeonGuardian", level: 6, x: 0, y: 0, z: 58 },
    ] },
    { name: "Final Boss", enemies: [
      { id: "dungeon-final-boss", type: "dungeonWarden", level: 7, x: 0, y: 0, z: 77 },
    ] },
  ],
};

export const nearDungeonObject = (position, object, distance = DUNGEON.interactionDistance) => {
  if (!position || !object) return false;
  const dx = position.x - object.x;
  const dz = position.z - object.z;
  return dx * dx + dz * dz <= distance ** 2;
};

// Fields mirrored between an active dungeon player and their party presence.
export const DUNGEON_PLAYER_FIELDS = ["health", "maxHealth", "currentLevel", "currentXp", "ring", "accessory"];
