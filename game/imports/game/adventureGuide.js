import { QUESTS } from "./quests";
import { getQuestObjectiveDisplay } from "./questObjectiveDisplay";

export const getAdventureGuideObjective = (character) => {
  const achievements = character?.achievements || {};
  const guide = character?.adventureGuide || {};
  const quests = character?.questProgress || {};
  const waypoints = character?.unlockedWaypoints || [];
  const spawnPoints = character?.unlockedSpawnPoints || [];
  const boarKills = achievements.boarSlayer?.progress || 0;
  const wolfKills = achievements.wolfHunter?.progress || 0;
  const goatKills = achievements.goatHunter?.progress || 0;
  const ratKills = achievements.ratHunter?.progress || 0;
  const beeKills = achievements.beeHunter?.progress || 0;
  const snowWolfKills = achievements.snowWolfHunter?.progress || 0;
  const steps = [
    { id: "boars", title: "Defeat your first boar", progress: `${Math.min(boarKills, 1)} / 1`,
      hint: "Find a boar just outside Central Camp. Move close and use a skill.", done: boarKills >= 1 },
    { id: "loot", title: "Collect enemy loot", hint: "Walk up to enemy loot and press F to collect it.",
      mobileHint: "Walk up to enemy loot and tap Loot.",
      done: achievements.treasureHunter?.unlocked },
    { id: "map", title: "Open the World Map",
      hint: "Find nearby hunts around Central Camp, then close the map.", done: guide.openedMap,
      action: { label: "Open Map", modal: "map" } },
    { id: "hunt", title: "Finish Boar Hunt", progress: `${Math.min(quests["boar-hunt"] || 0, 5)} / 5`,
      hint: "Defeat 5 boars near Central Camp to earn a ring. Kills track automatically.",
      done: guide.firstHunt || achievements.firstHunt?.unlocked,
      action: { label: "View Boar Hunt", modal: "hero", tab: "hunts" } },
    { id: "equip", title: "Equip your first item", hint: "Select your Boar Hunt ring in Inventory, then choose Equip item.",
      done: achievements.equipped?.unlocked,
      action: { label: "Open Inventory", modal: "items", tab: "inventory" } },
    { id: "wolf-hunt", title: "Defeat 10 Wolves", progress: `${Math.min(wolfKills, 10)} / 10`,
      hint: "Find level 2 wolves northwest of Central Camp. Kills track automatically.", done: wolfKills >= 10,
      action: { label: "View Quests", modal: "hero", tab: "quests" } },
    { id: "giant", title: "Defeat the Forest Giant",
      hint: "Face the level 3 Forest Giant on the hill northeast of Central Camp.",
      done: achievements.bossKiller?.unlocked || quests["giant-threat"] >= 1,
      action: { label: "View Quests", modal: "hero", tab: "quests" } },
    /*{ id: "level-5", title: "Reach Level 5", progress: `${Math.min(character?.currentLevel ?? 1, 5)} / 5`,
      hint: "Continue Boar and Wolf Hunts near Central Camp before heading into the Highlands.",
      done: (character?.currentLevel ?? 1) >= 5,
      action: { label: "View Hunts", modal: "hero", tab: "hunts" } },*/
    { id: "camp", title: "Visit Northern Camp", hint: "Continue north into the Highlands to find Northern Camp.",
      done: spawnPoints.includes("northern-camp") || waypoints.includes("northern-camp") || guide.visitedNorthernCamp },
    { id: "lookout", title: "Reach Highlands Lookout", hint: "Find the lookout north of Northern Camp.",
      done: quests["explore-highlands"] >= 1 },
    { id: "goats", title: "Kill 10 Goats", progress: `${Math.min(goatKills, 10)} / 10`,
      hint: "Find goats in the western Highlands.", done: goatKills >= 10 },
    { id: "rats", title: "Kill 10 Rats", progress: `${Math.min(ratKills, 10)} / 10`,
      hint: "Find rats in the central Highlands.", done: ratKills >= 10 },
    { id: "highlands-relics", title: "Complete Highlands Relics",
      hint: "Visit Highlands Lookout and Northern Ruins, then face the guardian. Recommended Level: 9.",
      done: quests["highlands-relics"] >= 3 },
    { id: "bee-hunt", title: "Kill 10 Bees", progress: `${Math.min(beeKills, 10)} / 10`,
      hint: "Find bees in the eastern Highlands.", done: beeKills >= 10 },
    { id: "level-10", title: "Reach Level 10", progress: `${Math.min(character?.currentLevel ?? 1, 10)} / 10`,
      hint: "Complete Hunts and quests to earn XP.", done: (character?.currentLevel ?? 1) >= 10 },
    { id: "snowy", title: "Explore Snowy Mountains", hint: "Unlock the Snowy Mountains waypoint east of Central Camp.",
      done: waypoints.includes("snowy-mountains-waypoint") },
    { id: "frozen-disturbance", title: "Complete Frozen Disturbance",
      hint: "Reach the waypoint, activate the frozen rift seals, then face the Frostbound Sentinel. Recommended Level: 11.",
      done: quests["frozen-disturbance"] >= 4 },
    { id: "frozen-stone-arch", title: "Discover the Frozen Stone Arch",
      hint: "Find the arch in the southern Snowy Mountains.",
      done: character?.discoveredLandmarks?.includes("frozen-stone-arch") },
    { id: "snow-wolf-hunt", title: "Kill 10 Snow Wolves", progress: `${Math.min(snowWolfKills, 10)} / 10`,
      hint: "Defeat snow wolves north of the Snowy Mountains waypoint.", done: snowWolfKills >= 10 },
    { id: "level-12", title: "Reach Level 12", progress: `${Math.min(character?.currentLevel ?? 1, 12)} / 12`,
      hint: "Continue Hunts, quests and exploration in the Snowy Mountains.", done: (character?.currentLevel ?? 1) >= 12 },
    { id: "snowy-boss", title: "Defeat the Snowy Mountains Boss",
      hint: "Find and defeat the Frost Ogre in the Snowy Mountains.", done: achievements.frostOgreSlayer?.unlocked },
    { id: "dungeon", title: "Complete a Dungeon",
      hint: "Enter a dungeon and defeat its final boss.", done: achievements.dungeonDelver?.unlocked },
    { id: "level-14", title: "Reach Level 14", progress: `${Math.min(character?.currentLevel ?? 1, 14)} / 14`,
      hint: "Prepare for the strongest content currently available.", done: (character?.currentLevel ?? 1) >= 14 },
    { id: "southwest-lake", title: "Explore Southwest Lake",
      hint: "Unlock the waypoint near Southwest Lake.", done: waypoints.includes("lake-waypoint") },
    { id: "trouble-at-southwest-lake", title: "Complete Trouble at Southwest Lake",
      hint: "Investigate the lake and confront the Hammer Guardian southwest of it. Recommended Level: 14.",
      done: quests["trouble-at-southwest-lake"] >= 5 },
    { id: "level-15", title: "Reach Level 15", progress: `${Math.min(character?.currentLevel ?? 1, 15)} / 15`,
      hint: "Reach the current maximum level.", done: (character?.currentLevel ?? 1) >= 15 },
    { id: "sunken-ruins", title: "Complete Sunken Ruins",
      hint: "Find Sunken Ruins south of Southwest Lake. Recommended Level: 15.",
      done: character?.completedDungeons?.includes("sunken-ruins") },
    { id: "explore", title: "Explore Neverfall",
      hint: "Try Hunts, quests, dungeons, world events, bosses, landmarks and group content.", done: false },
  ];
  const step = steps.find((candidate) => !candidate.done);
  const quest = QUESTS.find((candidate) => candidate.id === step.id && candidate.objectives);
  if (!quest) return step;
  const display = getQuestObjectiveDisplay(quest, quests[quest.id] || 0);
  if (!display.current) return step;
  return {
    ...step,
    title: quest.title,
    progress: `${display.current.count} / ${display.current.total}`,
    hint: display.current.label,
    stepProgress: `Step ${display.current.number} / ${display.steps.length}`,
    action: { label: "View Quest", modal: "hero", tab: "quests" },
  };
};
