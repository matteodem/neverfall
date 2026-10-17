import { Vector3 } from "@babylonjs/core";
import { createEditorAssetCache } from "./loadEditorAsset";

const vector = ({ x, y, z }) => ({ x, y, z });

// Own the stable ID -> mesh mapping separately from Build Mode and authorization.
export const createWorldObjectScene = ({ scene, onRemove }) => {
  const objects = new Map();
  const meshes = new Map();
  let disposed = false, pickable = false;
  const assets = createEditorAssetCache(scene);
  const prepare = (assetId) => assets.get(assetId);
  const restore = (root) => {
    const object = objects.get(root.metadata.worldObjectId)?.object;
    if (!object) return;
    root.position.copyFromFloats(object.position.x, object.position.y, object.position.z);
    root.rotationQuaternion = null;
    root.rotation.copyFromFloats(object.rotation.x, object.rotation.y, object.rotation.z);
    root.scaling.copyFromFloats(object.scaling.x, object.scaling.y, object.scaling.z);
  };
  const upsert = (object) => {
    const asset = assets.getLoaded(object.assetId);
    if (disposed || !asset) return null;
    let entry = objects.get(object._id);
    if (entry && entry.object.assetId !== object.assetId) { remove(object._id); entry = null; }
    if (!entry) {
      const root = asset.place(Vector3.Zero());
      root.metadata = { worldObjectId: object._id, assetId: object.assetId };
      entry = { root, object };
      objects.set(object._id, entry);
      for (const mesh of root.getChildMeshes()) if (mesh.getTotalVertices()) {
        meshes.set(mesh, root);
        mesh.isPickable = pickable;
      }
    }
    entry.object = object;
    restore(entry.root);
    return entry.root;
  };
  const remove = (id) => {
    const entry = objects.get(id);
    if (!entry) return;
    onRemove(entry.root);
    for (const mesh of entry.root.getChildMeshes()) meshes.delete(mesh);
    entry.root.dispose();
    objects.delete(id);
  };
  return {
    prepare, upsert, remove, restore,
    has: (root) => objects.get(root.metadata?.worldObjectId)?.root === root,
    rootForMesh: (mesh) => meshes.get(mesh),
    setPickable(value) {
      pickable = value;
      for (const mesh of meshes.keys()) mesh.isPickable = value;
    },
    transform(root) {
      return {
        assetId: objects.get(root.metadata.worldObjectId).object.assetId,
        position: vector(root.position),
        rotation: vector(root.rotationQuaternion?.toEulerAngles() || root.rotation),
        scaling: vector(root.scaling),
      };
    },
    async reconcile(documents, isCurrent = () => true) {
      await Promise.all([...new Set(documents.map((object) => object.assetId))].map(prepare));
      if (disposed || !isCurrent()) return;
      const ids = new Set(documents.map((object) => object._id));
      for (const id of objects.keys()) if (!ids.has(id)) remove(id);
      for (const object of documents) upsert(object);
    },
    dispose() {
      disposed = true;
      for (const id of objects.keys()) remove(id);
      assets.dispose();
    },
  };
};
