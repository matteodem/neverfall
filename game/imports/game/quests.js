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
  title: "Kill The Giant",
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
};

const boarSpawns = ENEMY_SPAWNS.filter(({ type }) => type === "boar");
const BOAR_AREA_PADDING = 20;
const BOAR_AREA = {
  minX: Math.min(...boarSpawns.map(({ x }) => x)) - BOAR_AREA_PADDING,
  maxX: Math.max(...boarSpawns.map(({ x }) => x)) + BOAR_AREA_PADDING,
  minZ: Math.min(...boarSpawns.map(({ z }) => z)) - BOAR_AREA_PADDING,
  maxZ: Math.max(...boarSpawns.map(({ z }) => z)) + BOAR_AREA_PADDING,
};

const giantSpawn = ENEMY_SPAWNS.find(({ type }) => type === "forestGiant");
const GIANT_QUEST_RADIUS = 25;

const newHuntAreas = ["goat", "rat", "bee"].map((type) => {
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
