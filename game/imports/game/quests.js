import { ENEMY_SPAWNS, WOLF_AREA } from "./enemyConfig";
import { WAYPOINTS } from "./waypoints";

export const BOAR_HUNT_QUEST = {
  progressField: "boarQuestKills",

  id:
    "boar-hunt",

  title:
    "Boar Hunt",

  description:
    "Defeat 5 boars near Central Camp.",

  recommendedLevel: 1,

  target:
    5,

  rewardXp:
    100,
};

export const WOLF_HUNT_QUEST = {
  id: "wolf-hunt",
  title: "Wolf Hunt",
  description: "Defeat 5 wolves northwest of Central Camp.",
  recommendedLevel: 3,
  progressField: "wolfQuestKills",
  target: 5,
  rewardXp: 250,
};

export const GIANT_HUNT_QUEST = {
  id: "giant-hunt",
  title: "Forest Giant Hunt",
  description: "Defeat the Forest Giant on the hill northeast of Central Camp.",
  recommendedLevel: 5,
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
    id: "goat-hunt", title: "Goat Hunt", description: "Defeat 5 goats in the western Highlands.",
    recommendedLevel: 5,
    progressField: "goatQuestKills", rewardXp: 500,
  },
  rat: {
    ...BOAR_HUNT_QUEST,
    id: "rat-hunt", title: "Rat Hunt", description: "Defeat 5 rats in the central Highlands.",
    recommendedLevel: 7,
    progressField: "ratQuestKills", rewardXp: 750,
  },
  bee: {
    ...BOAR_HUNT_QUEST,
    id: "bee-hunt", title: "Bee Hunt", description: "Defeat 5 bees in the eastern Highlands.",
    recommendedLevel: 9,
    progressField: "beeQuestKills", rewardXp: 1000,
  },
  seal: {
    ...BOAR_HUNT_QUEST,
    id: "seal-hunt", title: "Seal Hunt", description: "Defeat 5 seals around Southwest Lake.",
    recommendedLevel: 15,
    progressField: "sealQuestKills", rewardXp: 0, rewardGold: 1,
  },
  snowWolf: {
    ...BOAR_HUNT_QUEST,
    id: "snow-wolf-hunt", title: "Snow Wolf Hunt", description: "Defeat 5 snow wolves north of the Snowy Mountains waypoint.",
    recommendedLevel: 10,
    progressField: "snowWolfQuestKills", rewardXp: 1250,
  },
  mountainGoat: {
    ...BOAR_HUNT_QUEST,
    id: "mountain-goat-hunt", title: "Mountain Goat Hunt", description: "Defeat 5 mountain goats south of the Snowy Mountains waypoint.",
    recommendedLevel: 12,
    progressField: "mountainGoatQuestKills", rewardXp: 1500,
  },
  frostOgre: {
    ...GIANT_HUNT_QUEST,
    id: "frost-ogre-hunt", title: "Frost Ogre Hunt", description: "Defeat the Frost Ogre in the eastern Snowy Mountains.",
    recommendedLevel: 14,
    progressField: "frostOgreQuestKills", rewardXp: 2000,
  },
};

const snowyMountainsWaypoint = WAYPOINTS.find((point) => point.id === "snowy-mountains-waypoint");

// New quests are available automatically; NPC quest givers can use the same
// definitions later without changing how objectives advance.
export const QUESTS = [
  ...Object.entries(HUNT_QUESTS).map(([type, hunt]) => ({
    ...hunt,
    objective: { type: ["forestGiant", "frostOgre"].includes(type) ? "Boss" : "Kill", target: type, amount: hunt.target },
    rewards: { xp: hunt.rewardXp, gold: hunt.rewardGold },
    repeatable: true,
  })),
  {
    id: "wolf-problem", title: "Wolf Problem", description: "Defeat 10 wolves northwest of Central Camp.",
    recommendedLevel: 3,
    objective: { type: "Kill", target: "wolf", amount: 10 },
    rewards: { xp: 300, gold: 1 },
  },
  {
    id: "giant-threat", title: "Giant Threat", description: "Defeat the Forest Giant northeast of Central Camp.",
    recommendedLevel: 5,
    objective: { type: "Boss", target: "forestGiant", amount: 1 },
    rewards: { xp: 500, gold: 2 },
  },
  {
    id: "explore-highlands", title: "Explore the Highlands", description: "Reach the Highlands Lookout north of Northern Camp.",
    recommendedLevel: 5,
    objective: { type: "ReachLocation", target: "highlands-lookout", amount: 1, x: 40, z: 245, radius: 12 },
    rewards: { xp: 200, gold: 1 },
  },
  {
    id: "find-the-depths", title: "Find the Forest Dungeon", description: "Enter the Forest Dungeon south of Central Camp.",
    recommendedLevel: 7,
    objective: { type: "Interact", target: "dungeon-entrance", amount: 1 },
    rewards: { xp: 100 },
  },
  {
    id: "defend-northern-camp", title: "Defend Northern Camp", description: "Complete the Wolf Invasion world event at Northern Camp.",
    recommendedLevel: 7,
    objective: { type: "CompleteEvent", target: "wolf-invasion", amount: 1 },
    rewards: { xp: 300, gold: 1 },
  },
  {
    id: "awakened-threat", title: "Awakened Threat", description: "Complete the Forest Giant Awakening world event in the southeast forest.",
    recommendedLevel: 8,
    objective: { type: "CompleteEvent", target: "forest-giant-awakening", amount: 1 },
    rewards: { xp: 500, gold: 2 },
  },
  {
    id: "into-the-depths", title: "Into the Depths", description: "Complete the Forest Dungeon.",
    recommendedLevel: 7,
    objective: { type: "CompleteDungeon", target: "dungeon-01", amount: 1 },
    rewards: { xp: 250, gold: 2 },
  },
  {
    id: "northern-ruins-quest", title: "Northern Ruins", description: "Complete the Northern Ruins east of Northern Camp.",
    recommendedLevel: 10,
    objective: { type: "CompleteDungeon", target: "northern-ruins", amount: 1 },
    rewards: { xp: 400, gold: 2 },
  },
  {
    id: "explore-snowy-mountains", title: "Explore Snowy Mountains", description: "Reach the Snowy Mountains waypoint east of Central Camp.",
    recommendedLevel: 10,
    objective: { type: "ReachLocation", target: "snowy-mountains-waypoint", amount: 1,
      x: snowyMountainsWaypoint.position.x, z: snowyMountainsWaypoint.position.z, radius: 16 },
    rewards: { xp: 400, gold: 1 },
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
