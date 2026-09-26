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
  rewardXp: 250,
};

export const HUNT_QUESTS = {
  boar: BOAR_HUNT_QUEST,
  wolf: WOLF_HUNT_QUEST,
  forestGiant: GIANT_HUNT_QUEST,
};

const giantSpawn = ENEMY_SPAWNS.find(({ type }) => type === "forestGiant");
const GIANT_QUEST_RADIUS = 25;

export const getQuestArea = ({ x, z }) => {
  if (Math.hypot(x - giantSpawn.x, z - giantSpawn.z) <= GIANT_QUEST_RADIUS) {
    return "forestGiant";
  }
  return (
  x >= WOLF_AREA.minX && x <= WOLF_AREA.maxX &&
  z >= WOLF_AREA.minZ && z <= WOLF_AREA.maxZ
    ? "wolf" : "boar"
  );
};
