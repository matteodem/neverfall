import { QUESTS } from "../quests";
import { NPC_DEFINITIONS } from "./npcDefinitions";

export const NPC_QUESTS = QUESTS.filter((quest) => NPC_DEFINITIONS.some((npc) => npc.offeredQuestIds?.includes(quest.id)));

export const getNpcQuests = (npc) => NPC_QUESTS.filter((quest) => npc?.offeredQuestIds?.includes(quest.id));

export const getNpcQuestState = (quest, character) => {
  const saved = character?.questStates?.[quest.id];
  if (saved) return saved;
  // Legacy automatic quests wrote progress without state, including zero after
  // repeatable hunts. Finished non-repeatable quests already paid their rewards.
  if (Object.hasOwn(character?.questProgress || {}, quest.id)) {
    return !quest.repeatable && character.questProgress[quest.id] >= quest.objective.amount ? "rewarded" : "active";
  }
  return "available";
};

export const getQuestAcceptanceError = ({ character, quest, npc }) => {
  if (!character) return "Character unavailable.";
  if (!quest || !npc?.offeredQuestIds?.includes(quest.id)) return "This NPC does not offer that quest.";
  const state = getNpcQuestState(quest, character);
  if (state !== "available" && !(quest.repeatable && state === "rewarded")) return "This quest has already been accepted or rewarded.";
  if ((character.currentLevel ?? 1) < (quest.requiredLevel ?? 0)) return `Requires Level ${quest.requiredLevel}`;
  return null;
};

export const canAcceptQuest = (options) => !getQuestAcceptanceError(options);

// Configured world objects can use the same validated interaction message as seals.
// Location objectives use the existing Interact type and an authored position/range.
export const NPC_QUEST_LOCATIONS = NPC_QUESTS.flatMap((quest) =>
  (quest.objectives || [quest.objective]).filter((objective) =>
    objective.type === "Interact" && objective.position).map((objective) => ({
    id: objective.target, ...objective.position, interactionRange: objective.interactionRange ?? 3,
  })));
