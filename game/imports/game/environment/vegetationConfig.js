// Small instanced details; caps scale with the existing quality density.
export const VEGETATION = {
  cellSize: 32,
  patchChance: 0.5,
  highlandChance: 0.28,
  maxPropsPerChunk: 24,
  minClusterSize: 3,
  maxClusterSize: 5,
  radius: 2.8,
  minSpacing: 0.9,
  footprint: 0.65,
  maxHeightDifference: 0.12,
  scale: { grassTufts: [0.55, 0.9], flowers: [0.65, 1], bushes: [0.5, 0.75], stones: [0.18, 0.3] },
};
