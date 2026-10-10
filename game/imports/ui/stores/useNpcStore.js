import { create } from "zustand";
import { useHudStore } from "./useHudStore";

export const NPC_DIALOGUE_MODAL = "npcDialogue";

export const useNpcStore = create((set, get) => ({
  nearby: null,
  dialogue: null,
  actionHandler: null,
  questHandler: null,
  questPending: false,
  questError: "",
  questRequestId: 0,
  setQuestHandler: (questHandler) => set({ questHandler }),
  requestQuestAction(action, npcId, questId) {
    const state = get();
    if (!state.questHandler || state.questPending) return;
    const requestId = state.questRequestId + 1;
    set({ questPending: true, questError: "", questRequestId: requestId });
    state.questHandler({ action, npcId, questId, requestId });
  },
  finishQuestAction({ requestId, error = "" }) {
    if (requestId === get().questRequestId) set({ questPending: false, questError: error });
  },
  setNearby(nearby) {
    if (get().nearby !== nearby) set({ nearby });
  },
  setActionHandler: (actionHandler) => set({ actionHandler }),
  interact: () => get().actionHandler?.() || false,
  openDialogue(npc) {
    set({ dialogue: npc });
    useHudStore.getState().openModal(NPC_DIALOGUE_MODAL);
    get().requestQuestAction("interact", npc.id);
  },
  closeDialogue() {
    set({ dialogue: null, questPending: false, questError: "", questRequestId: get().questRequestId + 1 });
    useHudStore.getState().closeModal(NPC_DIALOGUE_MODAL);
  },
  reset() {
    set({ nearby: null, dialogue: null, actionHandler: null, questHandler: null,
      questPending: false, questError: "", questRequestId: get().questRequestId + 1 });
    useHudStore.getState().closeModal(NPC_DIALOGUE_MODAL);
  },
}));
