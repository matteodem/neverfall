export const WORLD_SIZE = 600;
export const CHUNK_SIZE = 200;
export const CHUNK_NEIGHBOR_RADIUS = 1;

export const WORLD_REGIONS = {
  starterForest: { treeCount: 300, bushCount: 150, rockCount: 45, logCount: 24, floorColor: "#4B6B3C" },
  forest: { treeCount: 35, bushCount: 20, rockCount: 8, logCount: 4, floorColor: "#45643B" },
  highlands: { treeCount: 12, bushCount: 8, rockCount: 35, logCount: 2, floorColor: "#69715B" },
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
