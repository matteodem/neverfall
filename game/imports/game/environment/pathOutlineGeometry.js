const EPSILON = 1e-7;
export const pathTurn = (a, b, c) =>
  (b.x - a.x) * (c.z - a.z) - (b.z - a.z) * (c.x - a.x);
const close = (a, b) => Math.hypot(a.x - b.x, a.z - b.z) <= EPSILON;
const onSegment = (a, b, p) => Math.abs(pathTurn(a, b, p)) <= EPSILON &&
  p.x >= Math.min(a.x, b.x) - EPSILON && p.x <= Math.max(a.x, b.x) + EPSILON &&
  p.z >= Math.min(a.z, b.z) - EPSILON && p.z <= Math.max(a.z, b.z) + EPSILON;

// Keep original vertex references so cleaned outlines still share ribbon mouth rows.
const cleanOutline = (outline) => {
  if (outline.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.z))) return null;
  const points = [];
  for (const point of outline) if (!points.length || !close(point, points[points.length - 1])) points.push(point);
  if (points.length > 1 && close(points[0], points[points.length - 1])) points.pop();
  let changed = true;
  while (changed && points.length > 3) {
    changed = false;
    for (let i = 0; i < points.length; i++) {
      const a = points[(i + points.length - 1) % points.length], b = points[i], c = points[(i + 1) % points.length];
      if (close(a, b) || close(b, c) || onSegment(a, c, b)) {
        points.splice(i, 1);
        changed = true;
        break;
      }
    }
  }
  return points;
};

export const getSimplePathOutline = (outline) => {
  const points = cleanOutline(outline);
  if (!points || points.length < 3) return null;
  for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length];
    for (let j = i + 2; j < points.length; j++) {
      if (i === 0 && j === points.length - 1) continue;
      const c = points[j], d = points[(j + 1) % points.length];
      const abC = pathTurn(a, b, c), abD = pathTurn(a, b, d);
      const cdA = pathTurn(c, d, a), cdB = pathTurn(c, d, b);
      if ((abC * abD < 0 && cdA * cdB < 0) ||
        onSegment(a, b, c) || onSegment(a, b, d) || onSegment(c, d, a) || onSegment(c, d, b)) return null;
    }
  }
  const origin = points[0];
  const area = points.reduce((sum, p, i) => sum + pathTurn(origin, p, points[(i + 1) % points.length]), 0);
  if (Math.abs(area) <= EPSILON) return null;
  return area < 0 ? points.reverse() : points;
};

// Stage all ears before emitting anything: failure never leaves a partial junction.
export const triangulatePathOutline = (outline) => {
  const polygon = getSimplePathOutline(outline);
  if (!polygon) return null;
  const triangles = [];
  while (polygon.length > 3) {
    const index = polygon.findIndex((b, i) => {
      const a = polygon[(i + polygon.length - 1) % polygon.length], c = polygon[(i + 1) % polygon.length];
      return pathTurn(a, b, c) > EPSILON && !polygon.some((p) => p !== a && p !== b && p !== c &&
        pathTurn(a, b, p) >= -EPSILON && pathTurn(b, c, p) >= -EPSILON && pathTurn(c, a, p) >= -EPSILON);
    });
    if (index < 0) return null;
    triangles.push([polygon[(index + polygon.length - 1) % polygon.length], polygon[index], polygon[(index + 1) % polygon.length]]);
    polygon.splice(index, 1);
  }
  if (pathTurn(...polygon) <= EPSILON) return null;
  triangles.push(polygon);
  return triangles;
};
