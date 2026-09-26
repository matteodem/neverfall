// Keep picking and drag detection outside React. Camera drags are not clicks.
export const createPlayerSelection = ({ canvas, scene, input, multiplayer, onSelect }) => {
  let press = null;

  input.on(canvas, "pointerdown", (event) => {
    if (event.button !== 0) return;
    press = { id: event.pointerId, x: event.clientX, y: event.clientY, dragged: false };
  });

  input.on(canvas, "pointermove", (event) => {
    if (!press || event.pointerId !== press.id) return;
    const dx = event.clientX - press.x;
    const dy = event.clientY - press.y;
    if (dx * dx + dy * dy > 25) press.dragged = true;
  });

  input.on(canvas, "pointercancel", () => { press = null; });
  input.on(canvas, "pointerup", (event) => {
    if (event.button !== 0 || !press || event.pointerId !== press.id) return;
    const click = press;
    press = null;
    if (click.dragged) return;
    const bounds = canvas.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    if (x < 0 || y < 0 || x > bounds.width || y > bounds.height) return;
    const pick = scene.pick(x, y);
    const sessionId = multiplayer.getRemotePlayerId(pick?.pickedMesh);
    onSelect(sessionId ? { sessionId, name: multiplayer.getRemotePlayerName(sessionId), x: event.clientX, y: event.clientY } : null);
  });
};
