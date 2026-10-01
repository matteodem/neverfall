import { Color3, MeshBuilder, StandardMaterial, TransformNode } from "@babylonjs/core";
import { SOUTHWEST_LAKE, getWorldHeight } from "../worldConfig";
import { WAYPOINTS } from "../waypoints";

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

  const waypoint = WAYPOINTS.find((point) => point.id === "lake-waypoint");
  const markerX = waypoint.position.x - 3;
  const marker = new TransformNode("lake-waypoint", scene);
  marker.parent = root;
  marker.position.set(
    markerX - SOUTHWEST_LAKE.center.x,
    getWorldHeight(markerX, waypoint.position.z),
    waypoint.position.z - SOUTHWEST_LAKE.center.z
  );
  const stone = material(scene, "lake-waypoint-stone", "#66746C");
  const glow = material(scene, "lake-waypoint-glow", "#5AB7D5");
  glow.emissiveColor = Color3.FromHexString("#317F9B");
  const base = MeshBuilder.CreateCylinder("lake-waypoint-base", { diameter: 1.8, height: 0.25, tessellation: 8 }, scene);
  base.parent = marker;
  base.position.y = 0.13;
  base.material = stone;
  const pillar = MeshBuilder.CreateCylinder("lake-waypoint-pillar", { diameterTop: 0.35, diameterBottom: 0.65, height: 1.8, tessellation: 6 }, scene);
  pillar.parent = marker;
  pillar.position.y = 1.1;
  pillar.material = stone;
  const beacon = MeshBuilder.CreateCylinder("lake-waypoint-beacon", { diameterTop: 0, diameterBottom: 0.85, height: 1.1, tessellation: 6 }, scene);
  beacon.parent = marker;
  beacon.position.y = 2.45;
  beacon.material = glow;
  for (const mesh of root.getChildMeshes()) {
    mesh.isPickable = false;
    mesh.freezeWorldMatrix();
  }
  return root;
};
