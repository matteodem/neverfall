import { ENVIRONMENT_PATHS as CONFIG } from "./environmentPolishConfig";
import { ENVIRONMENT_ROUTES } from "./environmentPaths";
import { getSimplePathOutline, pathTurn, triangulatePathOutline } from "./pathOutlineGeometry";

const cross = (a, b) => a.x * b.z - a.z * b.x;
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

// Trim connected ribbons at existing sample rows. Their exact seven-band rows
// become the mouths of one shared surface, including mixed-width forest trails.
export const getPathJunctions = () => {
  const endpoints = new Map();
  for (const { points } of ENVIRONMENT_ROUTES) {
    for (const point of [points[0], points[points.length - 1]])
      endpoints.set(`${Math.round(point.x * 1000)},${Math.round(point.z * 1000)}`, point);
  }
  const junctions = [];
  for (const center of endpoints.values()) {
    const arms = [], connected = new Map();
    for (const route of ENVIRONMENT_ROUTES) {
      for (const [index, { from, dx, dz, lengthSquared }] of route.segments.entries()) {
        if (!lengthSquared) continue;
        const t = Math.max(0, Math.min(1,
          ((center.x - from.x) * dx + (center.z - from.z) * dz) / lengthSquared));
        if (Math.hypot(center.x - from.x - dx * t, center.z - from.z - dz * t) > 0.05) continue;
        if (!connected.has(route)) connected.set(route, []);
        connected.get(route).push(index);
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
    const halfWidth = Math.max(...[...connected.keys()].map((route) => (route.width ?? CONFIG.width) / 2)) + CONFIG.edgeNoise;
    for (let index = 0; index < arms.length; index++) {
      const a = arms[index], b = arms[(index + 1) % arms.length];
      const angle = Math.acos(Math.max(-1, Math.min(1, a.x * b.x + a.z * b.z)));
      radius = Math.max(radius, halfWidth / Math.tan(angle / 2) + CONFIG.junctionRoundness + 1);
    }
    const cuts = [], mouths = [];
    for (const [route, touches] of connected) {
      // Only trim contiguous runs touching this junction; a looping trail may return nearby.
      for (const seed of touches) {
        let from = seed, to = seed + 1;
        while (from > 0 && distance(route.points[from], center) < radius) from--;
        while (to < route.points.length - 1 && distance(route.points[to], center) < radius) to++;
        if (cuts.some((cut) => cut.route === route && cut.from === from && cut.to === to)) continue;
        cuts.push({ route, from, to });
        if (from > 0 || distance(route.points[from], center) >= radius)
          mouths.push({ route, index: from, along: -1 });
        if (to < route.points.length - 1 || distance(route.points[to], center) >= radius)
          mouths.push({ route, index: to, along: 1 });
      }
    }
    mouths.sort((a, b) => {
      const pa = a.route.points[a.index], pb = b.route.points[b.index];
      return Math.atan2(pa.z - center.z, pa.x - center.x) - Math.atan2(pb.z - center.z, pb.x - center.x);
    });
    junctions.push({ center, cuts, mouths });
  }
  return junctions;
};

// Plan in XZ before cutting any ribbons or allocating terrain vertices in a chunk.
export const preparePathJunction = ({ junction, section, edgeAlpha }) => {
  if (junction.mouths.length < 3) return null;
  const vertices = [], triangles = [], rows = [];
  const vertex = (x, z, alpha) => {
    const point = { x, z, alpha, index: vertices.length };
    vertices.push(point);
    return point;
  };
  const midpoints = new Map();
  // Keep terrain draping and subtle sand colors sampled as finely as the ribbons.
  const emit = (a, b, c) => {
    if (Math.abs(pathTurn(a, b, c)) < 1e-7) return;
    const edges = [[a, b, c], [b, c, a], [c, a, b]];
    const [from, to, other] = edges.sort((a, b) => distance(b[0], b[1]) - distance(a[0], a[1]))[0];
    if (distance(from, to) <= Math.max(1, CONFIG.sampleSpacing * 2)) {
      triangles.push([a.index, b.index, c.index]);
      return;
    }
    const key = [from.index, to.index].sort((a, b) => a - b).join(",");
    if (!midpoints.has(key)) {
      const x = (from.x + to.x) / 2, z = (from.z + to.z) / 2, alpha = (from.alpha + to.alpha) / 2;
      midpoints.set(key, vertex(x, z, alpha));
    }
    const middle = midpoints.get(key);
    emit(from, middle, other);
    emit(middle, to, other);
  };
  const mouths = junction.mouths.map(({ route, index, along }) => {
    const start = vertices.length;
    for (const point of section(route, index)) vertex(point.x, point.z, point.alpha);
    rows.push({ route, index, start });
    const before = route.points[Math.max(0, index - 1)], after = route.points[Math.min(route.points.length - 1, index + 1)];
    const length = distance(before, after);
    const direction = { x: (after.x - before.x) / (length || 1) * along, z: (after.z - before.z) / (length || 1) * along };
    const bands = Array.from({ length: 7 }, (_, band) =>
      vertices[start + (along > 0 ? 6 - band : band)]);
    return { direction, right: bands.slice(0, 3), center: bands[3], left: bands.slice(4).reverse() };
  });
  if (mouths.some(({ direction }) => Math.hypot(direction.x, direction.z) < 0.5)) return null;
  const outlines = [[], [], []], strips = [];
  const reach = Math.max(...junction.mouths.map(({ route, index }) => distance(route.points[index], junction.center))) + CONFIG.width;
  for (let index = 0; index < mouths.length; index++) {
    const a = mouths[index], b = mouths[(index + 1) % mouths.length];
    for (let band = 0; band < 3; band++) outlines[band].push(a.right[band], a.center, a.left[band]);
    const determinant = cross(a.direction, b.direction);
    const corners = [];
    // Reflex gaps need an outside corner too. A straight chord cuts across the
    // inner fillets when all exits leave on one side (the Lake waypoint junction).
    if (Math.abs(determinant) > 0.01) {
      for (let band = 0; band < 3; band++) {
        const pa = a.left[band], pb = b.right[band];
        const along = cross({ x: pb.x - pa.x, z: pb.z - pa.z }, b.direction) / determinant;
        const otherAlong = cross({ x: pb.x - pa.x, z: pb.z - pa.z }, a.direction) / determinant;
        const corner = { x: pa.x + a.direction.x * along, z: pa.z + a.direction.z * along };
        // Never extend a fillet beyond its mouths or create an unbounded miter.
        if (!Number.isFinite(along) || along > 0 || otherAlong > 0 || distance(corner, junction.center) > reach) return null;
        corners.push(corner);
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
          return vertex(x, z, alpha);
        }));
      }
    }
    edge.push(b.right);
    for (let step = 1; step < edge.length; step++) {
      const from = edge[step - 1], to = edge[step];
      for (let band = 0; band < 2; band++) {
        const a = [from[band], to[band], from[band + 1]];
        const b = [from[band + 1], to[band], to[band + 1]];
        if (pathTurn(...a) * pathTurn(...b) < -1e-14) return null;
        strips.push(a, b);
      }
    }
    for (let band = 0; band < 3; band++) outlines[band].push(...edge.slice(1, -1).map((bands) => bands[band]));
  }
  if (outlines.some((outline) => !getSimplePathOutline(outline))) return null;
  const center = triangulatePathOutline(outlines[2]);
  if (!center) return null;
  for (const points of [...strips, ...center]) emit(...points);
  return { vertices, triangles, rows };
};

export const appendPathJunction = ({ geometry, row, vertex, triangle }) => {
  const indices = new Map();
  for (const { route, index, start } of geometry.rows) {
    const target = row(route, index);
    for (let band = 0; band < 7; band++) indices.set(start + band, target + band);
  }
  for (const point of geometry.vertices)
    if (!indices.has(point.index)) indices.set(point.index, vertex(point.x, point.z, point.alpha));
  for (const points of geometry.triangles) triangle(...points.map((index) => indices.get(index)));
};
