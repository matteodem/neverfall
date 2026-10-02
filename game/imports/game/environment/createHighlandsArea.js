import { SceneLoader, TransformNode } from "@babylonjs/core";
import { createFrameBudget } from "./createFrameBudget";
import { randomForChunk } from "./createForestProps";
import { HIGHLANDS_SCENERY, getWorldHeight } from "../worldConfig";

const loadLookout = async (scene, root, chunk, { x, z }) => {
  let container;
  let disposed = false;
  scene.onDisposeObservable.addOnce(() => {
    disposed = true;
    container?.dispose();
  });
  try {
    container = await SceneLoader.LoadAssetContainerAsync(
      "/models/environment/", "highlands-lookout.glb", scene);
    if (disposed) { container.dispose(); return; }
    const model = new TransformNode("highlands-lookout", scene);
    const entries = container.instantiateModelsToScene(undefined, false, { doNotInstantiate: false });
    for (const node of entries.rootNodes) node.parent = model;
    let minX = Infinity; let maxX = -Infinity;
    let minY = Infinity; let minZ = Infinity; let maxZ = -Infinity;
    for (const mesh of model.getChildMeshes()) {
      if (!(mesh.getTotalVertices() || mesh.sourceMesh?.getTotalVertices())) continue;
      mesh.computeWorldMatrix(true);
      const bounds = mesh.getBoundingInfo().boundingBox;
      minX = Math.min(minX, bounds.minimumWorld.x);
      maxX = Math.max(maxX, bounds.maximumWorld.x);
      minY = Math.min(minY, bounds.minimumWorld.y);
      minZ = Math.min(minZ, bounds.minimumWorld.z);
      maxZ = Math.max(maxZ, bounds.maximumWorld.z);
      mesh.checkCollisions = true;
      mesh.isPickable = false;
      mesh.receiveShadows = true;
    }
    const scale = 5.5;
    model.scaling.setAll(scale);
    model.rotation.y = Math.PI;
    model.position.set(x - (minX + maxX) / 2 * scale,
      getWorldHeight(chunk.x + x, chunk.z + z) - minY * scale,
      z - (minZ + maxZ) / 2 * scale);
    model.parent = root;
  } catch (error) {
    console.warn("[Highlands] Could not load highlands-lookout.glb", error);
  }
};

export const createHighlandsArea = async ({ scene, chunk, props }) => {
  const root = new TransformNode(`highlands-scenery-${chunk.x}`, scene);
  root.position.set(chunk.x, 0, chunk.z);
  root.setEnabled(false);
  const random = randomForChunk(chunk);
  const yieldIfNeeded = createFrameBudget(scene);

  const place = (kind, x, z, scale, clearance = 2) => {
    if (!props?.canPlace({ x: chunk.x + x, z: chunk.z + z }, clearance)) return;
    props.placeAsset(root, kind, { x, z }, random, scale);
  };
  const placeLandmarkRock = (x, z, scale, kind = "landmarkRocks", height = 0) => {
    const prop = props?.placeAsset(root, kind, { x, z }, random, scale);
    if (prop) prop.position.y += height;
    for (const mesh of prop?.getChildMeshes() || []) mesh.checkCollisions = true;
  };

  if (props) {
    for (const center of HIGHLANDS_SCENERY.rockClusters) {
      const count = 2 + Math.floor(random() * 3);
      for (let index = 0; index < count; index++) {
        const angle = random() * Math.PI * 2;
        const distance = index ? 2 + random() * 4 : 0;
        const kind = index === 0 || random() < 0.4 ? "boulders" : "rocks";
        place(kind, center.x + Math.cos(angle) * distance, center.z + Math.sin(angle) * distance,
          0.85 + random() * 0.4, kind === "boulders" ? 3 : 2);
      }
      await yieldIfNeeded();
    }

    for (const center of HIGHLANDS_SCENERY.treeGroves) {
      const count = 2 + Math.floor(random() * 2);
      for (let index = 0; index < count; index++) {
        const angle = random() * Math.PI * 2;
        const distance = index ? 3 + random() * 5 : 0;
        const x = center.x + Math.cos(angle) * distance;
        const z = center.z + Math.sin(angle) * distance;
        const kind = chunk.z + z < 160 && random() < 0.3 ? "highlandBirch" : "highlandConifers";
        place(kind, x, z, 0.85 + random() * 0.3, 4);
      }
      if (random() < 0.45) place("scrub", center.x + 5, center.z - 4, 0.7 + random() * 0.2);
      await yieldIfNeeded();
    }

    for (const spot of HIGHLANDS_SCENERY.dryTreeSpots) {
      place("deadTrees", spot.x, spot.z, 0.9 + random() * 0.3, 4);
      place("accents", spot.x + 4, spot.z + 3, 0.8 + random() * 0.3);
      await yieldIfNeeded();
    }
  }

  const landmark = HIGHLANDS_SCENERY.landmarks[chunk.x];
  if (landmark?.type === "tower") await loadLookout(scene, root, chunk, landmark);
  else if (props && landmark?.type === "arch") {
    placeLandmarkRock(landmark.x - 4, landmark.z, 2.4);
    placeLandmarkRock(landmark.x + 4, landmark.z, 2.4);
    placeLandmarkRock(landmark.x, landmark.z, 2.4, "archLintel", 5.5);
  } else if (props && landmark?.type === "circle") {
    for (let index = 0; index < 7; index++) {
      const angle = index * Math.PI * 2 / 7;
      placeLandmarkRock(landmark.x + Math.cos(angle) * 9,
        landmark.z + Math.sin(angle) * 9, 1.5);
    }
  }

  const meshes = root.getChildMeshes();
  for (let index = 0; index < meshes.length; index++) {
    meshes[index].freezeWorldMatrix();
    if (index % 32 === 31) await yieldIfNeeded();
  }
  return root;
};
