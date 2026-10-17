import { SceneLoader, TransformNode, Vector3 } from "@babylonjs/core";
import { harmonizeEnvironmentMaterials } from "../environment/harmonizeEnvironmentMaterials";
import { getWorldEditorAsset } from "./worldEditorAssets";
import "@babylonjs/loaders/glTF";

// Share GLB bytes across the game and preview engines, including in-flight fetches.
const files = new Map();
const assetData = (path) => {
  if (!files.has(path)) files.set(path, fetch(path).then(async (response) => {
    if (!response.ok) throw new Error(`Could not load ${path}`);
    return new Uint8Array(await response.arrayBuffer());
  }).catch((error) => { files.delete(path); throw error; }));
  return files.get(path);
};

// Use the same GLB/container instancing and material treatment as camp props.
const loadEditorAsset = async (scene, assetId) => {
  const asset = getWorldEditorAsset(assetId);
  if (!asset) throw new Error("Unknown editor asset");
  const data = await assetData(asset.path);
  if (scene.isDisposed) return null;
  const directory = asset.path.slice(0, asset.path.lastIndexOf("/") + 1);
  const container = await SceneLoader.LoadAssetContainerAsync(directory, data, scene, undefined, ".glb");
  if (scene.isDisposed) { container.dispose(); return null; }
  harmonizeEnvironmentMaterials(container.materials, asset.path.split("/").pop().replace(/\.glb$/i, ""));
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
      const root = new TransformNode(`editor-${assetId}`, scene);
      const model = new TransformNode(`editor-${assetId}-model`, scene);
      model.parent = root;
      const entries = container.instantiateModelsToScene(undefined, false, { doNotInstantiate: false });
      for (const node of entries.rootNodes) node.parent = model;
      model.position.set(-(min.x + max.x) / 2, -min.y, -(min.z + max.z) / 2);
      root.position.copyFrom(point);
      root.scaling.setAll(asset.scale ?? 1);
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

// GPU resources stay scene-local; reuse containers when switching preview assets.
export const createEditorAssetCache = (scene) => {
  const pending = new Map(), loaded = new Map();
  let disposed = false;
  return {
    get(assetId) {
      if (disposed) return Promise.resolve(null);
      if (!pending.has(assetId)) pending.set(assetId, loadEditorAsset(scene, assetId).then((asset) => {
        if (disposed) { asset?.dispose(); return null; }
        if (asset) loaded.set(assetId, asset);
        return asset;
      }).catch((error) => { pending.delete(assetId); throw error; }));
      return pending.get(assetId);
    },
    getLoaded: (assetId) => loaded.get(assetId),
    dispose() {
      disposed = true;
      for (const asset of loaded.values()) asset.dispose();
      loaded.clear();
      pending.clear();
    },
  };
};
