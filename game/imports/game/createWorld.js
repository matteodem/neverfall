import { DUNGEON } from "./dungeonConfig";
import { createDungeonPortal } from "./environment/createDungeonPortal";
import { createDungeonEnvironment } from "./environment/createDungeonEnvironment";
import { WORLD_SIZE, WORLD_CHUNKS, WORLD_REGIONS, CHUNK_SIZE } from "./worldConfig";
import { createWorldChunks } from "./worldChunks";
import "@babylonjs/loaders/glTF";

import { getClassConfig } from "./classConfig";
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
  createClearingCamp,
} from "./environment/createClearingCamp";

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

import {
  createKayKitCharacter,
} from "./character/createKayKitCharacter";

import {
  createKayKitAnimationController,
} from "./character/createKayKitAnimationController";

import {
  createJumpingPuzzle,
} from "./environment/createJumpingPuzzle";

export const createWorld =
  async (
    scene,
    {
      appearance,
      name,
      gameClass = "warrior",
      dungeon = false,
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

    scene.collisionsEnabled =
      true;

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
            dungeon ? 26 : WORLD_SIZE + 60,

          height:
            dungeon ? 118 : WORLD_SIZE + 60,
        },
        scene
      );

    if (dungeon) {
      ground.position.z = 48;
      scene.clearColor = Color3.FromHexString("#1b202b").toColor4();
      scene.fogColor = Color3.FromHexString("#1b202b");
    }

    ground.checkCollisions =
      true;

    const groundMaterial =
      new StandardMaterial(
        "groundMaterial",
        scene
      );

    groundMaterial.diffuseColor =
      Color3.FromHexString(
        dungeon ? "#333946" : "#4B6B3C"
      );

    groundMaterial.specularColor =
      Color3.Black();

    ground.material =
      groundMaterial;
    ground.freezeWorldMatrix();


    /*
     * =====================================================
     * PLAYER
     * =====================================================
     */

    const character =
      await createKayKitCharacter({
        scene,
        appearance,
        gameClass,
      });


    /*
    * =====================================================
    * PLAYER COLLIDER
    * =====================================================
    *
    * The KayKit character root is a TransformNode,
    * which cannot use moveWithCollisions().
    *
    * Keep gameplay collision separate from
    * the visual character.
    */

    const player =
      MeshBuilder.CreateBox(
        "playerCollider",
        {
          width:
            0.8,

          height:
            1.8,

          depth:
            0.8,
        },
        scene
      );


    player.position.set(
      0,
      0,
      0
    );

    player.visibility =
      0;

    player.isPickable =
      false;

    player.checkCollisions =
      true;


    /*
    * Player position represents
    * the position of his feet.
    *
    * The collision ellipsoid itself
    * is shifted upwards around the body.
    */

    player.ellipsoid =
      new Vector3(
        0.4,
        0.9,
        0.4
      );

    player.ellipsoidOffset =
      new Vector3(
        0,
        0.9,
        0
      );


    /*
    * KayKit root also uses the
    * player's foot position.
    */

    character.root.parent =
      player;

    character.root.position.set(
      0,
      0,
      0
    );

    player.checkCollisions =
      true;

    player.ellipsoid =
      new Vector3(
        0.4,
        0.9,
        0.4
      );

    player.ellipsoidOffset =
      new Vector3(
        0,
        0.9,
        0
      );


    /*
     * =====================================================
     * PLAYER ANIMATIONS
     * =====================================================
     */

    const animations =
      createKayKitAnimationController(
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


    swordPivot.parent =
      character.weaponAnchor;

    swordPivot.position.set(
      0,
      0,
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

    swordPivot.setEnabled(getClassConfig(gameClass).swordVisible);


    let forest, mountainRing, jumpingPuzzle, clearingCamp;
    let dungeonVisuals = null;
    if (dungeon) {
      dungeonVisuals = createDungeonEnvironment(scene);
    } else {
      const chunks = createWorldChunks(scene, player);
      const portal = createDungeonPortal({ scene, ...DUNGEON.entrance, title: "Enter Dungeon" });
      chunks.add(portal.root, DUNGEON.entrance);
      /*
       * =====================================================
       * FOREST
       * =====================================================
       */

      for (const chunk of WORLD_CHUNKS) {
        const area = createForestArea({
          scene,
          size: CHUNK_SIZE,
          center: new Vector3(chunk.x, 0, chunk.z),
          ...WORLD_REGIONS[chunk.region],
        });
        chunks.add(area, chunk);
        if (chunk.x === 0 && chunk.z === 0) forest = area;
      }

      /*
       * =====================================================
       * MOUNTAINS
       * =====================================================
       */

      mountainRing =
        createMountainRing({
          scene,

          center:
            new Vector3(
              0,
              0,
              0
            ),

          size:
            WORLD_SIZE + 40,

          spacing:
            22,

          jitter:
            6,
        });

      /*
      * =====================================================
      * JUMPING PUZZLE
      * =====================================================
      */

      jumpingPuzzle =
        createJumpingPuzzle({
          scene,
        });


      /*
       * =====================================================
       * CAMP
       * =====================================================
       */

      clearingCamp =
        createClearingCamp({
          scene,

          center:
            new Vector3(
              2,
              0,
              3.5
            ),
        });


      for (const mesh of mountainRing.getChildMeshes()) {
        mesh.freezeWorldMatrix();
        chunks.add(mesh, mesh.getAbsolutePosition());
      }
      chunks.add(clearingCamp, clearingCamp.position);
      for (const mesh of [...jumpingPuzzle.blocks, jumpingPuzzle.platform]) {
        chunks.add(mesh, mesh.getAbsolutePosition());
      }
      chunks.update();
      for (const mesh of [...jumpingPuzzle.blocks, jumpingPuzzle.platform]) mesh.freezeWorldMatrix();
    }

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
      dungeonVisuals,
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

      jumpingPuzzle,
    };
  };
