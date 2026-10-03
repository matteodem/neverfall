import { QUALITY_PRESETS } from "./performanceConfig";
import { DUNGEONS, getDungeonConfig } from "./dungeonConfig";
import { createDungeonPortal, loadDungeonEntranceAsset } from "./environment/createDungeonPortal";
import { createDungeonEnvironment } from "./environment/createDungeonEnvironment";
import { ANCIENT_FOREST_SHRINE, FROZEN_STONE_ARCH, WORLD_SIZE, WORLD_CHUNKS, WORLD_REGIONS, CHUNK_SIZE, FOREST_GIANT_HILL, SNOWY_MOUNTAINS, SOUTHWEST_LAKE, getHighlandMix, getSnowMix, getWorldHeight } from "./worldConfig";
import { NORTHERN_CAMP } from "./campProtection";
import { createWorldChunks } from "./worldChunks";
import { createHighlandsArea } from "./environment/createHighlandsArea";
import { loadForestProps } from "./environment/createForestProps";
import { loadCampAssets } from "./environment/createAssetCamp";
import { BASIC_TOWER_CLEARING_RADIUS, BASIC_TOWER_POSITION } from "./basicTowerConfig";
import { createBasicTower } from "./environment/createBasicTower";
import { getTerrainColorVariation } from "./environment/terrainColor";
import { createSouthwestLake } from "./environment/createWorldLandmarks";
import { WAYPOINTS } from "./waypoints";
import { ENEMY_SPAWNS, ENEMY_TYPES } from "./enemyConfig";
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
  VertexBuffer,
  VertexData,
} from "@babylonjs/core";

import { createWorldBoundary } from "./environment/createWorldBoundary";

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
  createPlayerCharacter,
} from "./character/createPlayerCharacter";

import {
  createKayKitAnimationController,
} from "./character/createKayKitAnimationController";

export const createWorld =
  async (
    scene,
    {
      appearance,
      name,
      gameClass = "warrior",
      species = "human",
      dungeon = false,
      dungeonId = null,
      quality = QUALITY_PRESETS.standard,
    }
  ) => {
    const dungeonConfig = dungeon ? getDungeonConfig(dungeonId) : null;
    if (dungeon && !dungeonConfig) throw new Error("Unknown dungeon");

    /*
     * =====================================================
     * SKY / FOG
     * =====================================================
     */

    scene.metadata = { ...scene.metadata, quality };
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

          subdivisions: dungeon ? 1 : 96,
          updatable: !dungeon,
        },
        scene
      );

    if (!dungeon) {
      const positions = ground.getVerticesData(VertexBuffer.PositionKind);
      const normals = ground.getVerticesData(VertexBuffer.NormalKind);
      const colors = new Float32Array(positions.length / 3 * 4);
      const forestColor = Color3.FromHexString("#809B54");
      const highlandColor = Color3.FromHexString("#A0AC79");
      const oliveColor = Color3.FromHexString("#93A264");
      const brownColor = Color3.FromHexString("#917F61");
      const snowColor = Color3.FromHexString("#DCE8EB");
      const coldStoneColor = Color3.FromHexString("#8997A2");
      for (let index = 0; index < positions.length; index += 3) {
        const x = positions[index];
        const z = positions[index + 2];
        positions[index + 1] = getWorldHeight(x, z);
        const mix = getHighlandMix(z);
        const variation = getTerrainColorVariation(x, z);
        const baseWeight = 1 - variation.olive - variation.brown;
        const shade = 1 + variation.shade;
        const snow = getSnowMix(x, z);
        const stoneMix = Math.max(0, Math.min(1, (x - 275) / 45));
        const colorIndex = index / 3 * 4;
        for (const [offset, channel] of ["r", "g", "b"].entries()) {
          const warm = (forestColor[channel] + (highlandColor[channel] - forestColor[channel]) * mix) *
            shade * baseWeight + oliveColor[channel] * variation.olive + brownColor[channel] * variation.brown;
          const cold = snowColor[channel] + (coldStoneColor[channel] - snowColor[channel]) * stoneMix;
          colors[colorIndex + offset] = warm * (1 - snow) + cold * snow * shade;
        }
        colors[colorIndex + 3] = 1;
      }
      VertexData.ComputeNormals(positions, ground.getIndices(), normals);
      ground.updateVerticesData(VertexBuffer.PositionKind, positions);
      ground.updateVerticesData(VertexBuffer.NormalKind, normals);
      ground.setVerticesData(VertexBuffer.ColorKind, colors);
      ground.useVertexColors = true;
      ground.refreshBoundingInfo();
    }

    if (dungeon) {
      ground.position.z = 48;
      scene.clearColor = Color3.FromHexString(dungeonConfig.environment.sky).toColor4();
      scene.fogColor = Color3.FromHexString(dungeonConfig.environment.sky);
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
        dungeon ? dungeonConfig.environment.ground : "#FFFFFF"
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

    const [character, swordResult] = await Promise.all([
      createPlayerCharacter({
        scene,
        appearance,
        gameClass,
        species,
      }),
      SceneLoader.ImportMeshAsync("", "/models/", "sword.glb", scene),
    ]);


    /*
    * =====================================================
    * PLAYER COLLIDER
    * =====================================================
    *
    * The visual character root is a TransformNode,
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
    * Character root also uses the
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


    let forest, forestProps, jumpingPuzzle, clearingCamp;
    let dungeonVisuals = null;
    let chunks = null;
    if (dungeon) {
      dungeonVisuals = createDungeonEnvironment(scene, dungeonConfig);
    } else {
      chunks = createWorldChunks(scene, player);
      let disposed = false;
      scene.onDisposeObservable.addOnce(() => { disposed = true; });
      const [loadedForestProps, campAssets, tower] = await Promise.all([
        loadForestProps(scene), loadCampAssets(scene), createBasicTower(scene),
      ]);
      forestProps = loadedForestProps;
      jumpingPuzzle = tower;
      const createCamp = campAssets.available ? campAssets.createCamp : createClearingCamp;
      /*
       * =====================================================
       * FOREST
       * =====================================================
       */

      for (const chunk of WORLD_CHUNKS) {
        chunks.addLoader(chunk, async () => {
        if (chunk.region === "snowyMountains") await forestProps.preloadSnowy();
        if (disposed) return;
        const assetForest = forestProps.available;
        const northernCampChunk = chunk.x === NORTHERN_CAMP.center.x && chunk.z === NORTHERN_CAMP.center.z;
        const giantHillChunk = chunk.x === 0 && chunk.z === 0;
        const towerChunk = Math.abs(chunk.x - BASIC_TOWER_POSITION.x) < CHUNK_SIZE / 2 &&
          Math.abs(chunk.z - BASIC_TOWER_POSITION.z) < CHUNK_SIZE / 2;
        const lakeChunk = Math.abs(chunk.x - SOUTHWEST_LAKE.center.x) < CHUNK_SIZE / 2 &&
          Math.abs(chunk.z - SOUTHWEST_LAKE.center.z) < CHUNK_SIZE / 2;
        const shrineChunk = Math.abs(chunk.x - ANCIENT_FOREST_SHRINE.x) < CHUNK_SIZE / 2 &&
          Math.abs(chunk.z - ANCIENT_FOREST_SHRINE.z) < CHUNK_SIZE / 2;
        const area = createForestArea({
          scene,
          size: CHUNK_SIZE,
          center: new Vector3(chunk.x, 0, chunk.z),
          includeFloor: false,
          ...WORLD_REGIONS[chunk.region],
          extraClearings: [
            ...ENEMY_SPAWNS.filter((spawn) => ENEMY_TYPES[spawn.type]?.bossMechanics &&
              Math.abs(spawn.x - chunk.x) < CHUNK_SIZE / 2 && Math.abs(spawn.z - chunk.z) < CHUNK_SIZE / 2)
              .map((spawn) => ({ center: spawn, radius: 24 })),
            ...(giantHillChunk ? [{ center: FOREST_GIANT_HILL.center, radius: 20 }] : []),
            ...(towerChunk ? [{ center: BASIC_TOWER_POSITION, radius: BASIC_TOWER_CLEARING_RADIUS }] : []),
            ...(lakeChunk ? [{ center: SOUTHWEST_LAKE.center, radius: SOUTHWEST_LAKE.radius + 5 }] : []),
            ...(shrineChunk ? [{ center: ANCIENT_FOREST_SHRINE, radius: 24 }] : []),
            ...(chunk.region === "snowyMountains" ? [{ center: FROZEN_STONE_ARCH, radius: 24 }] : []),
            ...(chunk.region === "snowyMountains" ? [{ center: SNOWY_MOUNTAINS.boss, radius: 24 }] : []),
            ...(lakeChunk ? WAYPOINTS.filter((point) => point.id === "lake-waypoint")
              .map((point) => ({ center: point.position, radius: 9 })) : []),
            ...(chunk.region === "snowyMountains" ? WAYPOINTS.filter((point) => point.id === "snowy-mountains-waypoint")
              .map((point) => ({ center: point.position, radius: 9 })) : []),
          ],
          ...(northernCampChunk ? { clearing: {
            center: new Vector3(NORTHERN_CAMP.center.x, 0, NORTHERN_CAMP.center.z),
            radius: NORTHERN_CAMP.clearingRadius,
          } } : {}),
          ...Object.fromEntries(["treeCount", "bushCount", "rockCount", "logCount"].map((key) =>
            [key, assetForest || chunk.region === "highlands" ||
              (key === "treeCount" && ["forest", "starterForest"].includes(chunk.region))
              ? 0 : Math.round(WORLD_REGIONS[chunk.region][key] * quality.density)])),
        });
        chunks.add(area, chunk);
        if (assetForest && chunk.region !== "highlands") chunks.add(await forestProps.placeChunk({
          center: chunk, size: CHUNK_SIZE, density: quality.density,
          gradual: chunk.x !== 0 || chunk.z !== 0,
        }), chunk);
        if (lakeChunk) chunks.add(createSouthwestLake(scene), SOUTHWEST_LAKE.center);
        if (chunk.region === "highlands") {
          if (assetForest) await forestProps.preloadHighlands();
          chunks.add(await createHighlandsArea({ scene, chunk, props: assetForest ? forestProps : null }), chunk);
        }
        if (northernCampChunk) {
          const camp = createCamp({
            scene,
            center: new Vector3(NORTHERN_CAMP.center.x, 0, NORTHERN_CAMP.center.z),
            rugged: true,
          });
          chunks.add(camp, NORTHERN_CAMP.center);
        }
        if (chunk.x === 0 && chunk.z === 0) forest = area;
        });
      }

      // The starting chunk is needed before the loading screen closes.
      await chunks.loadAt({ x: 0, z: 0 });
      chunks.addLoader(ANCIENT_FOREST_SHRINE, async () => {
        await forestProps.preloadShrine();
        if (disposed) return;
        const shrine = forestProps.createShrine(ANCIENT_FOREST_SHRINE);
        if (shrine) chunks.add(shrine, ANCIENT_FOREST_SHRINE);
      }, 120, false);
      chunks.addLoader(FROZEN_STONE_ARCH, async () => {
        await forestProps.preloadFrozenArch();
        if (disposed) return;
        const arch = forestProps.createFrozenArch(FROZEN_STONE_ARCH);
        if (arch) chunks.add(arch, FROZEN_STONE_ARCH);
      }, 120, false);
      for (const waypoint of WAYPOINTS.filter((point) =>
        ["lake-waypoint", "snowy-mountains-waypoint"].includes(point.id))) {
        chunks.addLoader(waypoint.position, async () => {
          await forestProps.preloadWaypointMarker();
          if (disposed) return;
          const marker = forestProps.createWaypointMarker(waypoint.position);
          if (marker) chunks.add(marker, waypoint.position);
        }, 120, false);
      }
      let entrancePromise;
      const preloadEntrance = () => {
        if (!entrancePromise) entrancePromise = loadDungeonEntranceAsset(scene).catch((error) => {
          entrancePromise = null;
          throw error;
        });
        return entrancePromise;
      };
      for (const config of DUNGEONS) {
        chunks.addLoader(config.entrance, async () => {
          const entranceAsset = await preloadEntrance();
          if (disposed) return;
          const portal = createDungeonPortal({ scene, ...config.entrance, title: config.name, entranceAsset });
          chunks.add(portal.root, config.entrance);
        }, 120, false);
      }

      createWorldBoundary(scene);

      /*
      * =====================================================
      * JUMPING PUZZLE
      * =====================================================
      */

      chunks.add(jumpingPuzzle, BASIC_TOWER_POSITION);


      /*
       * =====================================================
       * CAMP
       * =====================================================
       */

      clearingCamp =
        createCamp({
          scene,

          center:
            new Vector3(
              2,
              0,
              3.5
            ),
        });


      chunks.add(clearingCamp, clearingCamp.position);
      chunks.update();
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
      worldChunks: chunks,
      dungeonVisuals,
      player,

      character,

      animations,

      sword,

      swordPivot,

      swordTip,

      camera,

      nameplate,

      forestProps,

      forest,

      camp:
        clearingCamp,

      jumpingPuzzle,
    };
  };
