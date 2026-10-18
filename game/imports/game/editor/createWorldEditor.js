import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { GizmoManager, PointerEventTypes } from "@babylonjs/core";
import { useWorldEditorStore } from "../../ui/stores/useWorldEditorStore";
import { getWorldEditorAsset } from "./worldEditorAssets";
import { downloadWorldObjects } from "./downloadWorldObjects";
import { downloadTerrainPaint } from "./downloadTerrainPaint";
import { MAX_STROKE_VERTICES, TERRAIN_PAINT_COLORS } from "../../api/terrainPaint/config";
import { createTerrainPaintInput } from "./createTerrainPaintInput";

// Only persisted editor objects are editable; the UI cannot authorize itself.
export const createWorldEditor = ({ scene, canvas, terrain, canEnable, onToggle, objects, refreshObjects, painter }) => {
  let enabled = false, authorizing = false, disposed = false, revision = 0;
  let adminId = null, asset = null, selected = null, tool = "move";
  let previousObjectTool = "move";
  let pending = false, gizmos = null;
  let readOnly = true;
  let paintColor = 0, brushRadius = 8;
  const wiredGizmos = new WeakSet();
  const mayUseEditor = () => !disposed && enabled && adminId && adminId === Meteor.userId();
  const mayEdit = () => mayUseEditor() && !readOnly;
  const publish = (state) => useWorldEditorStore.setState(state);
  const paintInput = createTerrainPaintInput({
    scene, canvas, painter,
    canPaint: () => mayUseEditor() && canEnable() && tool === "paint" && !pending && !painter.isReadOnly(),
    getBrush: () => ({ color: paintColor, radius: brushRadius }),
    async save(stroke) {
      if (!stroke.size) return;
      pending = true;
      publish({ busy: true, error: "" });
      try {
        await painter.save(stroke);
        if (mayUseEditor() && stroke.size >= MAX_STROKE_VERTICES)
          publish({ error: "Stroke reached the 20,000 vertex limit. Start another stroke to continue painting." });
      }
      catch (error) {
        if (disposed) return;
        if (error.error === "not-authorized") close();
        else if (mayUseEditor()) publish({ error: "Could not save terrain paint. Saved colors have been restored." });
      } finally {
        pending = false;
        if (mayUseEditor()) publish({ busy: false, ...painter.getState() });
      }
    },
  });
  const changePaintHistory = async (direction) => {
    if (!mayUseEditor() || tool !== "paint" || pending || paintInput.isPainting() || !canEnable() ||
      painter.isReadOnly() || !(direction === "undo" ? painter.canUndo() : painter.canRedo())) return;
    pending = true;
    publish({ busy: true, error: "" });
    try { await painter[direction](); }
    catch (error) {
      if (disposed) return;
      if (error.error === "not-authorized") close();
      else if (mayUseEditor()) publish({ error: `Could not ${direction} terrain paint. Saved colors have been restored.` });
    } finally {
      pending = false;
      if (mayUseEditor()) publish({ busy: false, ...painter.getState() });
    }
  };
  const undoPaint = (event) => {
    if (event.code !== "KeyZ" || !event.ctrlKey || event.shiftKey || event.altKey || event.metaKey ||
      !mayUseEditor() || tool !== "paint" ||
      event.target?.closest?.("input:not([type='range']), textarea, select, [contenteditable]:not([contenteditable='false'])")) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!event.repeat) void changePaintHistory("undo");
  };
  window.addEventListener("keydown", undoPaint, true);
  const onObjectRemoved = (root) => {
    if (root !== selected) return;
    gizmos?.attachToNode(null);
    selected = null;
    publish({ selected: false });
  };
  const refresh = async (isCurrent = () => true) => {
    const snapshot = await refreshObjects(isCurrent);
    if (disposed || !isCurrent()) return;
    readOnly = snapshot.readOnly;
    publish({ source: snapshot.source, readOnly });
  };

  const showGizmo = () => {
    if (!mayEdit() || !selected || pending || tool === "paint") return;
    if (!gizmos) {
      gizmos = new GizmoManager(scene);
      gizmos.usePointerToAttachGizmos = false;
      gizmos.enableAutoPicking = false;
    }
    gizmos.positionGizmoEnabled = tool === "move";
    gizmos.rotationGizmoEnabled = tool === "rotate";
    for (const gizmo of [gizmos.gizmos.positionGizmo, gizmos.gizmos.rotationGizmo]) {
      if (!gizmo || wiredGizmos.has(gizmo)) continue;
      wiredGizmos.add(gizmo);
      gizmo.onDragEndObservable.add(() => { void saveSelected(); });
    }
    gizmos.attachToNode(selected);
  };
  const select = (root) => {
    if (!mayEdit() || (root && !objects.has(root))) return;
    selected = root;
    asset = null;
    gizmos?.attachToNode(null);
    if (root) showGizmo();
    publish({ selected: !!root, asset: null, error: "" });
    if (root) publish({ previewAsset: root.metadata.assetId });
  };
  const close = () => {
    paintInput.finish();
    revision++;
    enabled = false;
    authorizing = false;
    adminId = null;
    // Closing in the middle of a drag cancels its unconfirmed transform.
    if (selected && !pending) objects.restore(selected);
    selected = null;
    asset = null;
    gizmos?.dispose();
    gizmos = null;
    objects.setPickable(false);
    publish({ enabled: false, asset: null, previewAsset: null, selected: false, busy: false, error: "" });
    onToggle();
  };
  const authorize = async () => {
    const userId = Meteor.userId();
    if (!userId) return null;
    const allowed = await Meteor.callAsync("worldEditor.authorize");
    return allowed === true && !disposed && Meteor.userId() === userId ? userId : null;
  };
  const enable = async () => {
    if (disposed || pending || !canEnable()) return;
    const request = ++revision;
    authorizing = true;
    try {
      const userId = await authorize();
      if (request !== revision || !userId || !canEnable()) return;
      // Refresh this client's snapshot and prune objects deleted since last opening.
      await refresh(() => request === revision);
      if (request !== revision || disposed) return;
      await painter.load();
      if (request !== revision || !userId || !canEnable() || userId !== Meteor.userId()) return;
      adminId = userId;
      enabled = true;
      objects.setPickable(!readOnly);
      onToggle();
      publish({ enabled: true, tool, paintColor, brushRadius, error: "", ...painter.getState() });
    } catch {
      // Access is denied unless the server explicitly authorizes this account.
    } finally {
      if (request === revision) authorizing = false;
    }
  };
  const selectAsset = async (assetId) => {
    if (!mayUseEditor() || pending || gizmos?.isDragging || !getWorldEditorAsset(assetId)) return;
    publish({ previewAsset: assetId });
    if (readOnly) return;
    paintInput.finish();
    if (pending) return;
    if (tool === "paint") {
      tool = "move";
      publish({ tool });
    }
    select(null);
    asset = assetId;
    publish({ asset, busy: true });
    pending = true;
    try {
      await objects.prepare(assetId);
    } catch {
      if (mayEdit()) {
        asset = null;
        publish({ asset: null, error: "Could not load this asset. Select it again to retry." });
      }
    } finally {
      pending = false;
      if (mayEdit()) publish({ busy: false });
    }
  };

  const write = async (action, root = null) => {
    if (!mayEdit() || pending) return;
    pending = true;
    publish({ busy: true, error: "" });
    gizmos?.attachToNode(null);
    try {
      await action();
    } catch (error) {
      if (disposed) return;
      if (root) {
        if (error.error === "world-object-not-found") objects.remove(root.metadata.worldObjectId);
        else objects.restore(root);
      }
      if (error.error === "not-authorized") close();
      else if (mayEdit()) publish({ error: error.error === "world-object-not-found"
        ? "This object no longer exists and was removed from this scene."
        : "Could not save this change. The last saved state has been restored." });
    } finally {
      pending = false;
      if (mayEdit()) { publish({ busy: false }); showGizmo(); }
    }
  };
  const saveSelected = () => {
    const root = selected;
    if (!mayEdit() || !root || pending) return;
    const data = objects.transform(root);
    return write(async () => {
      const saved = await Meteor.callAsync("worldObjects.update", root.metadata.worldObjectId, data);
      if (!disposed) objects.upsert(saved);
    }, root);
  };
  const deleteSelected = () => {
    const root = selected;
    if (!mayEdit() || !root || pending || gizmos?.isDragging) return;
    return write(async () => {
      const id = root.metadata.worldObjectId;
      await Meteor.callAsync("worldObjects.delete", id);
      if (!disposed) objects.remove(id);
    }, root);
  };
  const exportWorld = async () => {
    if (!mayUseEditor() || pending || gizmos?.isDragging) return;
    pending = true;
    publish({ busy: true, error: "" });
    gizmos?.attachToNode(null);
    try {
      const json = await Meteor.callAsync("worldObjects.export");
      if (mayUseEditor()) downloadWorldObjects(json);
    } catch (error) {
      if (error.error === "not-authorized") close();
      else if (mayUseEditor()) publish({ error: "Could not export the world. Try again." });
    } finally {
      pending = false;
      if (mayUseEditor()) { publish({ busy: false }); showGizmo(); }
    }
  };
  const exportPaint = async () => {
    if (!mayUseEditor() || pending || paintInput.isPainting() || gizmos?.isDragging) return;
    pending = true;
    publish({ busy: true, error: "" });
    gizmos?.attachToNode(null);
    try {
      const json = await Meteor.callAsync("terrainPaint.export");
      if (mayUseEditor()) downloadTerrainPaint(json);
    } catch (error) {
      if (disposed) return;
      if (error.error === "not-authorized") close();
      else if (mayUseEditor()) publish({ error: "Could not export terrain paint. Try again." });
    } finally {
      pending = false;
      if (mayUseEditor()) { publish({ busy: false }); showGizmo(); }
    }
  };

  const onPointer = async ({ type, event }) => {
    if (tool === "paint" || type !== PointerEventTypes.POINTERTAP || event.button !== 0 || !mayEdit() ||
      pending || gizmos?.isHovered || gizmos?.isDragging) return;
    const bounds = canvas.getBoundingClientRect();
    const portrait = !!canvas.closest(".mobile-portrait");
    const x = portrait ? event.clientY - bounds.top : event.clientX - bounds.left;
    const y = portrait ? bounds.right - event.clientX : event.clientY - bounds.top;
    // Include the carved bank mesh: the coarse ground has holes along the river.
    const pick = scene.pick(x, y, (mesh) => mesh === terrain ||
      mesh.name === "starter-river-banks" || !!objects.rootForMesh(mesh));
    if (!pick?.hit) return;
    const root = objects.rootForMesh(pick.pickedMesh);
    if (root) { select(root); return; }
    const assetId = asset;
    const definition = getWorldEditorAsset(assetId);
    if (!definition) { select(null); return; }
    const scale = definition.scale ?? 1;
    const point = pick.pickedPoint.clone();
    await write(async () => {
      const saved = await Meteor.callAsync("worldObjects.create", {
        assetId,
        position: { x: point.x, y: point.y, z: point.z },
        rotation: { x: 0, y: 0, z: 0 },
        scaling: { x: scale, y: scale, z: scale },
      });
      if (disposed) return;
      const placed = objects.upsert(saved);
      if (mayEdit()) select(placed);
    });
  };
  const pointerObserver = scene.onPointerObservable.add((info) => { void onPointer(info); });
  const frameObserver = scene.onBeforeRenderObservable.add(() => {
    if (enabled && (!mayUseEditor() || !canEnable())) close();
  });
  let currentUser = Meteor.userId();
  const accountObserver = Tracker.autorun(() => {
    const userId = Meteor.userId();
    if (userId === currentUser) return;
    currentUser = userId;
    close();
  });
  const actions = {
    close,
    selectAsset,
    deleteSelected,
    exportWorld,
    exportPaint,
    undoPaint: () => changePaintHistory("undo"),
    redoPaint: () => changePaintHistory("redo"),
    setTool(mode) {
      if (!mayUseEditor() || (readOnly && mode !== "paint") || pending || gizmos?.isDragging ||
        !["move", "rotate", "paint"].includes(mode)) return;
      paintInput.finish();
      if (pending) return;
      if (mode === "paint") {
        if (tool === "paint") mode = previousObjectTool;
        else previousObjectTool = tool;
      }
      tool = mode;
      if (mode === "paint") {
        selected = null;
        asset = null;
        gizmos?.attachToNode(null);
        publish({ selected: false, asset: null });
      }
      showGizmo();
      publish({ tool });
    },
    setPaintColor(color) {
      if (Number.isInteger(color) && TERRAIN_PAINT_COLORS[color]) {
        paintColor = color;
        publish({ paintColor });
      }
    },
    setBrushRadius(radius) {
      if (Number.isFinite(radius)) {
        brushRadius = Math.max(1, Math.min(30, radius));
        publish({ brushRadius });
      }
    },
  };
  publish({ actions });
  const dispose = () => {
    if (disposed) return;
    close();
    paintInput.dispose();
    window.removeEventListener("keydown", undoPaint, true);
    disposed = true;
    accountObserver.stop();
    scene.onPointerObservable.remove(pointerObserver);
    scene.onBeforeRenderObservable.remove(frameObserver);
    if (useWorldEditorStore.getState().actions === actions) publish({ actions: null });
  };
  scene.onDisposeObservable.addOnce(dispose);
  return {
    isEnabled: () => !!mayUseEditor(),
    toggle: () => enabled || authorizing ? close() : enable(),
    onObjectRemoved,
    dispose,
  };
};
