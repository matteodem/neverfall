import { NPC_DEFINITIONS } from "./npcDefinitions";
import { NPC_QUESTS, getNpcQuestState } from "./npcQuests";
import { getQuestObjectiveDisplay } from "../questObjectiveDisplay";

export const getNpcQuestMarker = (npcId, character) => {
  if (!character) return null;
  let available = false;
  for (const quest of NPC_QUESTS) {
    const state = getNpcQuestState(quest, character);
    if (quest.giverNpcId === npcId) {
      if (state === "active" || state === "completed") return "?";
      if (state === "available") available = true;
    }
    if (state === "active") {
      const current = getQuestObjectiveDisplay(quest, character.questProgress?.[quest.id] || 0).current;
      const objective = (quest.objectives || [quest.objective])[current?.number - 1];
      if (objective?.type === "InteractNpc" && objective.target === npcId) return "?";
    }
  }
  return available ? "!" : null;
};

export const getNpcQuestMarkers = (character) => NPC_DEFINITIONS.flatMap((npc) => {
  const marker = getNpcQuestMarker(npc.id, character);
  return marker ? [{ id: npc.id, name: npc.name, position: npc.position, marker }] : [];
});
