import { Quaternion } from "@babylonjs/core";
import { getTerrainVegetation } from "./terrainVegetation";

// Keep the existing asset placement transforms, but render static camp detail in shared batches.
export const batchCampVegetation = (root) => {
  const props = root.getChildren().filter((node) => node.metadata?.centralCampVegetation);
  const groups = new Map();
  for (const prop of props) {
    prop.computeWorldMatrix(true);
    const position = prop.getAbsolutePosition().clone();
    for (const mesh of prop.getChildMeshes()) {
      if (!mesh.sourceMesh) continue;
      const source = mesh.sourceMesh;
      if (!groups.has(source)) groups.set(source, { matrices: [], plants: [] });
      const group = groups.get(source);
      if (prop.metadata.terrainVegetation) group.plants.push({ position, offset: group.matrices.length });
      group.matrices.push(...mesh.computeWorldMatrix(true).asArray());
    }
  }
  for (const [source, { matrices, plants }] of groups) {
    const batch = source.clone(`central-camp-${source.name}`, root, true);
    batch.unfreezeWorldMatrix();
    batch.position.setAll(0);
    batch.scaling.setAll(1);
    batch.rotation.setAll(0);
    batch.rotationQuaternion = Quaternion.Identity();
    batch.setEnabled(true);
    batch.isVisible = true;
    batch.isPickable = false;
    batch.checkCollisions = false;
    batch.receiveShadows = true;
    batch.metadata = { worldShadows: { cast: false, receive: true } };
    const original = new Float32Array(matrices), buffer = new Float32Array(original);
    batch.thinInstanceSetBuffer("matrix", buffer, 16, !plants.length);
    batch.thinInstanceRefreshBoundingInfo(true);
    const flush = () => { if (!batch.isDisposed()) batch.thinInstanceBufferUpdated("matrix"); };
    for (const { position, offset } of plants) getTerrainVegetation(root.getScene())?.register(batch, position, (visible) => {
      if (visible) buffer.set(original.subarray(offset, offset + 16), offset);
      else {
        buffer.fill(0, offset, offset + 16);
        buffer[offset + 15] = 1;
      }
    }, flush);
  }
  for (const prop of props) prop.dispose();
};
