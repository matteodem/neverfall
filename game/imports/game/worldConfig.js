export const WORLD_SIZE = 600;
export const CHUNK_SIZE = 200;
export const CHUNK_NEIGHBOR_RADIUS = 1;

export const WORLD_REGIONS = {
  starterForest: { treeCount: 300, bushCount: 150, rockCount: 45, logCount: 24, floorColor: "#4B6B3C" },
  forest: { treeCount: 35, bushCount: 20, rockCount: 8, logCount: 4, floorColor: "#4B6B3C" },
  highlands: { treeCount: 70, bushCount: 55, rockCount: 80, logCount: 8, floorColor: "#4B6B3C" },
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
  { x: 200, z: 0, region: "forest" },
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
