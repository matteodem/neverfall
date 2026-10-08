import { Color3, MeshBuilder, StandardMaterial, TransformNode } from "@babylonjs/core";

// Shared with the existing tower chest; the root's origin is its bottom center.
export const createTreasureChest = (scene, name, { collisions = false } = {}) => {
  const root = new TransformNode(name, scene);
  const material = new StandardMaterial(`${name}Gold`, scene);
  material.diffuseColor = Color3.FromHexString("#b88b32");
  material.emissiveColor = Color3.FromHexString("#3e2c0a");
  const chest = MeshBuilder.CreateBox(`${name}Body`, { width: 1.5, height: 0.9, depth: 1.1 }, scene);
  chest.parent = root;
  chest.position.y = 0.45;
  chest.material = material;
  chest.checkCollisions = collisions;
  chest.isPickable = false;
  const clasp = MeshBuilder.CreateBox(`${name}Clasp`, { width: 0.2, height: 0.24, depth: 0.06 }, scene);
  clasp.parent = root;
  clasp.position.set(0, 0.45, 0.57);
  clasp.material = new StandardMaterial(`${name}ClaspMaterial`, scene);
  clasp.material.diffuseColor = Color3.FromHexString("#3e2c0a");
  clasp.isPickable = false;
  return {
    root,
    setLooted(looted) {
      material.diffuseColor = Color3.FromHexString(looted ? "#655b48" : "#b88b32");
      material.emissiveColor = Color3.FromHexString(looted ? "#000000" : "#3e2c0a");
      clasp.setEnabled(!looted);
    },
  };
};
