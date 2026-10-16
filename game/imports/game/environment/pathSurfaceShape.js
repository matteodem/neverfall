import { ENVIRONMENT_PATHS as CONFIG } from "./environmentPolishConfig";

export const pathNoise = (x, z, side = 0) => {
  const scale = Math.max(0.1, CONFIG.edgeNoiseScale);
  return Math.sin(x / scale + z / scale * 0.73 + side * 2) * 0.65 +
    Math.sin(x / scale * 2.3 - z / scale * 1.7 + side * 4) * 0.35;
};

export const pathEdgeRadius = (point, side, width = CONFIG.width) => {
  const bite = Math.max(0, Math.sin((point.x * 0.7 + point.z) /
    Math.max(0.1, CONFIG.grassIntrusionSpacing) + side * 2.7)) ** 8;
  const detailScale = width / CONFIG.width;
  return Math.max(0.5, width / 2 + pathNoise(point.x, point.z, side) * CONFIG.edgeNoise * detailScale -
    bite * CONFIG.grassIntrusion * detailScale);
};

export const isPathConnection = (point) => CONFIG.connections.some((join) =>
  Math.hypot(point.x - join.x, point.z - join.z) < 0.01);

// Opposite route directions must share the same physical edges at an internal join.
export const getPathSection = (route, index) => {
  const point = route.points[index];
  const before = route.points[Math.max(0, index - 1)], after = route.points[Math.min(route.points.length - 1, index + 1)];
  const length = Math.hypot(after.x - before.x, after.z - before.z) || 1;
  let dx = (after.x - before.x) / length, dz = (after.z - before.z) / length;
  let x = point.x, z = point.z, reverseMix = 0;
  const join = CONFIG.connections.find((entry) => Math.hypot(x - entry.x, z - entry.z) < entry.blendLength);
  if (join) {
    const t = 1 - Math.hypot(x - join.x, z - join.z) / join.blendLength;
    const blend = t * t * (3 - 2 * t);
    const along = (x - join.x) * join.directionX + (z - join.z) * join.directionZ;
    const sign = dx * join.directionX + dz * join.directionZ < 0 ? -1 : 1;
    x += (join.x + along * join.directionX - x) * blend;
    z += (join.z + along * join.directionZ - z) * blend;
    dx += (join.directionX * sign - dx) * blend;
    dz += (join.directionZ * sign - dz) * blend;
    reverseMix = sign < 0 ? blend : 0;
  }
  const tangentLength = Math.hypot(dx, dz) || 1;
  return { x, z, dx: dx / tangentLength, dz: dz / tangentLength,
    radius: (side) => pathEdgeRadius({ x, z }, side, route.width) * (1 - reverseMix) +
      pathEdgeRadius({ x, z }, -side, route.width) * reverseMix };
};

// Read the existing deck collider once; never change its shape or traversal.
export const getPathBridgeApproach = (scene) => {
  const deck = scene.getMeshByName("central-camp-bridge-collider");
  if (!deck) return () => null;
  deck.computeWorldMatrix(true);
  const { minimumWorld: min, maximumWorld: max } = deck.getBoundingInfo().boundingBox;
  const centerX = (min.x + max.x) / 2, halfWidth = (max.x - min.x) / 2;
  return (point) => {
    if (Math.abs(point.x - centerX) > halfWidth + 1) return null;
    const distance = Math.max(min.z - point.z, 0, point.z - max.z);
    const t = Math.max(0, 1 - distance / Math.max(0.1, CONFIG.bridgeBlendLength));
    return { weight: t * t * (3 - 2 * t), halfWidth };
  };
};
