import { Color3, MeshBuilder, StandardMaterial, TransformNode } from "@babylonjs/core";
import { DUNGEON } from "../dungeonConfig";
import { createNameplate } from "../nameplate";
import { createDungeonPortal } from "./createDungeonPortal";

export const createDungeonEnvironment = (scene) => {
  const stone = new StandardMaterial("dungeonStone", scene);
  stone.diffuseColor = Color3.FromHexString("#404654");
  stone.specularColor = Color3.Black();
  const box = (name, dimensions, position) => {
    const mesh = MeshBuilder.CreateBox(name, dimensions, scene);
    mesh.position.set(...position);
    mesh.material = stone;
    mesh.checkCollisions = true;
    mesh.freezeWorldMatrix();
    return mesh;
  };
  box("dungeonWallWest", { width: 1, height: 5, depth: 118 }, [-13, 2.5, 48]);
  box("dungeonWallEast", { width: 1, height: 5, depth: 118 }, [13, 2.5, 48]);
  box("dungeonWallSouth", { width: 27, height: 5, depth: 1 }, [0, 2.5, -11]);
  box("dungeonWallNorth", { width: 27, height: 5, depth: 1 }, [0, 2.5, 107]);
  for (const z of [12, 32, 52, 72, 92]) {
    for (const x of [-10, 10]) box("dungeonPillar", { width: 1.4, height: 6, depth: 1.4 }, [x, 3, z]);
  }
  createDungeonPortal({ scene, ...DUNGEON.exit, title: "Exit Dungeon" });
  const chestRoot = new TransformNode("dungeonRewardChest", scene);
  chestRoot.position.set(DUNGEON.chest.x, 0, DUNGEON.chest.z);
  const chest = MeshBuilder.CreateBox("rewardChest", { width: 2, height: 1.2, depth: 1.3 }, scene);
  chest.parent = chestRoot;
  chest.position.y = 0.6;
  const gold = new StandardMaterial("chestGold", scene);
  gold.diffuseColor = Color3.FromHexString("#b88b32");
  gold.emissiveColor = Color3.FromHexString("#3e2c0a");
  chest.material = gold;
  chest.isPickable = false;
  chest.freezeWorldMatrix();
  createNameplate({ scene, player: chestRoot, name: "Reward Chest", color: "#facc15", y: 2 });
  chestRoot.setEnabled(false);
  return { setCompleted: (completed) => chestRoot.setEnabled(completed) };
};
