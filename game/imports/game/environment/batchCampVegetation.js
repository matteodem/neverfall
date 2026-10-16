import { Quaternion } from "@babylonjs/core";

// Keep the existing asset placement transforms, but render static camp detail in shared batches.
export const batchCampVegetation = (root) => {
  const props = root.getChildren().filter((node) => node.metadata?.centralCampVegetation);
  const groups = new Map();
  for (const prop of props) {
    for (const mesh of prop.getChildMeshes()) {
      if (!mesh.sourceMesh) continue;
      const source = mesh.sourceMesh;
      if (!groups.has(source)) groups.set(source, []);
      groups.get(source).push(...mesh.computeWorldMatrix(true).asArray());
    }
  }
  for (const [source, matrices] of groups) {
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
    batch.thinInstanceSetBuffer("matrix", new Float32Array(matrices), 16, true);
    batch.thinInstanceRefreshBoundingInfo(true);
  }
  for (const prop of props) prop.dispose();
};
