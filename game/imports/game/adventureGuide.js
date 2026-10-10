import { QUESTS } from "./quests";
import { NPC_DEFINITIONS } from "./npcs/npcDefinitions";

// Add a regional NPC and an entry here; quest requirements define availability.
const REGIONAL_QUEST_HUBS = [
  { npcId: "forest-guard-01", name: "Central Forest", hint: "Secure Central Camp." },
  { npcId: "highlands-scout-01", name: "Highlands", hint: "Visit Northern Camp." },
  { npcId: "mountain-researcher-01", name: "Snowy Mountains", hint: "Visit snowy waypoint." },
  { npcId: "lake-ranger-01", name: "Southwest Lake", hint: "Visit Lake waypoint." },
];

export const getAdventureGuideRegions = (character) => {
  const regions = REGIONAL_QUEST_HUBS.map((region) => {
    const npc = NPC_DEFINITIONS.find((entry) => entry.id === region.npcId);
    const quests = QUESTS.filter((quest) => npc.offeredQuestIds.includes(quest.id));
    const requiredLevel = Math.min(...quests.map((quest) => quest.requiredLevel ?? 1));
    return { ...region, npcName: npc.name, requiredLevel, available: (character?.currentLevel ?? 1) >= requiredLevel };
  });
  const recommended = regions.filter((region) => region.available)
    .reduce((best, region) => !best || region.requiredLevel > best.requiredLevel ? region : best, null);
  return regions.map((region) => ({ ...region, recommended: region.npcId === recommended?.npcId }));
};
