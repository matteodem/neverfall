import { ENVIRONMENT_PATHS as CONFIG } from "./environmentPolishConfig";
import { ENVIRONMENT_ROUTES } from "./environmentPaths";

const cross = (a, b) => a.x * b.z - a.z * b.x;
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

// Trim connected ribbons at existing sample rows. Their exact seven-band rows
// become the mouths of one shared surface, including mixed-width forest trails.
export const getPathJunctions = () => {
  const endpoints = new Map();
  for (const { points } of ENVIRONMENT_ROUTES) {
    for (const point of [points[0], points[points.length - 1]]) endpoints.set(`${point.x.toFixed(3)},${point.z.toFixed(3)}`, point);
  }
  const junctions = [];
  for (const center of endpoints.values()) {
    const arms = [], connected = new Set();
    for (const route of ENVIRONMENT_ROUTES) {
      for (const { from, dx, dz, lengthSquared } of route.segments) {
        if (!lengthSquared) continue;
        const t = Math.max(0, Math.min(1,
          ((center.x - from.x) * dx + (center.z - from.z) * dz) / lengthSquared));
        if (Math.hypot(center.x - from.x - dx * t, center.z - from.z - dz * t) > 0.05) continue;
        connected.add(route);
        for (const point of [from, { x: from.x + dx, z: from.z + dz }]) {
          const length = distance(point, center);
          if (length < 0.05) continue;
          const arm = { x: (point.x - center.x) / length, z: (point.z - center.z) / length };
          if (!arms.some((other) => arm.x * other.x + arm.z * other.z > 0.995)) arms.push(arm);
        }
      }
    }
    if (arms.length < 3) continue;
    arms.sort((a, b) => Math.atan2(a.z, a.x) - Math.atan2(b.z, b.x));
    let radius = 5;
    const halfWidth = Math.max(...[...connected].map((route) => (route.width ?? CONFIG.width) / 2)) + CONFIG.edgeNoise;
    for (let index = 0; index < arms.length; index++) {
      const a = arms[index], b = arms[(index + 1) % arms.length];
      const angle = Math.acos(Math.max(-1, Math.min(1, a.x * b.x + a.z * b.z)));
      radius = Math.max(radius, halfWidth / Math.tan(angle / 2) + CONFIG.junctionRoundness + 1);
    }
    const cuts = [], mouths = [];
    for (const route of connected) {
      const inside = route.points.map((point, index) => distance(point, center) < radius ? index : -1)
        .filter((index) => index >= 0);
      if (!inside.length) continue;
      const first = inside[0], last = inside[inside.length - 1];
      const from = Math.max(0, first - 1), to = Math.min(route.points.length - 1, last + 1);
      cuts.push({ route, from, to });
      if (first > 0) mouths.push({ route, index: from, along: -1 });
      if (last < route.points.length - 1) mouths.push({ route, index: to, along: 1 });
    }
    mouths.sort((a, b) => {
      const pa = a.route.points[a.index], pb = b.route.points[b.index];
      return Math.atan2(pa.z - center.z, pa.x - center.x) - Math.atan2(pb.z - center.z, pb.x - center.x);
    });
    junctions.push({ center, cuts, mouths });
  }
  return junctions;
};

// Ear clipping fills the concave outline without a center fan spanning other arms.
const triangulate = (outline, triangle) => {
  const polygon = [...outline];
  const turn = (a, b, c) => cross({ x: b.x - a.x, z: b.z - a.z }, { x: c.x - a.x, z: c.z - a.z });
  const area = polygon.reduce((sum, a, i) => sum + cross(a, polygon[(i + 1) % polygon.length]), 0);
  if (area < 0) polygon.reverse();
  while (polygon.length > 3) {
    const index = polygon.findIndex((b, i) => {
      const a = polygon[(i + polygon.length - 1) % polygon.length], c = polygon[(i + 1) % polygon.length];
      return turn(a, b, c) > 1e-8 && !polygon.some((p) => p !== a && p !== b && p !== c &&
        turn(a, b, p) >= -1e-8 && turn(b, c, p) >= -1e-8 && turn(c, a, p) >= -1e-8);
    });
    if (index < 0) throw new Error("Could not triangulate path junction outline");
    const a = polygon[(index + polygon.length - 1) % polygon.length], b = polygon[index];
    const c = polygon[(index + 1) % polygon.length];
    triangle(a, b, c);
    polygon.splice(index, 1);
  }
  if (polygon.length === 3) triangle(...polygon);
};

export const appendPathJunction = ({ junction, row, vertex, triangle, positions, edgeAlpha }) => {
  const point = (index, alpha) => ({ x: positions[index * 3], z: positions[index * 3 + 2], index, alpha });
  const midpoints = new Map();
  // Keep terrain draping and subtle sand colors sampled as finely as the ribbons.
  const emit = (a, b, c) => {
    const edges = [[a, b, c], [b, c, a], [c, a, b]];
    const [from, to, other] = edges.sort((a, b) => distance(b[0], b[1]) - distance(a[0], a[1]))[0];
    if (distance(from, to) <= Math.max(1, CONFIG.sampleSpacing * 2)) {
      triangle(a.index, b.index, c.index);
      return;
    }
    const key = [from.index, to.index].sort((a, b) => a - b).join(",");
    if (!midpoints.has(key)) {
      const x = (from.x + to.x) / 2, z = (from.z + to.z) / 2, alpha = (from.alpha + to.alpha) / 2;
      midpoints.set(key, { x, z, alpha, index: vertex(x, z, alpha) });
    }
    const middle = midpoints.get(key);
    emit(from, middle, other);
    emit(middle, to, other);
  };
  const mouths = junction.mouths.map(({ route, index, along }) => {
    const start = row(route, index);
    const before = route.points[Math.max(0, index - 1)], after = route.points[Math.min(route.points.length - 1, index + 1)];
    const length = distance(before, after);
    const direction = { x: (after.x - before.x) / length * along, z: (after.z - before.z) / length * along };
    const bands = Array.from({ length: 7 }, (_, band) =>
      point(start + (along > 0 ? 6 - band : band), edgeAlpha(Math.min(band, 6 - band) / 2)));
    return { direction, right: bands.slice(0, 3), center: bands[3], left: bands.slice(4).reverse() };
  });
  const outline = [];
  for (let index = 0; index < mouths.length; index++) {
    const a = mouths[index], b = mouths[(index + 1) % mouths.length];
    outline.push(a.right[2], a.center, a.left[2]);
    const determinant = cross(a.direction, b.direction);
    const corners = [];
    if (determinant > 0.01) {
      for (let band = 0; band < 3; band++) {
        const pa = a.left[band], pb = b.right[band];
        const along = cross({ x: pb.x - pa.x, z: pb.z - pa.z }, b.direction) / determinant;
        corners.push({ x: pa.x + a.direction.x * along, z: pa.z + a.direction.z * along });
      }
    }
    const edge = [a.left];
    if (corners.length) {
      const size = Math.min(CONFIG.junctionRoundness, distance(a.left[0], corners[0]) / 2,
        distance(b.right[0], corners[0]) / 2);
      for (let step = 0; step <= 6; step++) {
        const t = step / 6;
        edge.push(corners.map((corner, band) => {
          const x = corner.x + size * (a.direction.x * (1 - t) ** 2 + b.direction.x * t * t);
          const z = corner.z + size * (a.direction.z * (1 - t) ** 2 + b.direction.z * t * t);
          const alpha = edgeAlpha(band / 2);
          return { x, z, alpha, index: vertex(x, z, alpha) };
        }));
      }
    }
    edge.push(b.right);
    for (let step = 1; step < edge.length; step++) {
      const from = edge[step - 1], to = edge[step];
      for (let band = 0; band < 2; band++) {
        emit(from[band], to[band], from[band + 1]);
        emit(from[band + 1], to[band], to[band + 1]);
      }
    }
    outline.push(...edge.slice(1, -1).map((bands) => bands[2]));
  }
  triangulate(outline, emit);
};
