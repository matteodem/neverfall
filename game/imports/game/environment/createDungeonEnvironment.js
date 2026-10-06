import { Color3, MeshBuilder, StandardMaterial, TransformNode } from "@babylonjs/core";
import { createNameplate } from "../nameplate";
import { createDungeonPortal } from "./createDungeonPortal";
import { createChallengeMote } from "./createChallengeMote";

export const createDungeonEnvironment = (scene, dungeon) => {
  const stone = new StandardMaterial("dungeonStone", scene);
  stone.diffuseColor = Color3.FromHexString(dungeon.environment.stone);
  stone.specularColor = Color3.Black();
  const box = (name, dimensions, position) => {
    const mesh = MeshBuilder.CreateBox(name, dimensions, scene);
    mesh.position.set(...position);
    mesh.material = stone;
    mesh.checkCollisions = true;
    mesh.freezeWorldMatrix();
    return mesh;
  };
  for (const wall of dungeon.map.walls) box(`dungeon${wall.name}`, wall.size, wall.position);
  for (const pillar of dungeon.map.pillars) box("dungeonPillar", pillar.size, pillar.position);
  if (dungeon.map.water?.length) {
    const water = new StandardMaterial("dungeonWater", scene);
    water.diffuseColor = Color3.FromHexString("#477988");
    water.emissiveColor = Color3.FromHexString("#17333e");
    water.alpha = 0.65;
    for (const pool of dungeon.map.water) {
      const surface = MeshBuilder.CreateGround("dungeonShallowWater", {
        width: pool.width, height: pool.depth,
      }, scene);
      surface.position.set(pool.x, 0.025, pool.z);
      surface.material = water;
      surface.isPickable = false;
      surface.freezeWorldMatrix();
    }
  }
  createDungeonPortal({ scene, ...dungeon.exit, title: "Exit Dungeon" });
  const chestRoot = new TransformNode("dungeonRewardChest", scene);
  chestRoot.position.set(dungeon.chest.x, 0, dungeon.chest.z);
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
  const mote = createChallengeMote(scene, dungeon.challengeMote);
  return {
    setCompleted: (completed) => chestRoot.setEnabled(completed),
    setChallengeState: mote.setState,
  };
};
