import { create } from "zustand";
import { useHudStore } from "./useHudStore";

export const NPC_DIALOGUE_MODAL = "npcDialogue";

export const useNpcStore = create((set, get) => ({
  nearby: null,
  dialogue: null,
  actionHandler: null,
  setNearby(nearby) {
    if (get().nearby !== nearby) set({ nearby });
  },
  setActionHandler: (actionHandler) => set({ actionHandler }),
  interact: () => get().actionHandler?.() || false,
  openDialogue(npc) {
    set({ dialogue: npc });
    useHudStore.getState().openModal(NPC_DIALOGUE_MODAL);
  },
  closeDialogue() {
    set({ dialogue: null });
    useHudStore.getState().closeModal(NPC_DIALOGUE_MODAL);
  },
  reset() {
    set({ nearby: null, dialogue: null, actionHandler: null });
    useHudStore.getState().closeModal(NPC_DIALOGUE_MODAL);
  },
}));
