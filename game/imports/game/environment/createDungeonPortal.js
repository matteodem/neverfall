import { Color3, MeshBuilder, SceneLoader, StandardMaterial, TransformNode } from "@babylonjs/core";
import { createNameplate } from "../nameplate";
import { getWorldHeight } from "../worldConfig";

const ENTRANCE_SCALE = 3;

export const loadDungeonEntranceAsset = async (scene) => {
  let container;
  let disposed = false;
  scene.onDisposeObservable.addOnce(() => {
    disposed = true;
    container?.dispose();
  });
  try {
    container = await SceneLoader.LoadAssetContainerAsync("/models/dungeons/", "entrance.glb", scene);
    if (disposed) { container.dispose(); return null; }
    return container;
  } catch (error) {
    console.warn("[Dungeon] Could not load entrance.glb", error);
    throw error;
  }
};

export const createDungeonPortal = ({ scene, x, z, title, entranceAsset = null }) => {
  const root = new TransformNode("dungeonPortal", scene);
  root.position.set(x, entranceAsset ? getWorldHeight(x, z) : 0, z);
  let nameplateY = 4.5;

  if (entranceAsset) {
    const model = new TransformNode("dungeonEntranceModel", scene);
    model.parent = root;
    const entries = entranceAsset.instantiateModelsToScene(undefined, false, { doNotInstantiate: false });
    for (const node of entries.rootNodes) node.parent = model;

    let minX = Infinity; let maxX = -Infinity;
    let minY = Infinity; let maxY = -Infinity;
    let minZ = Infinity; let maxZ = -Infinity;
    for (const mesh of model.getChildMeshes()) {
      if (!(mesh.getTotalVertices() || mesh.sourceMesh?.getTotalVertices())) continue;
      mesh.computeWorldMatrix(true);
      const bounds = mesh.getBoundingInfo().boundingBox;
      minX = Math.min(minX, bounds.minimumWorld.x - x);
      maxX = Math.max(maxX, bounds.maximumWorld.x - x);
      minY = Math.min(minY, bounds.minimumWorld.y - root.position.y);
      maxY = Math.max(maxY, bounds.maximumWorld.y - root.position.y);
      minZ = Math.min(minZ, bounds.minimumWorld.z - z);
      maxZ = Math.max(maxZ, bounds.maximumWorld.z - z);
      mesh.isPickable = false;
      mesh.checkCollisions = true;
      mesh.receiveShadows = true;
    }
    if (Number.isFinite(minY)) {
      model.scaling.setAll(ENTRANCE_SCALE);
      model.position.set(-(minX + maxX) / 2 * ENTRANCE_SCALE,
        -minY * ENTRANCE_SCALE, -(minZ + maxZ) / 2 * ENTRANCE_SCALE);
      nameplateY = Math.max(nameplateY, (maxY - minY) * ENTRANCE_SCALE + 0.5);
    }
  } else {
    const material = new StandardMaterial("portalMaterial", scene);
    material.diffuseColor = Color3.FromHexString("#7661b8");
    material.emissiveColor = Color3.FromHexString("#6943b5");
    const ring = MeshBuilder.CreateTorus("portalRing", { diameter: 4, thickness: 0.45, tessellation: 24 }, scene);
    ring.parent = root;
    ring.position.y = 2;
    ring.rotation.x = Math.PI / 2;
    ring.material = material;
    ring.isPickable = false;
    ring.freezeWorldMatrix();
  }

  const nameplate = createNameplate({ scene, player: root, name: title, color: "#c4b5fd", y: nameplateY });
  return { root, nameplate };
};
