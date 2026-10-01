import { ENEMY_SPAWNS, WOLF_AREA } from "./enemyConfig";

export const BOAR_HUNT_QUEST = {
  progressField: "boarQuestKills",

  id:
    "boar-hunt",

  title:
    "Boar Hunt",

  description:
    "Kill 5 Boars",

  target:
    5,

  rewardXp:
    100,
};

export const WOLF_HUNT_QUEST = {
  id: "wolf-hunt",
  title: "Wolf Hunt",
  description: "Kill 5 Wolves",
  progressField: "wolfQuestKills",
  target: 5,
  rewardXp: 250,
};

export const GIANT_HUNT_QUEST = {
  id: "giant-hunt",
  title: "Forest Giant Hunt",
  description: "Kill the Forest Giant",
  progressField: "giantQuestKills",
  target: 1,
  rewardXp: 500,
};

export const HUNT_QUESTS = {
  boar: BOAR_HUNT_QUEST,
  wolf: WOLF_HUNT_QUEST,
  forestGiant: GIANT_HUNT_QUEST,
  goat: {
    ...BOAR_HUNT_QUEST,
    id: "goat-hunt", title: "Goat Hunt", description: "Kill 5 Goats",
    progressField: "goatQuestKills", rewardXp: 500,
  },
  rat: {
    ...BOAR_HUNT_QUEST,
    id: "rat-hunt", title: "Rat Hunt", description: "Kill 5 Rats",
    progressField: "ratQuestKills", rewardXp: 750,
  },
  bee: {
    ...BOAR_HUNT_QUEST,
    id: "bee-hunt", title: "Bee Hunt", description: "Kill 5 Bees",
    progressField: "beeQuestKills", rewardXp: 1000,
  },
  seal: {
    ...BOAR_HUNT_QUEST,
    id: "seal-hunt", title: "Seal Hunt", description: "Kill 5 Seals",
    progressField: "sealQuestKills", rewardXp: 1250,
  },
  snowWolf: {
    ...BOAR_HUNT_QUEST,
    id: "snow-wolf-hunt", title: "Snow Wolf Hunt", description: "Kill 5 Snow Wolves",
    progressField: "snowWolfQuestKills", rewardXp: 1250,
  },
  mountainGoat: {
    ...BOAR_HUNT_QUEST,
    id: "mountain-goat-hunt", title: "Mountain Goat Hunt", description: "Kill 5 Mountain Goats",
    progressField: "mountainGoatQuestKills", rewardXp: 1500,
  },
  frostOgre: {
    ...GIANT_HUNT_QUEST,
    id: "frost-ogre-hunt", title: "Frost Ogre Hunt", description: "Kill the Frost Ogre",
    progressField: "frostOgreQuestKills", rewardXp: 2000,
  },
};

// New quests are available automatically; NPC quest givers can use the same
// definitions later without changing how objectives advance.
export const QUESTS = [
  ...Object.entries(HUNT_QUESTS).map(([type, hunt]) => ({
    ...hunt,
    objective: { type: ["forestGiant", "frostOgre"].includes(type) ? "Boss" : "Kill", target: type, amount: hunt.target },
    rewards: { xp: hunt.rewardXp },
    repeatable: true,
  })),
  {
    id: "wolf-problem", title: "Wolf Problem", description: "Kill 10 Wolves",
    objective: { type: "Kill", target: "wolf", amount: 10 },
    rewards: { xp: 300, gold: 1 },
  },
  {
    id: "giant-threat", title: "Giant Threat", description: "Defeat the Forest Giant",
    objective: { type: "Boss", target: "forestGiant", amount: 1 },
    rewards: { xp: 500, gold: 2 },
  },
  {
    id: "explore-highlands", title: "Explore the Highlands", description: "Reach the Highlands lookout",
    objective: { type: "ReachLocation", target: "highlands-lookout", amount: 1, x: 40, z: 245, radius: 12 },
    rewards: { xp: 200, gold: 1 },
  },
  {
    id: "find-the-depths", title: "Find the Depths", description: "Use the Forest Dungeon entrance",
    objective: { type: "Interact", target: "dungeon-entrance", amount: 1 },
    rewards: { xp: 100 },
  },
  {
    id: "awakened-threat", title: "Awakened Threat", description: "Kill Awakened Forest Giant",
    objective: { type: "CompleteEvent", target: "forest-giant-awakening", amount: 1 },
    rewards: { xp: 500, gold: 2 },
  },
  {
    id: "into-the-depths", title: "Into the Depths", description: "Complete Forest Dungeon",
    objective: { type: "CompleteDungeon", target: "dungeon-01", amount: 1 },
    rewards: { xp: 250, gold: 2 },
  },
  {
    id: "northern-ruins-quest", title: "Northern Ruins", description: "Complete Northern Ruins",
    objective: { type: "CompleteDungeon", target: "northern-ruins", amount: 1 },
    rewards: { xp: 400, gold: 2 },
  },
];

const boarSpawns = ENEMY_SPAWNS.filter(({ type }) => type === "boar");
const BOAR_AREA_PADDING = 20;
const BOAR_AREA = {
  minX: Math.min(...boarSpawns.map(({ x }) => x)) - BOAR_AREA_PADDING,
  maxX: Math.max(...boarSpawns.map(({ x }) => x)) + BOAR_AREA_PADDING,
  minZ: Math.min(...boarSpawns.map(({ z }) => z)) - BOAR_AREA_PADDING,
  maxZ: Math.max(...boarSpawns.map(({ z }) => z)) + BOAR_AREA_PADDING,
};

const giantSpawn = ENEMY_SPAWNS.find(({ type }) => type === "forestGiant");
const frostOgreSpawn = ENEMY_SPAWNS.find(({ type }) => type === "frostOgre");
const GIANT_QUEST_RADIUS = 25;

const newHuntAreas = ["goat", "rat", "bee", "seal", "snowWolf", "mountainGoat"].map((type) => {
  const spawns = ENEMY_SPAWNS.filter((spawn) => spawn.type === type);
  return {
    type,
    minX: Math.min(...spawns.map(({ x }) => x)) - BOAR_AREA_PADDING,
    maxX: Math.max(...spawns.map(({ x }) => x)) + BOAR_AREA_PADDING,
    minZ: Math.min(...spawns.map(({ z }) => z)) - BOAR_AREA_PADDING,
    maxZ: Math.max(...spawns.map(({ z }) => z)) + BOAR_AREA_PADDING,
  };
});

export const getQuestArea = ({ x, z }) => {
  if (Math.hypot(x - frostOgreSpawn.x, z - frostOgreSpawn.z) <= GIANT_QUEST_RADIUS) {
    return "frostOgre";
  }
  const huntArea = newHuntAreas.find((area) =>
    x >= area.minX && x <= area.maxX && z >= area.minZ && z <= area.maxZ);
  if (huntArea) return huntArea.type;
  if (Math.hypot(x - giantSpawn.x, z - giantSpawn.z) <= GIANT_QUEST_RADIUS) {
    return "forestGiant";
  }
  if (x >= WOLF_AREA.minX && x <= WOLF_AREA.maxX &&
      z >= WOLF_AREA.minZ && z <= WOLF_AREA.maxZ) {
    return "wolf";
  }
  if (x >= BOAR_AREA.minX && x <= BOAR_AREA.maxX &&
      z >= BOAR_AREA.minZ && z <= BOAR_AREA.maxZ) {
    return "boar";
  }
  return null;
};
