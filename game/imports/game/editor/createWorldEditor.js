import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { GizmoManager, PointerEventTypes } from "@babylonjs/core";
import { useWorldEditorStore } from "../../ui/stores/useWorldEditorStore";
import { loadEditorFence } from "./loadEditorFence";

// Scene-local only: the UI cannot authorize itself or edit procedural objects.
export const createWorldEditor = ({ scene, canvas, terrain, canEnable, onToggle }) => {
  let enabled = false, authorizing = false, disposed = false, revision = 0;
  let adminId = null, asset = null, selected = null, tool = "move";
  let fenceAsset = null, loadingAsset = null, gizmos = null;
  const placements = new Set();
  const editorMeshes = new Map();
  const mayEdit = () => !disposed && enabled && adminId && adminId === Meteor.userId();
  const publish = (state) => useWorldEditorStore.setState(state);

  const showGizmo = () => {
    if (!mayEdit() || !selected) return;
    if (!gizmos) {
      gizmos = new GizmoManager(scene);
      gizmos.usePointerToAttachGizmos = false;
      gizmos.enableAutoPicking = false;
    }
    gizmos.positionGizmoEnabled = tool === "move";
    gizmos.rotationGizmoEnabled = tool === "rotate";
    gizmos.attachToNode(selected);
  };
  const select = (root) => {
    if (!mayEdit() || (root && !placements.has(root))) return;
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
    selected = null;
    asset = null;
    gizmos?.dispose();
    gizmos = null;
    for (const mesh of editorMeshes.keys()) mesh.isPickable = false;
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
    if (disposed || !canEnable()) return;
    const request = ++revision;
    authorizing = true;
    try {
      const userId = await authorize();
      if (request !== revision || !userId || !canEnable()) return;
      adminId = userId;
      enabled = true;
      for (const mesh of editorMeshes.keys()) mesh.isPickable = true;
      onToggle();
      publish({ enabled: true, tool, error: "" });
    } catch {
      // Access is denied unless the server explicitly authorizes this account.
    } finally {
      if (request === revision) authorizing = false;
    }
  };
  const selectFence = async () => {
    if (!mayEdit() || useWorldEditorStore.getState().busy) return;
    select(null);
    asset = "fence";
    publish({ asset, busy: true });
    const request = revision;
    try {
      if (!fenceAsset) {
        loadingAsset ||= loadEditorFence(scene);
        fenceAsset = await loadingAsset;
        if (disposed) { fenceAsset?.dispose(); fenceAsset = null; return; }
      }
    } catch {
      loadingAsset = null;
      if (request === revision && mayEdit()) publish({ error: "Could not load the fence. Select Fence to retry." });
    } finally {
      if (request === revision && mayEdit()) publish({ busy: false });
    }
  };

  const onPointer = async ({ type, event }) => {
    if (type !== PointerEventTypes.POINTERTAP || event.button !== 0 || !mayEdit() ||
      useWorldEditorStore.getState().busy || gizmos?.isHovered || gizmos?.isDragging) return;
    const bounds = canvas.getBoundingClientRect();
    const portrait = !!canvas.closest(".mobile-portrait");
    const x = portrait ? event.clientY - bounds.top : event.clientX - bounds.left;
    const y = portrait ? bounds.right - event.clientX : event.clientY - bounds.top;
    // Include the carved bank mesh: the coarse ground has holes along the river.
    const pick = scene.pick(x, y, (mesh) => mesh === terrain ||
      mesh.name === "starter-river-banks" || editorMeshes.has(mesh));
    if (!pick?.hit) return;
    const root = editorMeshes.get(pick.pickedMesh);
    if (root) { select(root); return; }
    if (asset !== "fence" || !fenceAsset) { select(null); return; }
    const point = pick.pickedPoint.clone();
    const request = revision;
    publish({ busy: true, error: "" });
    try {
      // Placement is also guarded here, independently of the React panel/store.
      if (await authorize() !== adminId || request !== revision || !mayEdit()) return;
      const placed = fenceAsset.place(point);
      placements.add(placed);
      for (const mesh of placed.getChildMeshes()) if (mesh.getTotalVertices()) editorMeshes.set(mesh, placed);
      select(placed);
    } catch (error) {
      if (error.error === "not-authorized" && request === revision) { close(); return; }
      if (request === revision && mayEdit()) publish({ error: "Could not place the fence. Check admin access and try again." });
    } finally {
      if (request === revision && mayEdit()) publish({ busy: false });
    }
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
    if (enabled && (!mayEdit() || !canEnable())) close();
  });
  let currentUser = Meteor.userId();
  const accountObserver = Tracker.autorun(() => {
    const userId = Meteor.userId();
    if (userId === currentUser) return;
    currentUser = userId;
    close();
    for (const root of placements) root.dispose();
    placements.clear();
    editorMeshes.clear();
  });
  const actions = {
    close,
    selectFence,
    setTool(mode) {
      if (!mayEdit() || !["move", "rotate"].includes(mode)) return;
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
    for (const root of placements) root.dispose();
    placements.clear();
    editorMeshes.clear();
    fenceAsset?.dispose();
    if (useWorldEditorStore.getState().actions === actions) publish({ actions: null });
  };
  scene.onDisposeObservable.addOnce(dispose);
  return { isEnabled: () => !!mayEdit(), dispose };
};
