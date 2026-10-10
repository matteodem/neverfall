import { ENEMY_SPAWNS, ENEMY_TYPES, WOLF_AREA } from "./enemyConfig";
import { WAYPOINTS } from "./waypoints";
import { LANDMARKS } from "./landmarks";
import { DUNGEONS } from "./dungeonConfig";
import { WORLD_EVENTS } from "./worldEvents";
import { SOUTHWEST_LAKE } from "./worldConfig";

export const BOAR_HUNT_QUEST = {
  progressField: "boarQuestKills",

  id:
    "boar-hunt",

  title:
    "Boar Hunt",

  description:
    "Defeat 5 boars near Central Camp.",

  recommendedLevel: 1, requiredLevel: 1,

  target:
    5,

  rewardXp:
    100,
};

export const WOLF_HUNT_QUEST = {
  id: "wolf-hunt",
  title: "Wolf Hunt",
  description: "Defeat 5 wolves northwest of Central Camp.",
  recommendedLevel: 2, requiredLevel: 2,
  progressField: "wolfQuestKills",
  target: 5,
  rewardXp: 250,
};

export const GIANT_HUNT_QUEST = {
  id: "giant-hunt",
  title: "Forest Giant Hunt",
  description: "Defeat the Forest Giant on the hill northeast of Central Camp.",
  recommendedLevel: 3, requiredLevel: 3,
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
    recommendedLevel: 5, requiredLevel: 5,
    progressField: "goatQuestKills", rewardXp: 500,
  },
  rat: {
    ...BOAR_HUNT_QUEST,
    id: "rat-hunt", title: "Rat Hunt", description: "Defeat 5 rats in the central Highlands.",
    recommendedLevel: 7, requiredLevel: 7,
    progressField: "ratQuestKills", rewardXp: 750,
  },
  bee: {
    ...BOAR_HUNT_QUEST,
    id: "bee-hunt", title: "Bee Hunt", description: "Defeat 5 bees in the eastern Highlands.",
    recommendedLevel: 9, requiredLevel: 9,
    progressField: "beeQuestKills", rewardXp: 1000,
  },
  seal: {
    ...BOAR_HUNT_QUEST,
    id: "seal-hunt", title: "Seal Hunt", description: "Defeat 5 seals around Southwest Lake.",
    recommendedLevel: 15, requiredLevel: 15,
    progressField: "sealQuestKills", rewardXp: 0, rewardGold: 1,
  },
  snowWolf: {
    ...BOAR_HUNT_QUEST,
    id: "snow-wolf-hunt", title: "Snow Wolf Hunt", description: "Defeat 5 snow wolves north of the Snowy Mountains waypoint.",
    recommendedLevel: 10, requiredLevel: 10,
    progressField: "snowWolfQuestKills", rewardXp: 1250,
  },
  mountainGoat: {
    ...BOAR_HUNT_QUEST,
    id: "mountain-goat-hunt", title: "Mountain Goat Hunt", description: "Defeat 5 mountain goats south of the Snowy Mountains waypoint.",
    recommendedLevel: 12, requiredLevel: 12,
    progressField: "mountainGoatQuestKills", rewardXp: 1500,
  },
  frostOgre: {
    ...GIANT_HUNT_QUEST,
    id: "frost-ogre-hunt", title: "Frost Ogre Hunt", description: "Defeat the Frost Ogre in the eastern Snowy Mountains.",
    recommendedLevel: 14, requiredLevel: 14,
    progressField: "frostOgreQuestKills", rewardXp: 2000,
  },
  hammerBoss: {
    ...GIANT_HUNT_QUEST,
    id: "hammer-guardian-hunt", title: "Hammer Guardian Hunt",
    description: "Defeat the Hammer Guardian southwest of Southwest Lake.",
    recommendedLevel: 17, requiredLevel: 17,
    progressField: "hammerBossQuestKills", rewardXp: 2500,
  },
};

const snowyMountainsWaypoint = WAYPOINTS.find((point) => point.id === "snowy-mountains-waypoint");
const highlandsLookout = LANDMARKS.find((landmark) => landmark.id === "highlands-lookout");
const northernRuins = DUNGEONS.find((dungeon) => dungeon.id === "northern-ruins");
const frozenRift = WORLD_EVENTS.find((event) => event.id === "frozen-rift");
const frozenSeals = frozenRift.phases.find((phase) => phase.interaction === "seal").points;

export const FROZEN_DISTURBANCE_POINTS = frozenSeals.map((point, index) => ({
  id: `${frozenRift.id}-seal-${index + 1}`, label: `Activate frozen rift seal ${index + 1}`, ...point,
}));

// Acquisition belongs to NPC offeredQuestIds; objectives and rewards stay here.
export const QUESTS = [
  {
    id: "forest-boars", title: "Boar Problem", requiredLevel: 1, turnInRequired: true,
    description: "The forest paths are becoming dangerous. Defeat 5 boars.",
    objective: { type: "Kill", target: "boar", amount: 5, label: "Defeat Boars" },
    rewards: { xp: 100, gold: 1 },
  },
  {
    id: "forest-mini-boss", title: "A Greater Threat", requiredLevel: 3, turnInRequired: true,
    description: "Defeat the Forest Giant on the hill northeast of Central Camp.",
    objective: { type: "Boss", target: "forestGiant", amount: 1, label: "Defeat the Forest Giant" },
    rewards: { xp: 250, gold: 1 },
  },
  {
    id: "speak-with-mage", title: "Speak With the Mage", requiredLevel: 1, turnInRequired: true,
    description: "Speak with the Wandering Mage near Central Camp.",
    objective: { type: "InteractNpc", target: "wandering-mage-01", amount: 1, label: "Speak with the Wandering Mage" },
    rewards: { xp: 50 },
  },
  ...Object.entries(HUNT_QUESTS).map(([type, hunt]) => ({
    ...hunt,
    objective: { type: ENEMY_TYPES[type]?.bossMechanics ? "Boss" : "Kill", target: type, amount: hunt.target },
    rewards: { xp: hunt.rewardXp, gold: hunt.rewardGold, ...(type === "boar" ? { randomRing: true } : {}) },
    repeatable: true,
  })),
  {
    id: "wolf-problem", title: "Wolf Problem", description: "Defeat 10 wolves northwest of Central Camp.",
    recommendedLevel: 2, requiredLevel: 2,
    objective: { type: "Kill", target: "wolf", amount: 10 },
    rewards: { xp: 300, gold: 1 },
  },
  {
    id: "giant-threat", title: "Giant Threat", description: "Defeat the Forest Giant northeast of Central Camp.",
    recommendedLevel: 3, requiredLevel: 3,
    objective: { type: "Boss", target: "forestGiant", amount: 1 },
    rewards: { xp: 500, gold: 2 },
  },
  {
    id: "explore-highlands", title: "Explore the Highlands", description: "Reach the Highlands Lookout north of Northern Camp.",
    recommendedLevel: 5, requiredLevel: 5,
    objective: { type: "ReachLocation", target: "highlands-lookout", amount: 1, x: 40, z: 245, radius: 12 },
    rewards: { xp: 200, gold: 1 },
  },
  {
    id: "find-the-depths", title: "Find the Forest Dungeon", description: "Enter the Forest Dungeon south of Central Camp.",
    recommendedLevel: 7, requiredLevel: 7,
    objective: { type: "Interact", target: "dungeon-entrance", amount: 1 },
    rewards: { xp: 100 },
  },
  {
    id: "defend-northern-camp", title: "Defend Northern Camp", description: "Complete the Wolf Invasion world event at Northern Camp.",
    recommendedLevel: 7, requiredLevel: 7,
    objective: { type: "CompleteEvent", target: "wolf-invasion", amount: 1 },
    rewards: { xp: 300, gold: 1 },
  },
  {
    id: "awakened-threat", title: "Awakened Threat", description: "Complete the Forest Giant Awakening world event in the southeast forest.",
    recommendedLevel: 8, requiredLevel: 8,
    objective: { type: "CompleteEvent", target: "forest-giant-awakening", amount: 1 },
    rewards: { xp: 500, gold: 2 },
  },
  {
    id: "into-the-depths", title: "Into the Depths", description: "Complete the Forest Dungeon.",
    recommendedLevel: 7, requiredLevel: 7,
    objective: { type: "CompleteDungeon", target: "dungeon-01", amount: 1 },
    rewards: { xp: 250, gold: 2 },
  },
  {
    id: "northern-ruins-quest", title: "Northern Ruins", description: "Complete the Northern Ruins east of Northern Camp.",
    recommendedLevel: 10, requiredLevel: 10,
    objective: { type: "CompleteDungeon", target: "northern-ruins", amount: 1 },
    rewards: { xp: 400, gold: 2 },
  },
  {
    id: "explore-snowy-mountains", title: "Explore Snowy Mountains", description: "Reach the Snowy Mountains waypoint east of Central Camp.",
    recommendedLevel: 10, requiredLevel: 10,
    objective: { type: "ReachLocation", target: "snowy-mountains-waypoint", amount: 1,
      x: snowyMountainsWaypoint.position.x, z: snowyMountainsWaypoint.position.z, radius: 16 },
    rewards: { xp: 400, gold: 1 },
  },
  {
    id: "highlands-relics", title: "Highlands Relics", recommendedLevel: 9, requiredLevel: 9,
    description: "Investigate Highlands Lookout and the Northern Ruins entrance, then defeat the guardian nearby.",
    objective: { type: "Sequence", amount: 3 },
    objectives: [
      { type: "ReachLocation", target: highlandsLookout.id, label: "Investigate Highlands Lookout",
        ...highlandsLookout.position, radius: highlandsLookout.discoveryRadius },
      { type: "ReachLocation", target: northernRuins.interactionTarget, label: "Investigate the Northern Ruins entrance",
        x: northernRuins.entrance.x, z: northernRuins.entrance.z, radius: 8 },
      { type: "Boss", target: "highlandsRelicGuardian", label: "Defeat the Highlands Relic Guardian" },
    ],
    rewards: { xp: 900, gold: 2 },
  },
  {
    id: "frozen-disturbance", title: "Frozen Disturbance", recommendedLevel: 11, requiredLevel: 11,
    description: "Reach the Snowy Mountains waypoint, activate the frozen rift seals near the Frozen Stone Arch, and defeat the Frostbound Sentinel.",
    objective: { type: "Sequence", amount: 4 },
    objectives: [
      { type: "ReachLocation", target: snowyMountainsWaypoint.id, label: "Reach the Snowy Mountains waypoint",
        x: snowyMountainsWaypoint.position.x, z: snowyMountainsWaypoint.position.z,
        radius: snowyMountainsWaypoint.discoveryRadius || 16 },
      ...FROZEN_DISTURBANCE_POINTS.map(({ id, label }) => ({ type: "Interact", target: id, label })),
      { type: "Boss", target: "frostboundSentinel", label: "Defeat the Frostbound Sentinel" },
    ],
    rewards: { xp: 1300, gold: 3 },
  },
  {
    id: "trouble-at-southwest-lake", title: "Trouble at Southwest Lake", recommendedLevel: 14, requiredLevel: 14,
    description: "Investigate Southwest Lake, defeat nearby seals, then confront the Hammer Guardian southwest of the lake.",
    objective: { type: "Sequence", amount: 5 },
    objectives: [
      { type: "ReachLocation", target: "southwest-lake", label: "Investigate Southwest Lake",
        x: SOUTHWEST_LAKE.center.x, z: SOUTHWEST_LAKE.center.z, radius: SOUTHWEST_LAKE.radius + 8 },
      { type: "Kill", target: "seal", amount: 3, label: "Defeat seals near Southwest Lake" },
      { type: "Boss", target: "hammerBoss", spawnId: "hammer-guardian", label: "Defeat the Hammer Guardian" },
    ],
    rewards: { xp: 2200, gold: 5 },
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

const BOSS_HUNT_RADIUS = 25;
const bossHuntSpawns = ENEMY_SPAWNS.filter(({ type }) => HUNT_QUESTS[type] && ENEMY_TYPES[type]?.bossMechanics);

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
  const bossArea = bossHuntSpawns.find((spawn) =>
    Math.hypot(x - spawn.x, z - spawn.z) <= BOSS_HUNT_RADIUS);
  if (bossArea) return bossArea.type;
  const huntArea = newHuntAreas.find((area) =>
    x >= area.minX && x <= area.maxX && z >= area.minZ && z <= area.maxZ);
  if (huntArea) return huntArea.type;
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
