import { create } from "zustand";

export const useDungeonStore = create((set, get) => ({
  location: "world",
  prompt: null,
  stage: 0,
  completed: false,
  busy: false,
  error: "",
  actionHandler: null,
  setLocation: (location) => set({ location, prompt: null, busy: false, error: "" }),
  setBusy: (busy) => set({ busy, error: "" }),
  setError: (error) => set({ error, busy: false }),
  clearError: () => set({ error: "" }),
  setActionHandler: (actionHandler) => set({ actionHandler }),
  interact: () => get().actionHandler?.() || false,
  leaveDungeon: () => get().actionHandler?.("leave") || false,
  update({ prompt, stage, completed }) {
    const previous = get();
    if (previous.prompt !== prompt || previous.stage !== stage || previous.completed !== completed) {
      set({ prompt, stage, completed });
    }
  },
  reset: () => set({ location: "world", prompt: null, stage: 0, completed: false, busy: false, error: "", actionHandler: null }),
}));
