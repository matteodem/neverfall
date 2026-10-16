import { ENVIRONMENT_PATHS as CONFIG } from "./environmentPolishConfig";

export const pathNoise = (x, z, side = 0) => {
  const scale = Math.max(0.1, CONFIG.edgeNoiseScale);
  return Math.sin(x / scale + z / scale * 0.73 + side * 2) * 0.65 +
    Math.sin(x / scale * 2.3 - z / scale * 1.7 + side * 4) * 0.35;
};

export const pathEdgeRadius = (point, side) => {
  const bite = Math.max(0, Math.sin((point.x * 0.7 + point.z) /
    Math.max(0.1, CONFIG.grassIntrusionSpacing) + side * 2.7)) ** 8;
  return Math.max(0.5, CONFIG.width / 2 + pathNoise(point.x, point.z, side) * CONFIG.edgeNoise -
    bite * CONFIG.grassIntrusion);
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
