import "@babylonjs/loaders/glTF";

import {
  Color3,
  DirectionalLight,
  HemisphericLight,
  MeshBuilder,
  SceneLoader,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";

import {
  createMountainRing,
} from "./environment/createMountainRing";

import {
  SWORD,
} from "./config";

import {
  createMaterial,
} from "./materials";

import {
  createGameCamera,
} from "./camera";

import {
  createNameplate,
} from "./nameplate";

import {
  createForestArea,
} from "./environment/createForestArea";

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

export const createWorld =
  async (
    scene,
    {
      assetFile,
      name,
    }
  ) => {

  scene.clearColor =
    Color3.FromHexString(
      "#FFF4D6"
    ).toColor4();

  scene.fogMode =
    3;

  scene.fogColor =
    Color3.FromHexString(
      "#FFF4D6"
    );

  scene.fogStart = 80;
  scene.fogEnd = 220;

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

  ambient.intensity =
    0.9;

  ambient.diffuse =
    Color3.FromHexString(
      "#FFF4D6"
    );

  ambient.groundColor =
    Color3.FromHexString(
      "#B9A86E"
    );


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

  sun.intensity =
    0.85;

  sun.diffuse =
    Color3.FromHexString(
      "#FFE6A3"
    );

  /*
   * GROUND
   */

  const ground =
    MeshBuilder.CreateGround(
      "ground",
      {
        width: 500,
        height: 500,
      },
      scene
    );

  const groundMaterial =
    new StandardMaterial(
      "groundMaterial",
      scene
    );

  groundMaterial.diffuseColor =
    Color3.FromHexString(
      "#4B6B3C"
    );

  groundMaterial.specularColor =
    Color3.Black();

  ground.material =
    groundMaterial;

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

  const lastSlash =
  assetFile.lastIndexOf(
    "/"
    );

  const rootUrl =
    assetFile.slice(
      0,
      lastSlash + 1
    );

  const fileName =
    assetFile.slice(
      lastSlash + 1
    );

  const result =
    await SceneLoader.ImportMeshAsync(
      "",
      rootUrl,
      fileName,
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

  
  const animationGroups =
    result.animationGroups;

  const nameplate =
    createNameplate({
      scene,

      player,

      name,

      color:
        "white",

      y:
        -0.4,
    });

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

  const swordGrip =
    new TransformNode(
      "swordGrip",
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
    * Attack pivot follows the hand.
    */
    swordPivot.attachToBone(
      rightHandBone,
      skinnedMesh
    );

    /*
    * Small attack pivot offset.
    *
    * The pivot stays near the hand,
    * but slightly behind it so the swing
    * gets a larger arc without detaching
    * the sword.
    */
    swordPivot.position.set(
      0,
      -0.05,
      -0.15
    );

    /*
    * Grip is underneath the attack pivot.
    */
    swordGrip.parent =
      swordPivot;

    /*
    * Actual sword is underneath the grip.
    */
    sword.parent =
      swordGrip;

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

  /*
  * Position / rotation of the weapon
  * relative to the player's hand.
  */
  swordGrip.position.set(
    SWORD.position.x,
    SWORD.position.y,
    SWORD.position.z
  );

  swordGrip.rotation.set(
    SWORD.rotation.x,
    SWORD.rotation.y,
    SWORD.rotation.z
  );

  sword.scaling.setAll(
    SWORD.scale
  );

  /*
  * Keep sword itself close to the hand.
  *
  * Do NOT use a large offset here,
  * otherwise the weapon looks detached.
  */
  sword.position.set(
    0,
    0,
    0
  );

  sword.rotation.set(
    0,
    0,
    0
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

  const eastNorthForest =
    createForestArea({
      scene,

      center:
        new Vector3(
          35,
          0,
          35
        ),

      size: 50,

      treeCount: 80,
      rockCount: 25,
      bushCount: 40,
      logCount: 12,
    });

  const mountainRing =
    createMountainRing({
      scene,

      center:
        new Vector3(
          0,
          0,
          0
        ),

      size: 280,

      spacing: 22,

      jitter: 6,
    });

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
    camera,
    animationGroups,
    nameplate,
    mountainRing,
    forest:
      eastNorthForest,
  };
};