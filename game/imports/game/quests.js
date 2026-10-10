import { WAYPOINTS } from "./waypoints";
import { LANDMARKS } from "./landmarks";
import { DUNGEONS } from "./dungeonConfig";
import { WORLD_EVENTS } from "./worldEvents";
import { SOUTHWEST_LAKE } from "./worldConfig";

const snowyMountainsWaypoint = WAYPOINTS.find((point) => point.id === "snowy-mountains-waypoint");
const highlandsLookout = LANDMARKS.find((landmark) => landmark.id === "highlands-lookout");
const northernRuins = DUNGEONS.find((dungeon) => dungeon.id === "northern-ruins");
const frozenRift = WORLD_EVENTS.find((event) => event.id === "frozen-rift");
const frozenSeals = frozenRift.phases.find((phase) => phase.interaction === "seal").points;

export const FROZEN_DISTURBANCE_POINTS = frozenSeals.map((point, index) => ({
  id: `${frozenRift.id}-seal-${index + 1}`, label: `Activate frozen rift seal ${index + 1}`, ...point,
}));

export const QUEST_DEFAULTS = { turnInRequired: true, repeatable: false };

// Acquisition belongs to NPC offeredQuestIds; objectives and rewards stay here.
export const QUESTS = [
  {
    id: "forest-boars", title: "Boar Problem", requiredLevel: 1,
    description: "The forest paths are becoming dangerous. Defeat 5 boars.",
    objective: { type: "Kill", target: "boar", amount: 5, label: "Defeat Boars" },
    rewards: { xp: 100, gold: 1 },
  },
  {
    id: "forest-mini-boss", title: "A Greater Threat", requiredLevel: 3,
    description: "Defeat the Forest Giant on the hill northeast of Central Camp.",
    objective: { type: "Boss", target: "forestGiant", amount: 1, label: "Defeat the Forest Giant" },
    rewards: { xp: 1000, gold: 2 },
  },
  {
    id: "speak-with-mage", title: "Speak With the Mage", requiredLevel: 1,
    description: "Speak with the Wandering Mage near Central Camp.",
    objective: { type: "InteractNpc", target: "wandering-mage-01", amount: 1, label: "Speak with the Wandering Mage" },
    rewards: { xp: 50 },
  },
  /*{
    id: "boar-hunt", title: "Boar Hunt", requiredLevel: 1,
    description: "Defeat 10 boars near Central Camp.",
    objective: { type: "Kill", target: "boar", amount: 10 },
    rewards: { xp: 200, randomRing: true },
  },
  {
    id: "wolf-hunt", title: "Wolf Hunt", requiredLevel: 2,
    description: "Defeat 10 wolves northwest of Central Camp.",
    objective: { type: "Kill", target: "wolf", amount: 10 },
    rewards: { xp: 500 },
  },
  {
    id: "giant-hunt", title: "Forest Giant Hunt", requiredLevel: 3,
    description: "Defeat the Forest Giant on the hill northeast of Central Camp.",
    objective: { type: "Boss", target: "forestGiant", amount: 1 },
    rewards: { xp: 500 },
  },*/
  {
    id: "goat-hunt", title: "Goat Hunt", requiredLevel: 5,
    description: "Defeat 10 goats in the western Highlands.",
    objective: { type: "Kill", target: "goat", amount: 10 },
    rewards: { xp: 1000 },
  },
  {
    id: "rat-hunt", title: "Rat Hunt", requiredLevel: 7,
    description: "Defeat 10 rats in the central Highlands.",
    objective: { type: "Kill", target: "rat", amount: 10 },
    rewards: { xp: 1500 },
  },
  {
    id: "bee-hunt", title: "Bee Hunt", requiredLevel: 9,
    description: "Defeat 10 bees in the eastern Highlands.",
    objective: { type: "Kill", target: "bee", amount: 10 },
    rewards: { xp: 2000 },
  },
  {
    id: "seal-hunt", title: "Seal Hunt", requiredLevel: 15,
    description: "Defeat 10 seals around Southwest Lake.",
    objective: { type: "Kill", target: "seal", amount: 10 },
    rewards: { xp: 3500, gold: 1 },
  },
  {
    id: "snow-wolf-hunt", title: "Snow Wolf Hunt", requiredLevel: 10,
    description: "Defeat 10 snow wolves north of the Snowy Mountains waypoint.",
    objective: { type: "Kill", target: "snowWolf", amount: 10 },
    rewards: { xp: 2500 },
  },
  {
    id: "mountain-goat-hunt", title: "Mountain Goat Hunt", requiredLevel: 12,
    description: "Defeat 10 mountain goats south of the Snowy Mountains waypoint.",
    objective: { type: "Kill", target: "mountainGoat", amount: 10 },
    rewards: { xp: 3000 },
  },
  {
    id: "frost-ogre-hunt", title: "Frost Ogre Hunt", requiredLevel: 14,
    description: "Defeat the Frost Ogre in the eastern Snowy Mountains.",
    objective: { type: "Boss", target: "frostOgre", amount: 1 },
    rewards: { xp: 2000 },
  },
  {
    id: "hammer-guardian-hunt", title: "Hammer Guardian Hunt", requiredLevel: 17,
    description: "Defeat the Hammer Guardian southwest of Southwest Lake.",
    objective: { type: "Boss", target: "hammerBoss", amount: 1 },
    rewards: { xp: 2500 },
  },
  {
    id: "wolf-problem", title: "Wolf Problem", description: "Defeat 10 wolves northwest of Central Camp.",
    recommendedLevel: 2, requiredLevel: 2,
    objective: { type: "Kill", target: "wolf", amount: 10 },
    rewards: { xp: 300, gold: 1 },
  },
  /*{
    id: "giant-threat", title: "Giant Threat", description: "Defeat the Forest Giant northeast of Central Camp.",
    recommendedLevel: 3, requiredLevel: 3,
    objective: { type: "Boss", target: "forestGiant", amount: 1 },
    rewards: { xp: 500, gold: 2 },
  },*/
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
].map((quest) => ({ ...QUEST_DEFAULTS, ...quest }));
