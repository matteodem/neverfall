import { CHUNK_SIZE, WORLD_CHUNKS, getChunkCoordinates } from "./worldConfig";

const REGION_NAMES = {
  starterForest: "Forest",
  forest: "Forest",
  highlands: "Highlands",
  snowyMountains: "Snowy Mountains",
};
const BORDER_BUFFER = 6;
const SETTLE_TIME = 700;
const NOTICE_DURATION = 2500;

// Use the same authored chunks and coordinates as world streaming.
const getZoneName = (position) => {
  const coordinates = getChunkCoordinates(position);
  const chunk = WORLD_CHUNKS.find(({ x, z }) =>
    x === coordinates.x * CHUNK_SIZE && z === coordinates.z * CHUNK_SIZE);
  return REGION_NAMES[chunk?.region] || null;
};

export const createZoneEntryFeedback = (showNotice) => {
  let current = null;
  let pending = null;
  let elapsed = 0;

  const reset = (position) => {
    current = getZoneName(position);
    pending = null;
    elapsed = 0;
  };

  return {
    reset,
    update(position, deltaTime = 0, immediate = false) {
      const next = getZoneName(position);
      if (!current) {
        reset(position);
        return;
      }
      // Walking must settle inside the destination, beyond the border buffer.
      const inside = immediate || [-BORDER_BUFFER, BORDER_BUFFER].every((dx) =>
        [-BORDER_BUFFER, BORDER_BUFFER].every((dz) =>
          getZoneName({ x: position.x + dx, z: position.z + dz }) === next));
      if (!next || next === current || !inside) {
        pending = null;
        elapsed = 0;
        return;
      }
      if (pending !== next) {
        pending = next;
        elapsed = 0;
      }
      elapsed += deltaTime;
      if (!immediate && elapsed < SETTLE_TIME) return;
      reset(position);
      showNotice(`Entered · ${next}`, NOTICE_DURATION);
    },
  };
};
