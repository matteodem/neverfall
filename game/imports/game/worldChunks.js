import { ENTITY_VISIBILITY } from "./entityVisibility";
import { areNearbyChunks, getChunkCoordinates } from "./worldConfig";

// Only visual nodes are registered; shared world state is never deactivated.
export const createWorldChunks = (scene, player) => {
  const chunks = new Map();
  let elapsed = 0;
  let previousChunk = "";

  const update = () => {
    const current = getChunkCoordinates(player.position);
    const key = `${current.x},${current.z}`;
    if (key === previousChunk) return;
    previousChunk = key;
    for (const chunk of chunks.values()) {
      const enabled = areNearbyChunks(chunk.position, player.position);
      for (const node of chunk.nodes) node.setEnabled(enabled);
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
      previousChunk = "";
    },
    update,
  };
};
