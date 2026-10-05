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
  const snowWolfKills = achievements.snowWolfHunter?.progress || 0;
  const sealKills = achievements.sealHunter?.progress || 0;
  const steps = [
    { id: "boars", title: "Defeat 5 Boars", progress: `${Math.min(boarKills, 5)} / 5`,
      hint: "Find boars near Central Camp.", done: boarKills >= 5 },
    { id: "loot", title: "Loot an item", hint: "Press F near loot dropped by an enemy.",
      done: achievements.treasureHunter?.unlocked },
    { id: "equip", title: "Equip your first item", hint: "Loot a ring or buy one from a shop, then equip it from Inventory.",
      done: achievements.equipped?.unlocked },
    { id: "hunt", title: "Complete your first Hunt", hint: "Open Hunts in the Hero menu or press H.",
      done: guide.firstHunt || achievements.firstHunt?.unlocked },
    { id: "map", title: "Open the World Map", hint: "Press M or use the Map button.", done: guide.openedMap },
    { id: "wolf-hunt", title: "Defeat 10 Wolves", progress: `${Math.min(wolfKills, 10)} / 10`,
      hint: "Find wolves northwest of Central Camp.", done: wolfKills >= 10 },
    /*{ id: "giant", title: "Defeat the Forest Giant", hint: "Find it on the hill northeast of Central Camp.",
      done: achievements.bossKiller?.unlocked || quests["giant-threat"] >= 1 },*/
    { id: "ancient-forest-shrine", title: "Discover the Ancient Forest Shrine",
      hint: "Find the shrine in the western Forest.",
      done: guide.visitedAncientForestShrine || character?.discoveredLandmarks?.includes("ancient-forest-shrine") },
    { id: "camp", title: "Visit Northern Camp", hint: "Travel north into the Highlands.",
      done: spawnPoints.includes("northern-camp") || waypoints.includes("northern-camp") || guide.visitedNorthernCamp },
    { id: "lookout", title: "Reach Highlands Lookout", hint: "Find the lookout north of Northern Camp.",
      done: quests["explore-highlands"] >= 1 },
    { id: "goats", title: "Kill 10 Goats", progress: `${Math.min(goatKills, 10)} / 10`,
      hint: "Find goats in the western Highlands.", done: goatKills >= 10 },
    { id: "tower-chest", title: "Loot the Jumping Puzzle Chest",
      hint: "Find the tower in the south, climb to the top, and open its chest.",
      done: achievements.towerSummit?.unlocked },
    { id: "rats", title: "Kill 10 Rats", progress: `${Math.min(ratKills, 10)} / 10`,
      hint: "Find rats in the central Highlands.", done: ratKills >= 10 },
    { id: "highlands-relics", title: "Complete Highlands Relics",
      hint: "Visit Highlands Lookout and Northern Ruins, then face the guardian. Recommended Level: 9.",
      done: quests["highlands-relics"] >= 3 },
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
    { id: "waypoint-travel", title: "Use a Waypoint",
      hint: "Open the World Map and fast travel to an unlocked waypoint.", done: guide.usedWaypoint },
    { id: "dungeon", title: "Complete a Dungeon",
      hint: "Enter a dungeon and defeat its final boss.", done: achievements.dungeonDelver?.unlocked },
    { id: "level-14", title: "Reach Level 14", progress: `${Math.min(character?.currentLevel ?? 1, 14)} / 14`,
      hint: "Prepare for the strongest content currently available.", done: (character?.currentLevel ?? 1) >= 14 },
    { id: "southwest-lake", title: "Explore Southwest Lake",
      hint: "Unlock the waypoint near Southwest Lake.", done: waypoints.includes("lake-waypoint") },
    { id: "seals", title: "Kill 10 Seals", progress: `${Math.min(sealKills, 10)} / 10`,
      hint: "Find seals around Southwest Lake.", done: sealKills >= 10 },
    { id: "level-15", title: "Reach Level 15", progress: `${Math.min(character?.currentLevel ?? 1, 15)} / 15`,
      hint: "Reach the current maximum level.", done: (character?.currentLevel ?? 1) >= 15 },
    { id: "sunken-ruins", title: "Complete Sunken Ruins",
      hint: "Find Sunken Ruins south of Southwest Lake. Recommended Level: 15.",
      done: character?.completedDungeons?.includes("sunken-ruins") },
    { id: "explore", title: "Explore Neverfall",
      hint: "Try Hunts, quests, dungeons, world events, bosses, landmarks and group content.", done: false },
  ];
  return steps.find((step) => !step.done);
};
