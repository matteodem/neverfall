import { TransformNode } from "@babylonjs/core";
import { CHUNK_SIZE, getChunkCoordinates, getWorldHeight } from "../worldConfig";
import { randomForChunk } from "./createForestProps";
import { PROP_CLUSTERS, PROP_CLUSTER_STYLES } from "./environmentPolishConfig";
import { createEnvironmentPaths } from "./createEnvironmentPaths";
import { createPathEdgeDetails } from "./createPathEdgeDetails";
import { createBridgeBanks } from "./createBridgeBanks";

// Paths and reused prop instances follow the existing chunk visibility lifecycle.
export const createEnvironmentPolish = ({ scene, chunk, ground, props, density }) => {
  const root = new TransformNode(`environment-polish-${chunk.x}-${chunk.z}`, scene);
  root.setEnabled(false);
  const belongs = (point) => {
    const cell = getChunkCoordinates(point);
    return cell.x === chunk.x / CHUNK_SIZE && cell.z === chunk.z / CHUNK_SIZE;
  };
  const paths = createEnvironmentPaths({ scene, chunk, ground, belongs });
  if (paths) paths.parent = root;
  createPathEdgeDetails({ scene, root, ground, props, belongs, density });
  if (chunk.x === 0 && chunk.z === 0) createBridgeBanks({ scene, root, ground, props, density });

  if (props.available) {
    for (const cluster of PROP_CLUSTERS.filter(belongs)) {
      const random = randomForChunk(cluster);
      const composition = PROP_CLUSTER_STYLES[cluster.style];
      const count = Math.max(2, Math.ceil(composition.length * density));
      for (const item of composition.slice(0, count)) {
        const position = { x: cluster.x + item.x, z: cluster.z + item.z };
        if (!props.canPlaceDetail(position, 1.5)) continue;
        const prop = props.placeAsset(root, item.kind, position, random, item.scale);
        if (!prop) continue;
        // Match the rendered terrain (including riverbank patches), preserving asset origin.
        prop.position.y += ground.getHeightAtCoordinates(position.x, position.z) -
          getWorldHeight(position.x, position.z);
        prop.metadata = { clusterId: cluster.id };
        for (const mesh of prop.getChildMeshes()) {
          mesh.metadata = { ...mesh.metadata, worldShadows: { cast: false, receive: true } };
        }
      }
    }
  }
  for (const mesh of root.getChildMeshes()) mesh.freezeWorldMatrix();
  return root;
};
