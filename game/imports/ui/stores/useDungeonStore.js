import { create } from "zustand";

export const useDungeonStore = create((set, get) => ({
  location: "world",
  dungeonId: null,
  prompt: null,
  stage: 0,
  completed: false,
  busy: false,
  error: "",
  actionHandler: null,
  setLocation: (location, dungeonId = null) => set({ location, dungeonId, prompt: null, busy: false, error: "" }),
  setBusy: (busy) => set({ busy, error: "" }),
  setError: (error) => set({ error, busy: false }),
  clearError: () => set({ error: "" }),
  setActionHandler: (actionHandler) => set({ actionHandler }),
  interact: () => get().actionHandler?.() || false,
  leaveDungeon: () => get().actionHandler?.("leave") || false,
  update({ prompt, stage, completed, dungeonId = get().dungeonId }) {
    const previous = get();
    if (previous.prompt !== prompt || previous.stage !== stage || previous.completed !== completed || previous.dungeonId !== dungeonId) {
      set({ prompt, stage, completed, dungeonId });
    }
  },
  reset: () => set({ location: "world", dungeonId: null, prompt: null, stage: 0, completed: false, busy: false, error: "", actionHandler: null }),
}));
