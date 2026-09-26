import { Color3, MeshBuilder, StandardMaterial, TransformNode } from "@babylonjs/core";
import { createNameplate } from "../nameplate";

export const createDungeonPortal = ({ scene, x, z, title }) => {
  const root = new TransformNode("dungeonPortal", scene);
  root.position.set(x, 0, z);
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
  const nameplate = createNameplate({ scene, player: root, name: title, color: "#c4b5fd", y: 4.5 });
  return { root, nameplate };
};
