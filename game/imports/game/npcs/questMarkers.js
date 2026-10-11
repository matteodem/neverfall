import { NPC_DEFINITIONS } from "./npcDefinitions";
import { NPC_QUESTS, getNpcQuestState, canAcceptQuest } from "./npcQuests";
import { getQuestObjectiveDisplay } from "../questObjectiveDisplay";

const MARKERS = {
  available: { marker: "!", kind: "questAvailable", label: "Available quest", color: "#facc15" },
  active: { marker: "?", kind: "questActive", label: "Quest in progress", color: "#9ca3af" },
  ready: { marker: "?", kind: "questReady", label: "Quest ready to turn in", color: "#facc15" },
};

export const getNpcQuestMarkerState = (npcId, character) => {
  if (!character) return null;
  let available = false;
  let active = false;
  const npc = NPC_DEFINITIONS.find((entry) => entry.id === npcId);
  for (const quest of NPC_QUESTS) {
    const state = getNpcQuestState(quest, character);
    const current = state === "active"
      ? getQuestObjectiveDisplay(quest, character.questProgress?.[quest.id] || 0).current : null;
    const objective = (quest.objectives || [quest.objective])[current?.number - 1];
    if (npc?.offeredQuestIds?.includes(quest.id)) {
      if (state === "completed" && (character.questProgress?.[quest.id] || 0) >= quest.objective.amount) return MARKERS.ready;
      if (state === "active" && objective?.type !== "InteractNpc") active = true;
      if (canAcceptQuest({ character, quest, npc })) available = true;
    }
    // Talking to the current objective's NPC advances or completes the quest immediately.
    if (objective?.type === "InteractNpc" && objective.target === npcId) return MARKERS.ready;
  }
  return active ? MARKERS.active : available ? MARKERS.available : null;
};

export const getNpcQuestMarker = (npcId, character) => getNpcQuestMarkerState(npcId, character)?.marker || null;

export const getNpcQuestMarkers = (character) => NPC_DEFINITIONS.flatMap((npc) => {
  const markerState = getNpcQuestMarkerState(npc.id, character);
  return markerState ? [{ id: npc.id, name: npc.name, position: npc.position, ...markerState }] : [];
});
