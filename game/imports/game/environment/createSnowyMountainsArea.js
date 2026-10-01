import { Color3, MeshBuilder, StandardMaterial, TransformNode } from "@babylonjs/core";
import { getWorldHeight } from "../worldConfig";
import { WAYPOINTS } from "../waypoints";

const FORMATIONS = [
  { x: 188, z: -76, width: 5, height: 9 },
  { x: 211, z: -65, width: 7, height: 14 },
  { x: 246, z: -74, width: 5, height: 11 },
  { x: 277, z: -72, width: 8, height: 17 },
  { x: 195, z: 73, width: 6, height: 11 },
  { x: 225, z: 65, width: 8, height: 16 },
  { x: 257, z: 72, width: 5, height: 12 },
  { x: 283, z: 57, width: 7, height: 18 },
  { x: 212, z: -25, width: 4, height: 7 },
  { x: 215, z: 25, width: 5, height: 9 },
  { x: 263, z: -28, width: 7, height: 16 },
  { x: 263, z: 28, width: 7, height: 16 },
  { x: 286, z: 0, width: 8, height: 20 },
];

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
  const snow = material("snowy-cap", "#E4EFF1");
  const sources = new Map();
  const place = (name, x, z, width, height, surface, y = 0) => {
    const source = sources.get(name);
    const mesh = source ? source.createInstance(name) : MeshBuilder.CreateCylinder(name, {
      height: 1, diameterTop: 0.18, diameterBottom: 1, tessellation: 5,
    }, scene);
    if (!source) {
      mesh.convertToFlatShadedMesh();
      mesh.material = surface;
      sources.set(name, mesh);
    }
    mesh.parent = root;
    mesh.position.set(x - chunk.x, getWorldHeight(x, z) + y + height / 2, z - chunk.z);
    mesh.scaling.set(width, height, width);
    mesh.rotation.y = x * 0.17 + z * 0.09;
    mesh.isPickable = false;
    mesh.checkCollisions = false;
  };

  for (const { x, z, width, height } of FORMATIONS) {
    place("snowy-rock-spire", x, z, width, height, rock);
    place("snowy-spire-cap", x, z, width * 0.44, height * 0.3, snow, height * 0.7);
  }

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
