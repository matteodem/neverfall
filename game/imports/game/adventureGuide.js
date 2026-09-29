export const getAdventureGuideObjective = (character, level) => {
  if (level >= 10) return null;
  const achievements = character?.achievements || {};
  const guide = character?.adventureGuide || {};
  const boarKills = achievements.boarSlayer?.progress || 0;
  const steps = [
    { id: "boars", title: "Defeat 3 Boars", progress: `${Math.min(boarKills, 3)} / 3`, done: boarKills >= 3 },
    { id: "loot", title: "Loot an item", done: achievements.treasureHunter?.unlocked },
    { id: "equip", title: "Equip your first item", done: achievements.equipped?.unlocked },
    { id: "level-2", title: "Reach Level 2", done: level >= 2 },
    { id: "hunt", title: "Complete your first Hunt", hint: "Find a Hunt in the Quests menu.", done: guide.firstHunt },
    { id: "map", title: "Open the World Map", hint: "Press M or use the Map button.", done: guide.openedMap },
    { id: "camp", title: "Visit the Northern Camp", hint: "Find it on the World Map.", done: guide.visitedNorthernCamp },
    { id: "level-3", title: "Reach Level 3", hint: "Continue nearby hunts.", done: level >= 3 },
    { id: "level-5", title: "Reach Level 5", hint: "Try the Wolf Hunt.", done: level >= 5 },
    { id: "level-7", title: "Reach Level 7", hint: "Explore the Highlands hunts.", done: level >= 7 },
    { id: "level-10", title: "Reach Level 10", hint: "Keep exploring and completing hunts.", done: level >= 10 },
  ];
  return steps.find((step) => !step.done) || null;
};
