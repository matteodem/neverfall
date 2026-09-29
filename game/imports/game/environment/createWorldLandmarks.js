import { Color3, MeshBuilder, StandardMaterial, TransformNode, VertexBuffer } from "@babylonjs/core";
import { FOREST_GIANT_HILL, SOUTHWEST_LAKE, getForestGiantHillHeight } from "../worldConfig";

const material = (scene, name, color) => {
  const result = new StandardMaterial(name, scene);
  result.diffuseColor = Color3.FromHexString(color);
  result.specularColor = Color3.Black();
  return result;
};

export const createGiantHill = (scene) => {
  const hill = MeshBuilder.CreateGround("forest-giant-hill", {
    width: FOREST_GIANT_HILL.radius * 2,
    height: FOREST_GIANT_HILL.radius * 2,
    subdivisions: 32,
    updatable: true,
  }, scene);
  const positions = hill.getVerticesData(VertexBuffer.PositionKind);
  for (let index = 0; index < positions.length; index += 3) {
    positions[index + 1] = getForestGiantHillHeight(
      FOREST_GIANT_HILL.center.x + positions[index],
      FOREST_GIANT_HILL.center.z + positions[index + 2]
    );
  }
  hill.updateVerticesData(VertexBuffer.PositionKind, positions);
  hill.convertToFlatShadedMesh();
  hill.refreshBoundingInfo();
  hill.position.set(FOREST_GIANT_HILL.center.x, 0, FOREST_GIANT_HILL.center.z);
  hill.material = material(scene, "forest-giant-hill-grass", "#557442");
  hill.receiveShadows = true;
  hill.isPickable = false;
  hill.checkCollisions = true;
  hill.freezeWorldMatrix();
  return hill;
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
