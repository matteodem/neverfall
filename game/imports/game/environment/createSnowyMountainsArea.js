import { Color3, MeshBuilder, StandardMaterial, TransformNode } from "@babylonjs/core";
import { getWorldHeight } from "../worldConfig";
import { WAYPOINTS } from "../waypoints";

export const createSnowyMountainsArea = ({ scene, chunk }) => {
  const root = new TransformNode("snowy-mountains-scenery", scene);
  root.position.set(chunk.x, 0, chunk.z);

  const material = (name, color) => {
    const result = new StandardMaterial(name, scene);
    result.diffuseColor = Color3.FromHexString(color);
    result.specularColor = Color3.Black();
    return result;
  };
  const rock = material("snowy-rock", "#687681");

  const waypoint = WAYPOINTS.find((point) => point.id === "snowy-mountains-waypoint");
  const markerX = waypoint.position.x - 3;
  const marker = new TransformNode("snowy-mountains-waypoint", scene);
  marker.parent = root;
  marker.position.set(markerX - chunk.x, getWorldHeight(markerX, waypoint.position.z), waypoint.position.z - chunk.z);
  const glow = material("snowy-waypoint-glow", "#8ED9F2");
  glow.emissiveColor = Color3.FromHexString("#3286A3");
  const markerParts = [
    { name: "snowy-waypoint-base", options: { diameter: 1.8, height: 0.25, tessellation: 8 }, y: 0.13, surface: rock },
    { name: "snowy-waypoint-pillar", options: { diameterTop: 0.35, diameterBottom: 0.65, height: 1.8, tessellation: 6 }, y: 1.1, surface: rock },
    { name: "snowy-waypoint-beacon", options: { diameterTop: 0, diameterBottom: 0.85, height: 1.1, tessellation: 6 }, y: 2.45, surface: glow },
  ];
  for (const { name, options, y, surface } of markerParts) {
    const mesh = MeshBuilder.CreateCylinder(name, options, scene);
    mesh.parent = marker;
    mesh.position.y = y;
    mesh.material = surface;
    mesh.isPickable = false;
    mesh.checkCollisions = false;
  }

  return root;
};
