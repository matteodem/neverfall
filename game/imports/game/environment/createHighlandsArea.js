import { Color3, MeshBuilder, SceneLoader, StandardMaterial, TransformNode } from "@babylonjs/core";
import { createFrameBudget } from "./createFrameBudget";
import { HIGHLANDS_SCENERY, getWorldHeight } from "../worldConfig";

export const createHighlandsArea = async ({ scene, chunk }) => {
  const root = new TransformNode(`highlands-scenery-${chunk.x}`, scene);
  root.position.set(chunk.x, 0, chunk.z);
  root.setEnabled(false);
  const yieldIfNeeded = createFrameBudget(scene);

  const material = (name, color) => {
    const key = `highlands-${name}`;
    const existing = scene.getMaterialByName(key);
    if (existing) return existing;
    const result = new StandardMaterial(key, scene);
    result.diffuseColor = Color3.FromHexString(color);
    result.specularColor = Color3.Black();
    return result;
  };
  const stone = material("stone", "#858D91");
  const darkStone = material("dark-stone", "#59646B");
  const moss = material("moss", "#647653");

  const place = (mesh, x, y, z, surface = stone, rotation = 0) => {
    mesh.parent = root;
    mesh.position.set(x, y + getWorldHeight(chunk.x + x, chunk.z + z), z);
    mesh.rotation.y = rotation;
    mesh.material = surface;
    mesh.receiveShadows = true;
    mesh.isPickable = false;
    return mesh;
  };
  const blockSources = new Map();
  const block = (name, x, y, z, width, height, depth, surface = stone, rotation = 0) => {
    const key = `${width},${height},${depth},${surface.name}`;
    const source = blockSources.get(key);
    const mesh = source ? source.createInstance(name) : MeshBuilder.CreateBox(name, { width, height, depth }, scene);
    if (!source) blockSources.set(key, mesh);
    mesh.checkCollisions = true;
    return place(mesh, x, y, z, surface, rotation);
  };

  const rock = (x, y, z, size, surface = stone) => {
    const mesh = MeshBuilder.CreatePolyhedron("highlands-rock", { type: 1, size }, scene);
    mesh.convertToFlatShadedMesh();
    return place(mesh, x, y, z, surface, x * 0.3 + z * 0.2);
  };

  for (const { x, z, height } of HIGHLANDS_SCENERY.spires) {
    const mesh = MeshBuilder.CreateCylinder("highlands-spire", {
      height, diameterTop: 1.2, diameterBottom: height * 0.55, tessellation: 5,
    }, scene);
    mesh.convertToFlatShadedMesh();
    place(mesh, x, height / 2, z, darkStone, x * 0.1);
    rock(x + 4, 1, z - 3, 2.3, moss);
    rock(x - 3, 0.6, z + 4, 1.6);
    await yieldIfNeeded();
  }

  for (const { x, z } of HIGHLANDS_SCENERY.cairns) {
    for (let layer = 0; layer < 4; layer++) {
      const mesh = rock(x, 0.4 + layer * 0.65, z, 1.1 - layer * 0.18, layer === 0 ? moss : stone);
      mesh.scaling.y = 0.55;
    }
    await yieldIfNeeded();
  }

  for (const { x, z } of HIGHLANDS_SCENERY.boulderClusters) {
    rock(x, 1.6, z, 3.4, darkStone).scaling.y = 0.8;
    for (let index = 0; index < 5; index++) {
      const angle = index * Math.PI * 2 / 5;
      const size = 1.2 + (index % 3) * 0.5;
      rock(x + Math.cos(angle) * 5, size * 0.55, z + Math.sin(angle) * 4,
        size, index % 2 ? moss : stone).scaling.y = 0.65;
    }
    await yieldIfNeeded();
  }

  for (const { x, z, rotation } of HIGHLANDS_SCENERY.ruinedWalls) {
    for (let index = 0; index < 5; index++) {
      const offset = (index - 2) * 1.9;
      const height = index % 2 ? 2 : 3;
      for (let layer = 0; layer < height; layer++) {
        block("ruined-wall", x + Math.cos(rotation) * offset, 0.55 + layer * 1.1,
          z + Math.sin(rotation) * offset, 1.8, 1, 1.2,
          layer === 0 ? moss : stone, -rotation);
      }
    }
    rock(x + 3, 0.5, z + 3, 1.2);
    await yieldIfNeeded();
  }

  const landmark = HIGHLANDS_SCENERY.landmarks[chunk.x];
  if (landmark) {
    const { x, z, type } = landmark;
    if (type === "arch") {
      // A weathered gateway with a broken lintel and fallen masonry.
      for (const side of [-1, 1]) {
        for (let layer = 0; layer < 5; layer++) {
          block("arch-pillar", x + side * 4, 0.7 + layer * 1.4, z, 2.2, 1.3, 2.4,
            layer === 0 ? moss : stone, side * layer * 0.025);
        }
        block("arch-lintel", x + side * 2.7, 7.4, z, 3.8, 1.2, 2.5, darkStone, side * 0.08);
      }
      rock(x - 1, 0.7, z + 4, 1.4);
      block("fallen-arch-stone", x + 5, 0.65, z + 5, 2.6, 1.3, 1.8, stone, 0.5);
    } else if (type === "tower") {
      let container;
      let disposed = false;
      scene.onDisposeObservable.addOnce(() => {
        disposed = true;
        container?.dispose();
      });
      try {
        container = await SceneLoader.LoadAssetContainerAsync(
          "/models/environment/", "highlands-lookout.glb", scene);
        if (disposed) container.dispose();
        else {
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
        }
      } catch (error) {
        console.warn("[Highlands] Could not load highlands-lookout.glb", error);
      }
    } else if (type === "circle") {
      for (let index = 0; index < 7; index++) {
        const angle = index * Math.PI * 2 / 7;
        const height = index % 2 ? 3.5 : 5;
        block("standing-stone", x + Math.cos(angle) * 9, height / 2, z + Math.sin(angle) * 9,
          1.4, height, 2, index % 2 ? stone : moss, angle + 0.1);
      }
      rock(x, 0.7, z, 2.1, darkStone).scaling.y = 0.5;
    }
  }

  const meshes = root.getChildMeshes();
  for (let index = 0; index < meshes.length; index++) {
    meshes[index].freezeWorldMatrix();
    if (index % 32 === 31) await yieldIfNeeded();
  }
  return root;
};
