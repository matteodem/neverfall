export const getAdventureGuideObjective = (character, level) => {
  const achievements = character?.achievements || {};
  const guide = character?.adventureGuide || {};
  const boarKills = achievements.boarSlayer?.progress || 0;
  const wolfKills = achievements.wolfHunter?.progress || 0;
  const goatKills = achievements.goatHunter?.progress || 0;
  const steps = [
    { id: "boars", title: "Defeat 5 Boars", progress: `${Math.min(boarKills, 5)} / 5`, done: boarKills >= 5 },
    { id: "loot", title: "Loot an item", done: achievements.treasureHunter?.unlocked },
    /* { id: "equip", title: "Equip your first item", hint: "Open your Inventory and equip an item.", done: achievements.equipped?.unlocked },*/
    { id: "hunt", title: "Complete your first Hunt", hint: "Find a Hunt in the Quests menu.", done: guide.firstHunt },
    { id: "map", title: "Open the World Map", hint: "Press M or use the Map button.", done: guide.openedMap },
    { id: "wolf-hunt", title: "Complete the Wolf Hunt", progress: `${Math.min(wolfKills, 5)} / 5`, hint: "Find wolves northwest of the starting camp.", done: wolfKills >= 5 },
    { id: "level-5", title: "Reach Level 5", hint: "Complete hunts, quests, and fight enemies.", done: level >= 5 },
    { id: "goat-hunt", title: "Hunt Goats in the Highlands", progress: `${Math.min(goatKills, 5)} / 5`, hint: "Travel northwest into the Highlands.", done: goatKills >= 5 },
    { id: "camp", title: "Visit the Northern Camp", hint: "Find it on the World Map.", done: guide.visitedNorthernCamp },
    { id: "explore", title: "Explore Neverfall", hint: "Try quests, world events, dungeons, bosses, and group content.", done: false },
  ];
  return steps.find((step) => !step.done) || null;
};
