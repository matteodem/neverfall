export const WORLD_SIZE = 600;
export const CHUNK_SIZE = 200;
export const CHUNK_NEIGHBOR_RADIUS = 1;

export const FOREST_GIANT_HILL = { center: { x: 70, z: 72 }, radius: 58, summitRadius: 12, height: 6 };
export const SOUTHWEST_LAKE = { center: { x: -160, z: -160 }, radius: 14 };
export const SNOWY_MOUNTAINS = { boss: { x: 262, z: 0 } };

// Broad, authored slopes leave the camps, portals, and main routes on easy terrain.
const TERRAIN_FEATURES = [
  { x: -225, z: -210, width: 78, depth: 72, height: 5 },
  { x: -205, z: 12, width: 78, depth: 82, height: 4.5 },
  { x: 205, z: -25, width: 85, depth: 80, height: 5 },
  { x: 0, z: -235, width: 72, depth: 60, height: 3.5 },
  { x: -220, z: 170, width: 100, depth: 92, height: 7, plateau: 0.25 },
  { x: 210, z: 170, width: 100, depth: 95, height: 7, plateau: 0.25 },
  { x: -95, z: 270, width: 78, depth: 66, height: 5 },
  { x: 115, z: 275, width: 78, depth: 66, height: 5 },
  { x: -245, z: 270, width: 58, depth: 24, height: 2.2 },
  { x: 230, z: 265, width: 70, depth: 24, height: 2.3 },
  { x: -105, z: -145, width: 68, depth: 25, height: 1.7 },
  { x: 130, z: 105, width: 75, depth: 28, height: 1.8 },
];

const smooth = (value) => value * value * (3 - 2 * value);
const clamp01 = (value) => Math.max(0, Math.min(1, value));
export const getHighlandMix = (z) => smooth(clamp01((z - 50) / 220));
export const getSnowMix = (x, z) =>
  smooth(clamp01((x - 145) / 95)) * (1 - smooth(clamp01((Math.abs(z) - 115) / 85)));

export const getForestGiantHillHeight = (x, z) => {
  const distance = Math.hypot(x - FOREST_GIANT_HILL.center.x, z - FOREST_GIANT_HILL.center.z);
  if (distance >= FOREST_GIANT_HILL.radius) return 0;
  const slope = Math.max(0, (distance - FOREST_GIANT_HILL.summitRadius) /
    (FOREST_GIANT_HILL.radius - FOREST_GIANT_HILL.summitRadius));
  return FOREST_GIANT_HILL.height * (1 - smooth(slope));
};

export const getWorldHeight = (x, z) => {
  const lakeDistance = Math.hypot(x - SOUTHWEST_LAKE.center.x, z - SOUTHWEST_LAKE.center.z);
  const lakeRise = 1.8 * smooth(clamp01((lakeDistance - 22) / 34)) *
    (1 - smooth(clamp01((lakeDistance - 80) / 40)));
  const existingHeight = TERRAIN_FEATURES.reduce((height, feature) => {
    const distance = Math.hypot((x - feature.x) / feature.width, (z - feature.z) / feature.depth);
    const slope = (1 - distance) / (1 - (feature.plateau || 0));
    return distance < 1 ? height + feature.height * smooth(clamp01(slope)) : height;
  }, getForestGiantHillHeight(x, z) + lakeRise);
  // The approach is walkable; the last few ground segments form the eastern cliff.
  const snowSlope = 18 * smooth(clamp01((x - 145) / 145)) *
    (0.35 + 0.65 * (1 - smooth(clamp01((Math.abs(z) - 125) / 75))));
  const easternCliff = 180 * smooth(clamp01((x - 295) / 35));
  const bossRise = 5 * (1 - smooth(clamp01(
    (Math.hypot(x - SNOWY_MOUNTAINS.boss.x, z - SNOWY_MOUNTAINS.boss.z) - 15) / 25)));
  return existingHeight + snowSlope + easternCliff + bossRise;
};

export const WORLD_REGIONS = {
  starterForest: { treeCount: 300, bushCount: 150, rockCount: 45, logCount: 24, floorColor: "#4B6B3C" },
  forest: { treeCount: 35, bushCount: 20, rockCount: 8, logCount: 4, floorColor: "#4B6B3C" },
  highlands: { treeCount: 70, bushCount: 55, rockCount: 80, logCount: 8, floorColor: "#4B6B3C" },
  snowyMountains: { treeCount: 0, bushCount: 0, rockCount: 18, logCount: 0, floorColor: "#D7E2E6" },
};

// Positions are relative to the center of each highlands chunk.
export const HIGHLANDS_SCENERY = {
  spires: [
    { x: -65, z: 65, height: 16 },
    { x: -52, z: 73, height: 11 },
    { x: 62, z: 58, height: 18 },
    { x: 73, z: 70, height: 12 },
    { x: -78, z: -68, height: 10 },
    { x: -68, z: -60, height: 7 },
    { x: 72, z: -52, height: 13 },
    { x: 60, z: -62, height: 8 },
  ],
  cairns: [
    { x: -52, z: -55 }, { x: 48, z: -42 }, { x: 12, z: 62 },
    { x: -72, z: 10 }, { x: 66, z: 18 }, { x: 20, z: -65 },
    { x: -28, z: 80 }, { x: 82, z: 40 },
  ],
  boulderClusters: [
    { x: -74, z: -20 }, { x: 76, z: -76 }, { x: -22, z: -76 },
    { x: 25, z: 82 }, { x: -76, z: 38 }, { x: 72, z: 5 },
  ],
  ruinedWalls: [
    { x: -35, z: -48, rotation: 0.3 },
    { x: 55, z: 8, rotation: 1.2 },
    { x: -20, z: 55, rotation: -0.4 },
  ],
  landmarks: {
    "-200": { type: "arch", x: -32, z: 22 },
    "0": { type: "tower", x: 40, z: 45 },
    "200": { type: "circle", x: 28, z: -30 },
  },
};

export const WORLD_CHUNKS = [
  { x: -200, z: 200, region: "highlands" },
  { x: 0, z: 200, region: "highlands" },
  { x: 200, z: 200, region: "highlands" },
  { x: -200, z: 0, region: "forest" },
  { x: 0, z: 0, region: "starterForest" },
  { x: 200, z: 0, region: "snowyMountains" },
  { x: -200, z: -200, region: "forest" },
  { x: 0, z: -200, region: "forest" },
  { x: 200, z: -200, region: "forest" },
];

export const getChunkCoordinates = ({ x, z }) => ({
  x: Math.floor((x + CHUNK_SIZE / 2) / CHUNK_SIZE),
  z: Math.floor((z + CHUNK_SIZE / 2) / CHUNK_SIZE),
});

export const areNearbyChunks = (position, playerPosition) => {
  const chunk = getChunkCoordinates(position);
  const current = getChunkCoordinates(playerPosition);
  return Math.abs(chunk.x - current.x) <= CHUNK_NEIGHBOR_RADIUS
    && Math.abs(chunk.z - current.z) <= CHUNK_NEIGHBOR_RADIUS;
};
