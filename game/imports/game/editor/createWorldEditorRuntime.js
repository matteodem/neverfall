import { Meteor } from "meteor/meteor";
import { createWorldObjectScene } from "./createWorldObjectScene";
import { createTerrainPainter } from "./createTerrainPainter";

// Saved scenery belongs to the world. Editing controls load only on the shortcut.
export const createWorldEditorRuntime = (options) => {
  const { scene, canEnable } = options;
  const painter = createTerrainPainter(options);
  let editor = null, opening = null, refreshing = null, disposed = false;
  const objects = createWorldObjectScene({ scene, onRemove: (root) => editor?.onObjectRemoved(root) });
  const refreshObjects = (isCurrent = () => true) => {
    if (!refreshing) refreshing = (async () => {
      const snapshot = await Meteor.callAsync("worldObjects.list");
      if (!disposed) await objects.reconcile(snapshot.objects, () => !disposed);
      return snapshot;
    })().finally(() => { refreshing = null; });
    return refreshing.then((snapshot) => disposed || !isCurrent() ? null : snapshot);
  };
  const handleKeyDown = (event) => {
    if (event.code !== "KeyR" || !event.ctrlKey || !event.shiftKey || event.altKey ||
      event.target?.closest?.("input, textarea, select, [contenteditable]:not([contenteditable='false'])")) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.repeat || disposed) return;
    if (editor) { void editor.toggle(); return; }
    if (opening || !canEnable()) return;
    opening = import("./createWorldEditor").then(({ createWorldEditor }) => {
      if (disposed || !canEnable()) return;
      editor = createWorldEditor({ ...options, objects, refreshObjects, painter });
      return editor.toggle();
    }).catch((error) => {
      if (!disposed) console.warn("[WorldEditor] Could not open editor", error);
    }).finally(() => { opening = null; });
  };
  window.addEventListener("keydown", handleKeyDown, true);
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    window.removeEventListener("keydown", handleKeyDown, true);
    editor?.dispose();
    painter.dispose();
    objects.dispose();
  };
  scene.onDisposeObservable.addOnce(dispose);
  return {
    isEnabled: () => editor?.isEnabled() || false,
    start: () => {
      void painter.load().catch((error) => {
        if (!disposed) console.warn("[TerrainPaint] Could not load saved paint", error);
      });
      void refreshObjects().catch((error) => {
        if (!disposed) console.warn("[WorldObjects] Could not load saved scenery", error);
      });
    },
    dispose,
  };
};
