import { Color3, MeshBuilder, StandardMaterial, TransformNode } from "@babylonjs/core";
import { SOUTHWEST_LAKE } from "../worldConfig";

const material = (scene, name, color) => {
  const result = new StandardMaterial(name, scene);
  result.diffuseColor = Color3.FromHexString(color);
  result.specularColor = Color3.Black();
  return result;
};

export const createSouthwestLake = (scene) => {
  const root = new TransformNode("southwest-lake", scene);
  root.position.set(SOUTHWEST_LAKE.center.x, 0, SOUTHWEST_LAKE.center.z);

  const shore = MeshBuilder.CreateCylinder("lake-shore", {
    diameter: SOUTHWEST_LAKE.radius * 2 + 4, height: 0.05, tessellation: 32,
  }, scene);
  shore.parent = root;
  shore.position.y = 0.04;
  shore.material = material(scene, "lake-shore-earth", "#8C7954");

  const water = MeshBuilder.CreateCylinder("lake-water", {
    diameter: SOUTHWEST_LAKE.radius * 2, height: 0.04, tessellation: 32,
  }, scene);
  water.parent = root;
  water.position.y = 0.07;
  water.material = material(scene, "lake-water-blue", "#4D8EA1");
  water.material.specularColor = Color3.FromHexString("#8FC5D1");
  for (const mesh of root.getChildMeshes()) {
    mesh.isPickable = false;
    mesh.freezeWorldMatrix();
  }
  return root;
};
