import { useTargetStore } from "../ui/stores/useTargetStore";

// Keep picking and drag detection outside React. Camera drags are not clicks.
export const createPlayerSelection = ({ canvas, scene, input, multiplayer, onSelect, canInteract = () => true }) => {
  let press = null;
  const pickAtPointer = (event) => {
    const bounds = canvas.getBoundingClientRect();
    const portrait = Boolean(canvas.closest(".mobile-portrait"));
    const x = portrait ? event.clientY - bounds.top : event.clientX - bounds.left;
    const y = portrait ? bounds.right - event.clientX : event.clientY - bounds.top;
    if (x < 0 || y < 0 || x > canvas.clientWidth || y > canvas.clientHeight) return null;
    return scene.pick(x, y);
  };
  const resetCursor = () => { canvas.style.cursor = "default"; };
  input.on(canvas, "pointerleave", resetCursor);
  scene.onDisposeObservable.addOnce(resetCursor);
  input.on(window, "keydown", (event) => {
    if (event.key === "Escape" && !event.target?.closest?.("input, textarea, select, [contenteditable='true']")) {
      useTargetStore.getState().clear();
    }
  });

  input.on(canvas, "pointerdown", (event) => {
    if (!canInteract() || event.button !== 0) return;
    press = { id: event.pointerId, x: event.clientX, y: event.clientY, dragged: false };
  });

  input.on(canvas, "pointermove", (event) => {
    if (press && event.pointerId === press.id) {
      const dx = event.clientX - press.x;
      const dy = event.clientY - press.y;
      if (dx * dx + dy * dy > 25) press.dragged = true;
    }
    if (!canInteract()) { resetCursor(); return; }
    if (event.pointerType === "touch") return;
    const mesh = pickAtPointer(event)?.pickedMesh;
    canvas.style.cursor = multiplayer.getEnemyId(mesh) || multiplayer.getRemotePlayerId(mesh) ? "pointer" : "default";
  });

  input.on(canvas, "pointercancel", () => { press = null; });
  input.on(canvas, "pointerup", (event) => {
    if (event.button !== 0 || !press || event.pointerId !== press.id) return;
    const click = press;
    press = null;
    if (!canInteract() || click.dragged) return;
    const pick = pickAtPointer(event);
    const enemyId = multiplayer.getEnemyId(pick?.pickedMesh);
    useTargetStore.getState().select(enemyId, multiplayer.room.state);
    const sessionId = multiplayer.getRemotePlayerId(pick?.pickedMesh);
    onSelect(sessionId ? { sessionId, name: multiplayer.getRemotePlayerName(sessionId), x: event.clientX, y: event.clientY } : null);
  });
};
