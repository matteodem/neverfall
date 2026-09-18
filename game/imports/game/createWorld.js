import "@babylonjs/loaders/glTF";

import {
  Color3,
  DirectionalLight,
  HemisphericLight,
  MeshBuilder,
  SceneLoader,
  TransformNode,
  Vector3,
} from "@babylonjs/core";

import {
  createMaterial,
} from "./materials";

import {
  createGameCamera,
} from "./camera";

export const createWorld = async (
  scene
) => {
  /*
   * LIGHTS
   */

  const ambient =
    new HemisphericLight(
      "ambient",
      new Vector3(
        0,
        1,
        0
      ),
      scene
    );

  ambient.intensity = 0.8;

  const sun =
    new DirectionalLight(
      "sun",
      new Vector3(
        -1,
        -2,
        1
      ),
      scene
    );

  sun.intensity = 0.6;

  /*
   * GROUND
   */

  const ground =
    MeshBuilder.CreateGround(
      "ground",
      {
        width: 40,
        height: 40,
      },
      scene
    );

  ground.material =
    createMaterial(
      "groundMaterial",
      new Color3(
        0.12,
        0.25,
        0.15
      ),
      scene
    );

  /*
 * PLAYER ROOT
 */

  const player = new TransformNode(
    "player",
    scene
  );

  player.position.set(
    0,
    0,
    0
  );

  /*
  * PLAYER MODEL
  */

  const result =
    await SceneLoader.ImportMeshAsync(
      "",
      "/models/",
      "player.glb",
      scene
    );

  const playerModel =
    result.meshes[0];

  playerModel.parent =
    player;

  /*
   * SWORD
   */

  const sword =
    MeshBuilder.CreateBox(
      "sword",
      {
        width: 0.15,
        height: 1.4,
        depth: 0.15,
      },
      scene
    );

  sword.parent = player;

  sword.position.set(
    0.7,
    0.2,
    0.2
  );

  sword.rotation.z =
    Math.PI / 4;

  sword.material =
    createMaterial(
      "swordMaterial",
      new Color3(
        0.8,
        0.8,
        0.9
      ),
      scene
    );

  /*
   * ENEMY
   */

  const enemy =
    MeshBuilder.CreateCapsule(
      "enemy",
      {
        height: 2,
        radius: 0.55,
      },
      scene
    );

  enemy.position.set(
    0,
    1,
    5
  );

  const enemyMaterial =
    createMaterial(
      "enemyMaterial",
      new Color3(
        0.8,
        0.1,
        0.1
      ),
      scene
    );

  enemy.material =
    enemyMaterial;

  /*
   * CAMERA
   */

  const camera =
    createGameCamera(
      scene,
      player
    );

  return {
    player,
    playerModel,
    animationGroups:
    result.animationGroups,

    sword,
    enemy,
    enemyMaterial,
    camera,
  };
};