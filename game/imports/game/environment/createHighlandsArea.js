import { Color3, MeshBuilder, StandardMaterial, TransformNode } from "@babylonjs/core";
import { HIGHLANDS_SCENERY } from "../worldConfig";

export const createHighlandsArea = ({ scene, chunk }) => {
  const root = new TransformNode(`highlands-scenery-${chunk.x}`, scene);
  root.position.set(chunk.x, 0, chunk.z);

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
  const wood = material("wood", "#70503B");

  const place = (mesh, x, y, z, surface = stone, rotation = 0) => {
    mesh.parent = root;
    mesh.position.set(x, y, z);
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
  }

  for (const { x, z } of HIGHLANDS_SCENERY.cairns) {
    for (let layer = 0; layer < 4; layer++) {
      const mesh = rock(x, 0.4 + layer * 0.65, z, 1.1 - layer * 0.18, layer === 0 ? moss : stone);
      mesh.scaling.y = 0.55;
    }
  }

  for (const { x, z } of HIGHLANDS_SCENERY.boulderClusters) {
    rock(x, 1.6, z, 3.4, darkStone).scaling.y = 0.8;
    for (let index = 0; index < 5; index++) {
      const angle = index * Math.PI * 2 / 5;
      const size = 1.2 + (index % 3) * 0.5;
      rock(x + Math.cos(angle) * 5, size * 0.55, z + Math.sin(angle) * 4,
        size, index % 2 ? moss : stone).scaling.y = 0.65;
    }
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
      // Open doorway faces south; the top has uneven, broken battlements.
      for (let layer = 0; layer < 5; layer++) {
        for (let index = -2; index <= 2; index++) {
          block("tower-back", x + index * 1.9, 0.8 + layer * 1.6, z + 4.5,
            1.8, 1.5, 1.4, layer === 0 ? moss : stone);
          if (Math.abs(index) > 0 && layer < 3) {
            block("tower-front", x + index * 1.9, 0.8 + layer * 1.6, z - 4.5,
              1.8, 1.5, 1.4, stone);
          }
          if (index === -2 || index === 0 || index === 2) {
            for (const side of [-1, 1]) {
              block("tower-side", x + side * 4.5, 0.8 + layer * 1.6, z + index * 1.7,
                1.4, 1.5, 3.2, layer === 0 ? moss : stone);
            }
          }
        }
      }
      for (const offset of [-3.8, 0, 3.8]) {
        block("tower-battlement", x + offset, 8.4, z + 4.5, 1.5, 1.4, 1.4, darkStone);
      }
      block("fallen-tower-beam", x - 7, 0.35, z - 3, 6, 0.5, 0.6, wood, 0.6);
      for (let index = 0; index < 6; index++) {
        rock(x + 7 + index % 3 * 2, 0.5, z - 5 + Math.floor(index / 3) * 3, 1.1);
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

  for (const mesh of root.getChildMeshes()) mesh.freezeWorldMatrix();
  return root;
};
