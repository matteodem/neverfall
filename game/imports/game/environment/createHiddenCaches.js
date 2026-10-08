import { HIDDEN_CACHES } from "../hiddenCaches";
import { createTreasureChest } from "./createTreasureChest";

export const createHiddenCaches = ({ scene, chunks }) => {
  const chests = HIDDEN_CACHES.map((cache) => {
    const chest = createTreasureChest(scene, cache.id);
    // Fits the approved <= 1 m footprint; no collision obstacle in the world.
    chest.root.scaling.setAll(0.6);
    chest.root.position.set(cache.position.x, cache.position.y, cache.position.z);
    chunks.add(chest.root, cache.position);
    return { ...chest, id: cache.id, looted: false };
  });
  return {
    update(lootedCacheIds = []) {
      for (const chest of chests) {
        const looted = lootedCacheIds.includes(chest.id);
        if (looted === chest.looted) continue;
        chest.looted = looted;
        chest.setLooted(looted);
      }
    },
    destroy() {
      for (const chest of chests) chest.root.dispose(false, true);
    },
  };
};
