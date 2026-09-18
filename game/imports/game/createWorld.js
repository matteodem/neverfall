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
  SWORD,
} from "./config";

import {
  createMaterial,
} from "./materials";

import {
  createGameCamera,
} from "./camera";

const findRightHandBone = (
  skeleton
) => {
  if (!skeleton) {
    return null;
  }

  return skeleton.bones.find(
    (bone) => {
      const name =
        bone.name.toLowerCase();

      return (
        name.includes("righthand") ||
        name.includes("right_hand") ||
        name.includes("hand_r")
      );
    }
  );
};


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

  const skeleton =
    result.skeletons[0];

  const skinnedMesh =
    result.meshes.find(
      (mesh) =>
        mesh.skeleton === skeleton
    );

  /*
   * SWORD
   */

  const swordResult =
    await SceneLoader.ImportMeshAsync(
      "",
      "/models/",
      "sword.glb",
      scene
    );

  const sword =
    swordResult.meshes[0];

  /*
  * Pivot between hand and sword.
  *
  * We animate this instead of
  * rotating the imported sword directly.
  */
  const swordPivot =
    new TransformNode(
      "swordPivot",
      scene
    );
  
  const rightHandBone =
    findRightHandBone(
      skeleton
    );

  if (
    rightHandBone &&
    skinnedMesh
  ) {
    /*
    * Attach pivot to the hand.
    */
    swordPivot.attachToBone(
      rightHandBone,
      skinnedMesh
    );

    /*
    * Sword becomes child of pivot.
    */
    sword.parent =
      swordPivot;

    console.log(
      "Sword attached to:",
      rightHandBone.name
    );
  } else {
    console.warn(
      "Could not attach sword to right hand."
    );

    if (skeleton) {
      console.log(
        skeleton.bones.map(
          (bone) =>
            bone.name
        )
      );
    }
  }

  sword.position.set(
    SWORD.position.x,
    SWORD.position.y,
    SWORD.position.z
  );

  sword.rotation.set(
    SWORD.rotation.x,
    SWORD.rotation.y,
    SWORD.rotation.z
  );

  sword.scaling.setAll(
    SWORD.scale
  );

  const swordTip =
    MeshBuilder.CreateSphere(
      "swordTip",
      {
        diameter: 0.03,
      },
      scene
    );

  swordTip.parent =
    sword;

  /*
  * IMPORTANT:
  *
  * This position is relative to the sword.
  * You may have to tweak Y depending on
  * the sword model.
  */
  swordTip.position.set(
    0,
    1.2,
    0
  );

  /*
  * Invisible, but still exists
  * as a TrailMesh target.
  */
  swordTip.isVisible =
    false;

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
    sword,
    swordPivot,
    swordTip,
    enemy,
    enemyMaterial,
    camera,
    animationGroups:
      result.animationGroups,
  };
};