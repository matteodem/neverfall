import { SceneLoader, TransformNode, Vector3 } from "@babylonjs/core";
import { harmonizeEnvironmentMaterials } from "../environment/harmonizeEnvironmentMaterials";

export const EDITOR_FENCE_SCALE = 1.98;

// Use the same GLB/container instancing and material treatment as camp props.
export const loadEditorFence = async (scene) => {
  const container = await SceneLoader.LoadAssetContainerAsync("/models/environment/", "fence.glb", scene);
  if (scene.isDisposed) { container.dispose(); return null; }
  harmonizeEnvironmentMaterials(container.materials, "fence");
  const min = new Vector3(Infinity, Infinity, Infinity);
  const max = new Vector3(-Infinity, -Infinity, -Infinity);
  for (const mesh of container.meshes) {
    if (!mesh.getTotalVertices()) continue;
    mesh.computeWorldMatrix(true);
    const bounds = mesh.getBoundingInfo().boundingBox;
    min.minimizeInPlace(bounds.minimumWorld);
    max.maximizeInPlace(bounds.maximumWorld);
  }
  return {
    place(point) {
      const root = new TransformNode("editor-fence", scene);
      const model = new TransformNode("editor-fence-model", scene);
      model.parent = root;
      const entries = container.instantiateModelsToScene(undefined, false, { doNotInstantiate: false });
      for (const node of entries.rootNodes) node.parent = model;
      model.position.set(-(min.x + max.x) / 2, -min.y, -(min.z + max.z) / 2);
      root.position.copyFrom(point);
      root.scaling.setAll(EDITOR_FENCE_SCALE); // Same approximately 1.1m height as the authored camp fence.
      for (const mesh of root.getChildMeshes()) {
        mesh.isPickable = true;
        mesh.checkCollisions = false;
        mesh.receiveShadows = true;
        mesh.metadata = { ...mesh.metadata, worldShadows: { cast: false, receive: true } };
      }
      return root;
    },
    dispose: () => container.dispose(),
  };
};
