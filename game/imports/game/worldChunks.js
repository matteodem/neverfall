import { ENTITY_VISIBILITY } from "./entityVisibility";
import { areNearbyChunks, getChunkCoordinates } from "./worldConfig";

const PRELOAD_DISTANCE = 190;
const DESTINATION_DISTANCE = 240;

// Only visual nodes are registered; shared world state is never deactivated.
export const createWorldChunks = (scene, player) => {
  const chunks = new Map();
  const loaders = [];
  let elapsed = 0;
  let previousChunk = "";
  let started = false;

  const nearbyLoaders = (position, radius) => {
    const current = getChunkCoordinates(position);
    return loaders.filter(({ position: target }) => {
      const chunk = getChunkCoordinates(target);
      return Math.abs(chunk.x - current.x) <= radius && Math.abs(chunk.z - current.z) <= radius;
    });
  };
  const destinationLoaders = (position) => nearbyLoaders(position, 1).filter((entry) =>
    Math.hypot(entry.position.x - position.x, entry.position.z - position.z) <= entry.destinationDistance);

  const update = () => {
    const current = getChunkCoordinates(player.position);
    const key = `${current.x},${current.z}`;
    if (key !== previousChunk) {
      previousChunk = key;
      for (const chunk of chunks.values()) {
        const enabled = areNearbyChunks(chunk.position, player.position);
        for (const node of chunk.nodes) node.setEnabled(enabled);
      }
    }
    if (started) {
      if (loaders.some((entry) => entry.promise && !entry.ready && !entry.failed)) return;
      const next = nearbyLoaders(player.position, 1)
        .filter((entry) => !entry.promise && !entry.failed &&
          Math.hypot(entry.position.x - player.position.x,
            entry.position.z - player.position.z) <= PRELOAD_DISTANCE)
        .sort((a, b) => Math.hypot(a.position.x - player.position.x, a.position.z - player.position.z) -
          Math.hypot(b.position.x - player.position.x, b.position.z - player.position.z))[0];
      if (next) void next.load().catch((error) => console.warn("[World] Could not load nearby chunk", error));
    }
  };

  const observer = scene.onBeforeRenderObservable.add(() => {
    elapsed += scene.getEngine().getDeltaTime();
    if (elapsed < ENTITY_VISIBILITY.updateInterval) return;
    elapsed %= ENTITY_VISIBILITY.updateInterval;
    update();
  });
  scene.onDisposeObservable.addOnce(() => scene.onBeforeRenderObservable.remove(observer));

  return {
    add(node, position) {
      const coordinates = getChunkCoordinates(position);
      const key = `${coordinates.x},${coordinates.z}`;
      if (!chunks.has(key)) chunks.set(key, { position: { x: position.x, z: position.z }, nodes: [] });
      chunks.get(key).nodes.push(node);
      node.setEnabled(areNearbyChunks(position, player.position));
      previousChunk = "";
    },
    addLoader(position, loader, destinationDistance = DESTINATION_DISTANCE, initial = true) {
      const entry = { position, destinationDistance, initial, promise: null, ready: false, failed: false };
      entry.load = (retry = false) => {
        if (!entry.promise || (retry && entry.failed)) {
          entry.failed = false;
          entry.promise = Promise.resolve().then(loader).then(() => {
            entry.ready = true;
            previousChunk = "";
          }).catch((error) => {
            entry.failed = true;
            throw error;
          });
        }
        return entry.promise;
      };
      loaders.push(entry);
    },
    loadAt: (position) => Promise.all(nearbyLoaders(position, 0)
      .filter((entry) => entry.initial).map((entry) => entry.load())),
    preloadAt: async (position) => {
      for (const entry of destinationLoaders(position)
        .sort((a, b) => Math.hypot(a.position.x - position.x, a.position.z - position.z) -
          Math.hypot(b.position.x - position.x, b.position.z - position.z)))
        await entry.load(true);
    },
    isChunkReadyAt: (position) => nearbyLoaders(position, 0)
      .filter((entry) => entry.initial).every((entry) => entry.ready),
    isReadyAt: (position) => destinationLoaders(position).every((entry) => entry.ready),
    start() {
      started = true;
      update();
    },
    update,
  };
};
