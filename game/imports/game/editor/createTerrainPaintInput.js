// Canvas capture keeps terrain strokes separate from Babylon object taps/gizmos.
export const createTerrainPaintInput = ({ scene, canvas, painter, canPaint, getBrush, save }) => {
  let stroke = null, pointerId = null, previous = null;
  const sample = (event) => {
    const bounds = canvas.getBoundingClientRect();
    const portrait = !!canvas.closest(".mobile-portrait");
    const x = portrait ? event.clientY - bounds.top : event.clientX - bounds.left;
    const y = portrait ? bounds.right - event.clientX : event.clientY - bounds.top;
    const pick = scene.pick(x, y, painter.isTerrain);
    if (!pick?.hit) { previous = null; return; }
    const point = pick.pickedPoint;
    const { radius, color } = getBrush();
    const distance = previous ? Math.hypot(point.x - previous.x, point.z - previous.z) : 0;
    const steps = Math.max(1, Math.ceil(distance / Math.max(0.5, radius / 2)));
    const dirty = new Set();
    for (let step = 1; step <= steps; step++) {
      const t = step / steps;
      painter.paint(previous ? { x: previous.x + (point.x - previous.x) * t,
        z: previous.z + (point.z - previous.z) * t } : point, radius, color, stroke, dirty);
    }
    painter.upload(dirty);
    previous = { x: point.x, z: point.z };
  };
  const finish = () => {
    if (!stroke) return;
    const completed = stroke, captured = pointerId;
    stroke = null; pointerId = null; previous = null;
    if (canvas.hasPointerCapture(captured)) canvas.releasePointerCapture(captured);
    void save(completed);
  };
  const down = (event) => {
    if (!canPaint() || event.button !== 0 || stroke) return;
    event.preventDefault(); event.stopImmediatePropagation();
    stroke = new Map(); pointerId = event.pointerId;
    canvas.setPointerCapture(pointerId);
    sample(event);
  };
  const move = (event) => {
    if (!stroke || pointerId !== event.pointerId) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (!canPaint() || !(event.buttons & 1)) { finish(); return; }
    sample(event);
  };
  const up = (event) => {
    if (!stroke || pointerId !== event.pointerId) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (event.type === "pointerup" && canPaint()) sample(event);
    finish();
  };
  const handlers = { pointerdown: down, pointermove: move, pointerup: up,
    pointercancel: up, lostpointercapture: up };
  for (const [name, handler] of Object.entries(handlers)) canvas.addEventListener(name, handler, true);
  window.addEventListener("blur", finish);
  return {
    finish,
    isPainting: () => !!stroke,
    dispose() {
      finish();
      for (const [name, handler] of Object.entries(handlers)) canvas.removeEventListener(name, handler, true);
      window.removeEventListener("blur", finish);
    },
  };
};
