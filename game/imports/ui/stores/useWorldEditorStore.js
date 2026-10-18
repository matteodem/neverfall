import { create } from "zustand";

// UI state only. The scene controller owns authorization, objects and edits.
export const useWorldEditorStore = create(() => ({
  enabled: false,
  source: null,
  readOnly: true,
  asset: null,
  previewAsset: null,
  tool: "move",
  paintColor: 0,
  brushRadius: 8,
  paintSource: null,
  paintReadOnly: true,
  canUndoPaint: false,
  canRedoPaint: false,
  selected: false,
  busy: false,
  error: "",
  actions: null,
}));
