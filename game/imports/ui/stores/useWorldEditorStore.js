import { create } from "zustand";

// UI state only. The scene controller owns authorization, objects and edits.
export const useWorldEditorStore = create(() => ({
  enabled: false,
  asset: null,
  tool: "move",
  selected: false,
  busy: false,
  error: "",
  actions: null,
}));
