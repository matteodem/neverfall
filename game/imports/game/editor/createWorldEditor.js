import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { GizmoManager, PointerEventTypes } from "@babylonjs/core";
import { useWorldEditorStore } from "../../ui/stores/useWorldEditorStore";
import { EDITOR_FENCE_SCALE } from "./loadEditorFence";
import { createWorldObjectScene } from "./createWorldObjectScene";
import { downloadWorldObjects } from "./downloadWorldObjects";

// Only persisted editor objects are editable; the UI cannot authorize itself.
export const createWorldEditor = ({ scene, canvas, terrain, canEnable, onToggle }) => {
  let enabled = false, authorizing = false, disposed = false, revision = 0;
  let adminId = null, asset = null, selected = null, tool = "move";
  let pending = false, gizmos = null;
  let readOnly = true;
  const wiredGizmos = new WeakSet();
  const mayUseEditor = () => !disposed && enabled && adminId && adminId === Meteor.userId();
  const mayEdit = () => mayUseEditor() && !readOnly;
  const publish = (state) => useWorldEditorStore.setState(state);
  const objects = createWorldObjectScene({ scene, onRemove: (root) => {
    if (root !== selected) return;
    gizmos?.attachToNode(null);
    selected = null;
    publish({ selected: false });
  } });
  const refresh = async (isCurrent = () => true) => {
    const snapshot = await Meteor.callAsync("worldObjects.list");
    if (disposed || !isCurrent()) return;
    readOnly = snapshot.readOnly;
    publish({ source: snapshot.source, readOnly });
    await objects.reconcile(snapshot.objects, isCurrent);
  };
  // Every player loads saved scenery, regardless of Build Mode/admin access.
  const ready = refresh().catch((error) => {
    if (!disposed) console.warn("[WorldEditor] Could not load saved objects", error);
  });

  const showGizmo = () => {
    if (!mayEdit() || !selected || pending) return;
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
  };
  const close = () => {
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
    publish({ enabled: false, asset: null, selected: false, busy: false, error: "" });
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
      await ready;
      await refresh(() => request === revision);
      if (request !== revision || !userId || !canEnable() || userId !== Meteor.userId()) return;
      adminId = userId;
      enabled = true;
      objects.setPickable(!readOnly);
      onToggle();
      publish({ enabled: true, tool, error: "" });
    } catch {
      // Access is denied unless the server explicitly authorizes this account.
    } finally {
      if (request === revision) authorizing = false;
    }
  };
  const selectFence = async () => {
    if (!mayEdit() || pending) return;
    select(null);
    asset = "fence";
    publish({ asset, busy: true });
    pending = true;
    try {
      await objects.prepare();
    } catch {
      if (mayEdit()) {
        asset = null;
        publish({ asset: null, error: "Could not load the fence. Select Fence to retry." });
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

  const onPointer = async ({ type, event }) => {
    if (type !== PointerEventTypes.POINTERTAP || event.button !== 0 || !mayEdit() ||
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
    if (asset !== "fence") { select(null); return; }
    const point = pick.pickedPoint.clone();
    await write(async () => {
      const saved = await Meteor.callAsync("worldObjects.create", {
        assetId: "fence",
        position: { x: point.x, y: point.y, z: point.z },
        rotation: { x: 0, y: 0, z: 0 },
        scaling: { x: EDITOR_FENCE_SCALE, y: EDITOR_FENCE_SCALE, z: EDITOR_FENCE_SCALE },
      });
      if (disposed) return;
      const placed = objects.upsert(saved);
      if (mayEdit()) select(placed);
    });
  };
  const pointerObserver = scene.onPointerObservable.add((info) => { void onPointer(info); });
  const handleKeyDown = (event) => {
    if (event.code !== "KeyR" || !event.ctrlKey || !event.shiftKey || event.altKey ||
      event.target?.closest?.("input, textarea, select, [contenteditable]:not([contenteditable='false'])")) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.repeat) return;
    if (enabled || authorizing) close();
    else void enable();
  };
  window.addEventListener("keydown", handleKeyDown, true);
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
    selectFence,
    deleteSelected,
    exportWorld,
    setTool(mode) {
      if (!mayEdit() || pending || gizmos?.isDragging || !["move", "rotate"].includes(mode)) return;
      tool = mode;
      showGizmo();
      publish({ tool });
    },
  };
  publish({ actions });
  const dispose = () => {
    if (disposed) return;
    close();
    disposed = true;
    accountObserver.stop();
    window.removeEventListener("keydown", handleKeyDown, true);
    scene.onPointerObservable.remove(pointerObserver);
    scene.onBeforeRenderObservable.remove(frameObserver);
    objects.dispose();
    if (useWorldEditorStore.getState().actions === actions) publish({ actions: null });
  };
  scene.onDisposeObservable.addOnce(dispose);
  return { isEnabled: () => !!mayUseEditor(), ready, dispose };
};
