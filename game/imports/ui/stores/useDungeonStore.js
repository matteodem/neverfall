import { create } from "zustand";

export const useDungeonStore = create((set, get) => ({
  location: "world",
  dungeonId: null,
  prompt: null,
  stage: 0,
  completed: false,
  challengeModeEnabled: false,
  challengeModeLocked: false,
  busy: false,
  error: "",
  actionHandler: null,
  setLocation: (location, dungeonId = null) => set({ location, dungeonId, prompt: null, busy: false, error: "", challengeModeEnabled: false, challengeModeLocked: false }),
  setBusy: (busy) => set({ busy, error: "" }),
  setError: (error) => set({ error, busy: false }),
  clearError: () => set({ error: "" }),
  setActionHandler: (actionHandler) => set({ actionHandler }),
  interact: () => get().actionHandler?.() || false,
  leaveDungeon: () => get().actionHandler?.("leave") || false,
  update({ prompt, stage, completed, dungeonId = get().dungeonId, challengeModeEnabled = false, challengeModeLocked = false }) {
    const previous = get();
    if (previous.prompt !== prompt || previous.stage !== stage || previous.completed !== completed || previous.dungeonId !== dungeonId ||
      previous.challengeModeEnabled !== challengeModeEnabled || previous.challengeModeLocked !== challengeModeLocked) {
      set({ prompt, stage, completed, dungeonId, challengeModeEnabled, challengeModeLocked });
    }
  },
  reset: () => set({ location: "world", dungeonId: null, prompt: null, stage: 0, completed: false, challengeModeEnabled: false, challengeModeLocked: false, busy: false, error: "", actionHandler: null }),
}));
