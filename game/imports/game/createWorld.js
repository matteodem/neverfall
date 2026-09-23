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
  createLowPolyCharacter,
} from "./character/createLowPolyCharacter";

import {
  createCharacterAnimationController,
} from "./character/createCharacterAnimationController";

import {
  createMountainRing,
} from "./environment/createMountainRing";

import {
  createClearingCamp,
} from "./environment/createClearingCamp";

import {
  createForestPath,
} from "./environment/createForestPath";

import {
  SWORD,
} from "./config";

import {
  createGameCamera,
} from "./camera";

import {
  createNameplate,
} from "./nameplate";

import {
  createForestArea,
} from "./environment/createForestArea";


export const createWorld =
  async (
    scene,
    {
      appearance,
      name,
    }
  ) => {
    /*
     * =====================================================
     * SKY / FOG
     * =====================================================
     */

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

    scene.fogStart =
      80;

    scene.fogEnd =
      220;


    /*
     * =====================================================
     * LIGHTS
     * =====================================================
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
     * =====================================================
     * GROUND
     * =====================================================
     */

    const ground =
      MeshBuilder.CreateGround(
        "ground",
        {
          width:
            500,

          height:
            500,
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
     * =====================================================
     * PLAYER
     * =====================================================
     */

    const character =
      createLowPolyCharacter({
        scene,
        appearance,
      });

    const player =
      character.root;

    player.position.set(
      0,
      0,
      0
    );


    /*
     * =====================================================
     * PLAYER ANIMATIONS
     * =====================================================
     */

    const animations =
      createCharacterAnimationController(
        character
      );


    /*
     * =====================================================
     * NAMEPLATE
     * =====================================================
     */

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
     * =====================================================
     * SWORD
     * =====================================================
     *
     * Sword still uses the existing GLB.
     * The player itself no longer does.
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
     * Attack pivot.
     *
     * Combat rotates this node.
     */

    const swordPivot =
      new TransformNode(
        "swordPivot",
        scene
      );


    /*
     * Grip stores the normal
     * position / rotation from config.
     */

    const swordGrip =
      new TransformNode(
        "swordGrip",
        scene
      );


    /*
     * The procedural character has
     * no skeleton/bones.
     *
     * Attach the weapon directly to
     * the right arm pivot instead.
     */

    swordPivot.parent =
      character.parts
        .rightArmPivot;


    /*
     * rightArmPivot is at the shoulder.
     *
     * Move swordPivot downward towards
     * the character's hand.
     */

    swordPivot.position.set(
      0,
      -0.9,
      0
    );


    swordGrip.parent =
      swordPivot;

    sword.parent =
      swordGrip;


    /*
     * Existing weapon config.
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
     * Sword imported root should
     * not have an additional offset.
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


    /*
     * =====================================================
     * SWORD TIP
     * =====================================================
     */

    const swordTip =
      MeshBuilder.CreateSphere(
        "swordTip",
        {
          diameter:
            0.03,
        },
        scene
      );

    swordTip.parent =
      sword;

    swordTip.position.set(
      0,
      1.2,
      0
    );

    swordTip.isVisible =
      false;


    /*
     * =====================================================
     * FOREST
     * =====================================================
     */

    const forest =
      createForestArea({
        scene,

        center:
          new Vector3(
            0,
            0,
            0
          ),

        clearing: {
          center:
            new Vector3(
              0,
              0,
              0
            ),

          radius:
            8,
        },

        path: {
          start:
            new Vector3(
              4,
              0,
              3
            ),

          end:
            new Vector3(
              0,
              0,
              25
            ),

          width:
            2.5,
        },
      });


    /*
     * =====================================================
     * MOUNTAINS
     * =====================================================
     */

    const mountainRing =
      createMountainRing({
        scene,

        center:
          new Vector3(
            0,
            0,
            0
          ),

        size:
          280,

        spacing:
          22,

        jitter:
          6,
      });


    /*
     * =====================================================
     * CAMP
     * =====================================================
     */

    const clearingCamp =
      createClearingCamp({
        scene,

        center:
          new Vector3(
            2,
            0,
            3.5
          ),
      });


    /*
     * =====================================================
     * FOREST PATH
     * =====================================================
     */

    const forestPath =
      createForestPath({
        scene,

        start:
          new Vector3(
            4,
            0,
            3
          ),

        end:
          new Vector3(
            0,
            0,
            25
          ),

        width:
          3,
      });


    /*
     * =====================================================
     * CAMERA
     * =====================================================
     */

    const camera =
      createGameCamera(
        scene,
        player
      );


    /*
     * =====================================================
     * RESULT
     * =====================================================
     */

    return {
      player,

      character,

      animations,

      sword,

      swordPivot,

      swordTip,

      camera,

      nameplate,

      mountainRing,

      forest,

      camp:
        clearingCamp,

      path:
        forestPath,
    };
  };