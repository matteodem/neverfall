import { QUESTS } from "../quests";

export const NPC_QUESTS = QUESTS.filter((quest) => quest.giverNpcId);

export const getNpcQuestState = (quest, character) => character?.questStates?.[quest.id] || "available";

// Configured world objects can use the same validated interaction message as seals.
// Location objectives use the existing Interact type and an authored position/range.
export const NPC_QUEST_LOCATIONS = NPC_QUESTS.flatMap((quest) =>
  (quest.objectives || [quest.objective]).filter((objective) =>
    objective.type === "Interact" && objective.position).map((objective) => ({
    id: objective.target, ...objective.position, interactionRange: objective.interactionRange ?? 3,
  })));
