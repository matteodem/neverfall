import { getSnowMix, getWorldHeight } from "../worldConfig";
import { VEGETATION as CONFIG } from "./vegetationConfig";

// Independent random stream keeps existing trees, rocks and clearings stable.
export const createVegetationPatches = ({ center, size, density, random, canPlace, place }) => {
  const cells = Math.ceil(size / CONFIG.cellSize);
  const spacing = size / cells;
  const limit = Math.floor(CONFIG.maxPropsPerChunk * density);
  const chance = center.region === "highlands" ? CONFIG.highlandChance : CONFIG.patchChance;
  let placed = 0;
  for (let row = 0; row < cells && placed < limit; row++) {
    for (let column = 0; column < cells && placed < limit; column++) {
      if (random() >= chance * density) continue;
      const anchor = {
        x: center.x - size / 2 + (column + 0.2 + random() * 0.6) * spacing,
        z: center.z - size / 2 + (row + 0.2 + random() * 0.6) * spacing,
      };
      if (!canPlace(anchor, CONFIG.radius + 1) || getSnowMix(anchor.x, anchor.z) > 0) continue;
      const flowering = center.region !== "highlands" && random() < 0.35;
      const count = CONFIG.minClusterSize + Math.floor(random() *
        (CONFIG.maxClusterSize - CONFIG.minClusterSize + 1));
      const positions = [];
      for (let index = 0; index < count && placed < limit; index++) {
        const angle = random() * Math.PI * 2;
        const radius = Math.sqrt(random()) * CONFIG.radius;
        const position = { x: anchor.x + Math.cos(angle) * radius, z: anchor.z + Math.sin(angle) * radius };
        if (!canPlace(position, 1) || getSnowMix(position.x, position.z) > 0 ||
          positions.some((point) => Math.hypot(point.x - position.x, point.z - position.z) < CONFIG.minSpacing)) continue;
        const height = getWorldHeight(position.x, position.z);
        // Wide details stay off steep slopes and cliff edges; retain terrain heights.
        if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) =>
          Math.abs(getWorldHeight(position.x + dx * CONFIG.footprint,
            position.z + dz * CONFIG.footprint) - height) > CONFIG.maxHeightDifference)) continue;
        const choice = random();
        const kind = choice < 0.6 ? (flowering && index % 2 === 0 ? "flowers" : "grassTufts")
          : choice < 0.78 ? "bushes" : choice < 0.9 && center.region !== "highlands" ? "flowers" : "stones";
        const [min, max] = CONFIG.scale[kind];
        if (place(kind, position, random, min + random() * (max - min))) {
          positions.push(position);
          placed++;
        }
      }
    }
  }
};
