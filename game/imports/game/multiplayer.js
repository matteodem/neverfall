import { PERFORMANCE, QUALITY_PRESETS } from "./performanceConfig";
import { useTargetStore } from "../ui/stores/useTargetStore";
import { useBossHealthStore } from "../ui/stores/useBossHealthStore";
import { useChatStore } from "../ui/stores/useChatStore";
import { createBossVisuals } from "./bossVisuals";
import { useBossNoticeStore } from "../ui/stores/useBossNoticeStore";
import { useWorldEventStore } from "../ui/stores/useWorldEventStore";
import { getGameSession, closeGameSession } from "./gameSession";
import { getClassConfig } from "./classConfig";
import { createProjectileVisuals } from "./projectiles";
import { createDungeonInteractions } from "./dungeonInteractions";
import { createEntityVisibility, ENTITY_VISIBILITY } from "./entityVisibility";
import { getQuestArea, HUNT_QUESTS } from "./quests";
import { useQuestStore } from "../ui/stores/useQuestStore";
import { createLoot } from "./loot";
import "@babylonjs/loaders/glTF";

import { useActionBarStore } from "../ui/stores/useActionBarStore";
import {
  Callbacks,
} from "@colyseus/sdk";

import {
  Color3,
  MeshBuilder,
  SceneLoader,
  StandardMaterial,
  TrailMesh,
  TransformNode,
  Vector3,
} from "@babylonjs/core";

import {
  JUMP,
} from "./config";

import {
  createHealthBar,
} from "./healthBar";

import {
  createEnemy,
} from "./enemy";

import {
  playHealEffect,
} from "./healEffect";

import {
  createNameplate,
} from "./nameplate";

import {
  createKayKitCharacter,
} from "./character/createKayKitCharacter";

import {
  createKayKitAnimationController,
} from "./character/createKayKitAnimationController";

import { createHorseMount } from "./mounts";

import {
  useCombatStore,
} from "../ui/stores/useCombatStore";

import {
  useLevelUpStore,
} from "../ui/stores/useLevelUpStore";

import {
  useMinimapStore,
} from "../ui/stores/useMinimapStore";

const SEND_INTERVAL = PERFORMANCE.movementInterval;


const REMOTE_SMOOTHING =
  12;


const RUN_TIMEOUT =
  150;


const JUMP_THRESHOLD =
  0.05;


/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

const normalizeAngle =
  (
    angle
  ) => {
    while (
      angle >
      Math.PI
    ) {
      angle -=
        Math.PI *
        2;
    }


    while (
      angle <
      -Math.PI
    ) {
      angle +=
        Math.PI *
        2;
    }


    return angle;
  };


const lerp =
  (
    from,
    to,
    progress
  ) => {
    return (
      from +
      (
        to -
        from
      ) *
        progress
    );
  };


/*
 * =========================================================
 * REMOTE SWORD COMBAT
 * =========================================================
 */

const createRemoteCombat =
  ({
    scene,
    swordPivot,
    swordTip,
  }) => {
    let attacking =
      false;


    let progress =
      0;


    const duration =
      500;


    const defaultRotation =
      swordPivot
        .rotation
        .clone();


    const trail =
      new TrailMesh(
        "remoteSwordTrail",
        swordTip,
        scene,
        0.12,
        20,
        true
      );


    const trailMaterial =
      new StandardMaterial(
        "remoteSwordTrailMaterial",
        scene
      );


    trailMaterial.emissiveColor =
      new Color3(
        0.75,
        0.9,
        1
      );


    trailMaterial.alpha =
      0.65;


    trail.material =
      trailMaterial;


    trail.setEnabled(
      false
    );


    let visible = true;

    const startAttack =
      () => {
        if (
          !visible || attacking
        ) {
          return;
        }


        attacking =
          true;


        progress =
          0;
      };


    const update =
      (
        deltaTime
      ) => {
        if (
          !attacking
        ) {
          return;
        }


        progress +=
          deltaTime /
          duration;


        /*
         * WINDUP
         */

        if (
          progress <
          0.25
        ) {
          const t =
            progress /
            0.25;


          swordPivot.rotation.x =
            lerp(
              defaultRotation.x,
              defaultRotation.x -
                0.9,
              t
            );


          swordPivot.rotation.y =
            lerp(
              defaultRotation.y,
              defaultRotation.y +
                0.65,
              t
            );


          swordPivot.rotation.z =
            lerp(
              defaultRotation.z,
              defaultRotation.z -
                0.35,
              t
            );


          trail.setEnabled(
            false
          );


          return;
        }


        /*
         * SLASH
         */

        if (
          progress <
          0.65
        ) {
          const t =
            (
              progress -
              0.25
            ) /
            0.4;


          trail.setEnabled(
            true
          );


          swordPivot.rotation.x =
            lerp(
              defaultRotation.x -
                0.9,
              defaultRotation.x +
                1.15,
              t
            );


          swordPivot.rotation.y =
            lerp(
              defaultRotation.y +
                0.65,
              defaultRotation.y -
                0.55,
              t
            );


          swordPivot.rotation.z =
            lerp(
              defaultRotation.z -
                0.35,
              defaultRotation.z +
                0.25,
              t
            );


          return;
        }


        /*
         * RECOVERY
         */

        const t =
          (
            progress -
            0.65
          ) /
          0.35;


        trail.setEnabled(
          false
        );


        swordPivot.rotation.x =
          lerp(
            defaultRotation.x +
              1.15,
            defaultRotation.x,
            t
          );


        swordPivot.rotation.y =
          lerp(
            defaultRotation.y -
              0.55,
            defaultRotation.y,
            t
          );


        swordPivot.rotation.z =
          lerp(
            defaultRotation.z +
              0.25,
            defaultRotation.z,
            t
          );


        if (
          progress >=
          1
        ) {
          attacking =
            false;


          progress =
            0;


          swordPivot
            .rotation
            .copyFrom(
              defaultRotation
            );


          trail.setEnabled(
            false
          );
        }
      };


    const destroy =
      () => {
        trail.dispose();


        trailMaterial.dispose();
      };


    return {
      setVisible(value) {
        visible = value;
        if (value) trail.start();
        else {
          trail.stop();
          attacking = false;
          progress = 0;
          trail.setEnabled(false);
          swordPivot.rotation.copyFrom(defaultRotation);
        }
      },
      startAttack,
      update,
      destroy,
    };
  };


/*
 * =========================================================
 * LOAD REMOTE PLAYER
 * =========================================================
 */

const createRemotePlayer =
  async (
    scene,
    sessionId,
    playerState
  ) => {
    /*
     * PLAYER
     */

    const character =
      await createKayKitCharacter({
        scene,
        gameClass: playerState.gameClass,

        appearance: {
          gender:
            playerState.gender ||
            "female",

          skinTone:
            playerState.skinTone ||
            "medium",

          bodyType:
            playerState.bodyType ||
            "medium",

          head:
            playerState.head ||
            "head1",
        },
      });


    const characterRoot = character.root;
    const swordVisible = getClassConfig(playerState.gameClass).swordVisible;
    const root = new TransformNode(`remote-player-${sessionId}`, scene);
    root.metadata = { remotePlayerId: sessionId };
    characterRoot.parent = root;
    characterRoot.position.set(0, 0, 0);


    const animations =
      createKayKitAnimationController(
        character
      );


    /*
     * NAMEPLATE
     */

    const getNameplateText =
      (
        playerName,
        level
      ) => {
        return `${playerName} (Level ${level})`;
      };


    const nameplate =
      createNameplate({
        scene,

        player:
          root,

        name:
          getNameplateText(
            playerState.name,
            playerState.currentLevel
          ),

        color:
          "#4ade80",

        y:
          -0.4,
      });


    /*
     * HEALTH BAR
     */

    const healthBar =
      createHealthBar({
        scene,

        player:
          root,
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
      swordResult.meshes[
        0
      ];


    const swordPivot =
      new TransformNode(
        `remote-sword-pivot-${sessionId}`,
        scene
      );


    const swordGrip =
      new TransformNode(
        `remote-sword-grip-${sessionId}`,
        scene
      );


    /*
     * The procedural character has
     * no skeleton anymore.
     *
     * Attach the sword directly to
     * the right arm pivot.
     */

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


    swordGrip.rotation.set(
      Math.PI /
        2,
      0,
      0
    );


    sword.scaling.setAll(
      0.7
    );


    sword.position.set(
      0,
      0,
      0
    );


    /*
     * SWORD TIP
     */

    const swordTip =
      MeshBuilder.CreateSphere(
        `remote-sword-tip-${sessionId}`,
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
     * COMBAT
     */

    const combat =
      createRemoteCombat({
        scene,
        swordPivot,
        swordTip,
      });

    const mount = await createHorseMount({ scene, parent: root, character });
    mount.setMounted(playerState.mounted);
    let alive = playerState.health > 0;
    swordPivot.setEnabled(alive && swordVisible);


    const targetPosition = Vector3.Zero();
    const visibility = createEntityVisibility({
      root, targetPosition, nameplate, healthBar,
      controllers: [animations, mount, combat], alive: () => alive,
    });

    return {
      visibility,
      root,
      character,

      nameplate,
      healthBar,

      sword,
      swordPivot,
      swordGrip,
      swordTip,

      animations,
      combat,
      mount,

      targetPosition,

      targetRotationY:
        0,

      movingUntil:
        0,


      setLevel(
        level
      ) {
        nameplate.setName(
          getNameplateText(
            playerState.name,
            level
          )
        );
      },


      setAlive(
        isAlive
      ) {
        alive = isAlive;
        if (!alive) mount.setMounted(false);
        swordPivot.setEnabled(
          alive && swordVisible
        );


        swordGrip.setEnabled(
          alive && swordVisible
        );


        sword.setEnabled(
          alive && swordVisible
        );


        swordTip.setEnabled(
          alive && swordVisible
        );


        visibility.apply();
      },

      setMounted(value) {
        mount.setMounted(alive && value);
      },


      destroy() {
        animations.destroy();


        combat.destroy();
        mount.destroy();


        nameplate.destroy();


        healthBar.destroy();


        swordTip.dispose();


        sword.dispose();


        swordGrip.dispose();


        swordPivot.dispose();


        root.dispose();
      },
    };
  };


/*
 * =========================================================
 * MULTIPLAYER
 * =========================================================
 */

export const createMultiplayer =
  async ({
    scene,
    player,
    onLocalHealthChange,
    onLocalBuffChange,
    onLocalRespawn,
    onHealCooldown,
    onBoarQuestChange,
    dungeonVisuals,
  }) => {
    const session = await getGameSession();
    const room = session.room;
    const dungeon = room !== session.worldRoom;
    const dungeonInteractions = createDungeonInteractions({ room, player, visuals: dungeonVisuals, dungeon });
    let destroyed = false;
    const disposers = [];
    const quality = scene.metadata?.quality || QUALITY_PRESETS.standard;
    const enemyVisibility = { ...ENTITY_VISIBILITY.enemy, enableDistance: quality.enemyDistance,
      disableDistance: quality.enemyDistance + 20, chunks: !dungeon, labelDistance: quality.labelDistance };
    const playerVisibility = { ...ENTITY_VISIBILITY.remotePlayer, enableDistance: quality.playerDistance,
      disableDistance: quality.playerDistance + 30, labelDistance: quality.labelDistance };
    let movementMessages = 0;
    let statePatches = 0;
    const countPatch = () => { statePatches++; };
    room.onStateChange(countPatch);
    disposers.push(() => room.onStateChange.remove(countPatch));
    const rawCallbacks = Callbacks.get(room);
    const callbacks = {};
    // Scene transitions detach only the listeners owned by this scene.
    for (const method of ["onAdd", "onRemove", "onChange", "listen"]) {
      callbacks[method] = (...args) => {
        const callback = args.pop();
        const stop = rawCallbacks[method](...args, (...values) => {
          if (destroyed) return;
          const result = callback(...values);
          result?.catch?.((error) => { if (!destroyed) console.error("[Multiplayer] Entity update failed", error); });
          return result;
        });
        disposers.push(stop);
        return stop;
      };
    }
    const onMessage = (type, callback) => {
      const stop = room.onMessage(type, callback);
      disposers.push(stop);
      return stop;
    };

    useChatStore.getState().connect(room.roomId, (text) => room.send("chat", text));
    onMessage("chatError", (message) => useChatStore.getState().setError(message));

    const loot = createLoot({ scene, room, callbacks, player });
    const projectiles = createProjectileVisuals(scene);
    const bossVisuals = createBossVisuals(scene);
    onMessage("movementCorrection", ({ x, y, z }) => {
      player.position.set(x, y + JUMP.groundY, z);
    });
    onMessage("respawn", ({ x, y, z, rotationY }) => {
      player.position.set(x, y + JUMP.groundY, z);
      player.rotation.y = rotationY;
      onLocalRespawn?.();
    });

    const remotePlayers =
      new Map();


    const enemies =
      new Map();


    let localPlayerState =
      null;


    const removedPlayers =
      new Set();


    /*
     * =========================================================
     * PLAYER JOIN
     * =========================================================
     */

    callbacks.onAdd(
      "players",
      async (
        playerState,
        sessionId
      ) => {
        /*
         * LOCAL PLAYER
         */

        if (
          sessionId ===
          room.sessionId
        ) {
          localPlayerState =
            playerState;
          player.position.set(playerState.x, playerState.y + JUMP.groundY, playerState.z);
          player.rotation.y = playerState.rotationY;


          /*
           * BOAR HUNT QUEST
           */

          onBoarQuestChange?.(
            playerState.boarQuestKills ??
            0
          );


          callbacks.listen(
            playerState,
            "boarQuestKills",
            () => {
              onBoarQuestChange?.(
                playerState.boarQuestKills ??
                0
              );
            }
          );


          useQuestStore.getState().setGiantKills(playerState.giantQuestKills ?? 0);
          callbacks.listen(playerState, "giantQuestKills", () => {
            useQuestStore.getState().setGiantKills(playerState.giantQuestKills ?? 0);
          });

          useQuestStore.getState().setWolfKills(playerState.wolfQuestKills ?? 0);
          callbacks.listen(playerState, "wolfQuestKills", () => {
            useQuestStore.getState().setWolfKills(playerState.wolfQuestKills ?? 0);
          });

          for (const [type, setter] of [
            ["goat", "setGoatKills"],
            ["rat", "setRatKills"],
            ["bee", "setBeeKills"],
          ]) {
            const field = HUNT_QUESTS[type].progressField;
            const syncKills = () => useQuestStore.getState()[setter](playerState[field] ?? 0);
            syncKills();
            callbacks.listen(playerState, field, syncKills);
          }

          /*
           * LEVEL UP
           */

          let previousLevel =
            playerState.currentLevel;


          callbacks.listen(
            playerState,
            "currentLevel",
            () => {
              const newLevel =
                playerState.currentLevel;


              if (
                newLevel >
                previousLevel
              ) {
                useLevelUpStore
                  .getState()
                  .showLevelUp(
                    newLevel
                  );
              }


              previousLevel =
                newLevel;
            }
          );


          /*
           * LOCAL HEALTH
           */

          onLocalHealthChange?.({
            health:
              playerState.health,

            maxHealth:
              playerState.maxHealth,
          });


          callbacks.listen(
            playerState,
            "health",
            () => {
              onLocalHealthChange?.({
                health:
                  playerState.health,

                maxHealth:
                  playerState.maxHealth,
              });
            }
          );

          callbacks.listen(
            playerState,
            "maxHealth",
            () => {
              onLocalHealthChange?.({
                health: playerState.health,
                maxHealth: playerState.maxHealth,
              });
            }
          );

          const syncPotionBuffs = () => onLocalBuffChange?.({
            speedPotionUntil: playerState.speedPotionUntil ?? 0,
            powerPotionUntil: playerState.powerPotionUntil ?? 0,
          });
          syncPotionBuffs();
          callbacks.listen(playerState, "speedPotionUntil", syncPotionBuffs);
          callbacks.listen(playerState, "powerPotionUntil", syncPotionBuffs);


          return;
        }


        /*
         * REMOTE PLAYER
         */

        removedPlayers.delete(
          sessionId
        );


        const entity =
          await createRemotePlayer(
            scene,
            sessionId,
            playerState
          );


        /*
         * Player may have left while
         * sword.glb was loading.
         */

        if (
          destroyed || removedPlayers.has(
            sessionId
          )
        ) {
          entity.destroy();


          return;
        }


        entity.root.position.set(
          playerState.x,
          playerState.y,
          playerState.z
        );


        entity.root.rotation.y =
          playerState.rotationY;


        entity.targetPosition.set(
          playerState.x,
          playerState.y,
          playerState.z
        );


        entity.targetRotationY =
          playerState.rotationY;


        entity.healthBar.setHealth(
          playerState.health,
          playerState.maxHealth
        );


        entity.setAlive(
          playerState.health >
            0 && !playerState.inDungeon
        );


        entity.playerState = playerState;
        entity.visibility.update(player.position, playerVisibility);

        remotePlayers.set(
          sessionId,
          entity
        );


        callbacks.listen(playerState, "inDungeon", () => {
          entity.setAlive(playerState.health > 0 && !playerState.inDungeon);
        });

        /*
         * HEALTH
         */

        callbacks.listen(
          playerState,
          "health",
          () => {
            const alive =
              playerState.health >
              0 && !playerState.inDungeon;


            entity.healthBar.setHealth(
              playerState.health,
              playerState.maxHealth
            );


            if (
              !alive
            ) {
              entity.setAlive(
                false
              );


              return;
            }


            /*
             * On respawn, snap the
             * remote player back to
             * the server position.
             */

            entity.root.position.set(
              playerState.x,
              playerState.y,
              playerState.z
            );


            entity.targetPosition.set(
              playerState.x,
              playerState.y,
              playerState.z
            );


            entity.root.rotation.y =
              playerState.rotationY;


            entity.targetRotationY =
              playerState.rotationY;


            entity.setAlive(
              true
            );
          }
        );


        callbacks.listen(
          playerState,
          "maxHealth",
          () => {
            entity.healthBar.setHealth(
              playerState.health,
              playerState.maxHealth
            );
          }
        );


        /*
         * LEVEL
         */

        callbacks.listen(
          playerState,
          "currentLevel",
          () => {
            entity.setLevel(
              playerState.currentLevel
            );
          }
        );


        /*
         * MOVEMENT
         */

        callbacks.onChange(
          playerState,
          () => {
            const remote =
              remotePlayers.get(
                sessionId
              );


            if (
              !remote
            ) {
              return;
            }

            remote.setMounted(playerState.mounted);


            /*
             * Only horizontal movement
             * triggers running.
             *
             * Y is used for jumping.
             */

            const horizontalPositionChanged =
              Math.abs(
                remote
                  .targetPosition
                  .x -
                  playerState.x
              ) >
                0.001 ||
              Math.abs(
                remote
                  .targetPosition
                  .z -
                  playerState.z
              ) >
                0.001;


            remote.targetPosition.set(
              playerState.x,
              playerState.y,
              playerState.z
            );


            remote.targetRotationY =
              playerState.rotationY;


            if (
              horizontalPositionChanged
            ) {
              remote.movingUntil =
                performance.now() +
                RUN_TIMEOUT;
            }


          }
        );
      }
    );


    /*
     * =========================================================
     * PLAYER LEAVE
     * =========================================================
     */

    callbacks.onRemove(
      "players",
      (
        _playerState,
        sessionId
      ) => {
        removedPlayers.add(
          sessionId
        );


        const entity =
          remotePlayers.get(
            sessionId
          );


        if (
          !entity
        ) {
          return;
        }


        entity.destroy();


        remotePlayers.delete(
          sessionId
        );

        useMinimapStore
          .getState()
          .removeRemotePlayer(
            sessionId
          );
      }
    );


    /*
     * =========================================================
     * HEAL COOLDOWN
     * =========================================================
     */

    onMessage("bossNotice", (text) => useBossNoticeStore.getState().show(text));
    onMessage("worldEventNotice", (text) => useBossNoticeStore.getState().show(text));

    onMessage("skillCooldown", ({ code, duration }) => {
      useActionBarStore.getState().setCooldown(code, duration);
    });

    onMessage(
      "healCooldown",
      ({
        duration,
      }) => {
        onHealCooldown?.(
          duration
        );
      }
    );


    /*
     * =========================================================
     * REMOTE ATTACK
     * =========================================================
     */

    onMessage(
      "attack",
      ({
        sessionId,
        projectile,
        effect,
      }) => {
        if (effect) {
          projectiles.spawn(effect);
          return;
        }
        if (projectile) {
          projectiles.spawn(projectile);
          return;
        }
        const entity =
          remotePlayers.get(
            sessionId
          );


        if (
          !entity
        ) {
          return;
        }


        entity.combat
          .startAttack();
      }
    );


    /*
     * =========================================================
     * ENEMY ATTACK
     * =========================================================
     */

    onMessage("projectileEnd", ({ id }) => projectiles.remove(id));

    onMessage(
      "enemyAttack",
      ({
        enemyId,
        targetSessionId,
      }) => {
        /*
         * Play attack animation
         * for everybody.
         */

        const enemy =
          enemies.get(
            enemyId
          );


        if (
          enemy
        ) {
          enemy.animations
            .attack();
        }


        /*
         * Only show combat feedback
         * if THIS client is the target.
         */

        if (
          targetSessionId !==
          room.sessionId
        ) {
          return;
        }


        useCombatStore
          .getState()
          .triggerCombat();
      }
    );


    /*
     * =========================================================
     * PLAYER HEAL EFFECT
     * =========================================================
     */

    onMessage(
      "playerHeal",
      ({
        sessionId,
      }) => {
        /*
         * LOCAL
         */

        if (
          sessionId ===
          room.sessionId
        ) {
          playHealEffect({
            scene,
            player,
          });


          return;
        }


        /*
         * REMOTE
         */

        const entity =
          remotePlayers.get(
            sessionId
          );


        if (
          !entity || !entity.visibility.isVisible()
        ) {
          return;
        }


        playHealEffect({
          scene,

          player:
            entity.root,
        });
      }
    );


    /*
     * =========================================================
     * LOCAL PLAYER SYNC
     * =========================================================
     */

    let sendAccumulator =
      0;


    /*
     * =========================================================
     * ENEMIES
     * =========================================================
     */

    callbacks.onAdd(
      "enemies",
      async (
        enemyState,
        enemyId
      ) => {
        const enemy =
          await createEnemy({
            scene,

            state:
              enemyState,

            id:
              enemyId,
          });


        /*
         * Enemy may have been
         * removed while loading.
         */

        if (
          destroyed || !room.state.enemies.has(
            enemyId
          )
        ) {
          enemy.destroy();


          return;
        }


        enemy.targetPosition.set(enemyState.x, enemyState.y, enemyState.z);
        enemy.setTargetRotation(enemyState.rotationY);
        enemy.visibility.update(player.position, enemyVisibility);

        enemies.set(
          enemyId,
          enemy
        );


        /*
         * MOVEMENT
         */

        callbacks.onChange(
          enemyState,
          () => {
            enemy.targetPosition.set(
              enemyState.x,
              enemyState.y,
              enemyState.z
            );

            enemy.setTargetRotation(
              enemyState.rotationY
            );


          }
        );


        /*
         * HEALTH
         */

        callbacks.listen(
          enemyState,
          "health",
          () => {
            enemy.setHealth(
              enemyState.health,
              enemyState.maxHealth
            );
          }
        );


        callbacks.listen(
          enemyState,
          "maxHealth",
          () => {
            enemy.setHealth(
              enemyState.health,
              enemyState.maxHealth
            );
          }
        );
      }
    );


    callbacks.onRemove(
      "enemies",
      (
        _enemyState,
        enemyId
      ) => {
        const enemy =
          enemies.get(
            enemyId
          );


        if (
          !enemy
        ) {
          return;
        }


        enemy.destroy();


        enemies.delete(
          enemyId
        );

        useMinimapStore
          .getState()
          .removeEnemy(
            enemyId
          );
      }
    );


    /*
     * =========================================================
     * SEND MOVEMENT
     * =========================================================
     */

    const sendMovement =
      (
        localPlayer,
        deltaTime,
        mounted = false,
        force = false
      ) => {
        if (!localPlayerState || localPlayerState.health <= 0) return;
        sendAccumulator +=
          deltaTime;


        if (
          !force && sendAccumulator <
          SEND_INTERVAL
        ) {
          return;
        }


        sendAccumulator =
          0;


        movementMessages++;
        room.send(
          "move",
          {
            x:
              localPlayer
                .position
                .x,

            y:
              localPlayer
                .position
                .y -
              JUMP.groundY,

            z:
              localPlayer
                .position
                .z,

            rotationY:
              localPlayer
                .rotation
                .y,

            mounted,
          }
        );
      };


    /*
     * =========================================================
     * REMOTE UPDATE
     * =========================================================
     */

    let visibilityElapsed = 0;
    let minimapElapsed = 0;
    const update =
      (
        deltaTime
      ) => {
        visibilityElapsed += deltaTime;
        minimapElapsed += deltaTime;
        if (visibilityElapsed >= ENTITY_VISIBILITY.updateInterval) {
          visibilityElapsed %= ENTITY_VISIBILITY.updateInterval;
          for (const entity of remotePlayers.values()) entity.visibility.update(player.position, playerVisibility);
          for (const enemy of enemies.values()) enemy.visibility.update(player.position, enemyVisibility);
        }
        if (minimapElapsed >= ENTITY_VISIBILITY.minimapInterval) {
          minimapElapsed %= ENTITY_VISIBILITY.minimapInterval;
          useMinimapStore.getState().syncEntities(room.state, room.sessionId);
          useWorldEventStore.getState().sync(room.state, room.sessionId);
        }
        dungeonInteractions.update(deltaTime);
        projectiles.update(deltaTime);
        bossVisuals.update(room.state.enemies, (id) => enemies.get(id)?.visibility.isVisible());
        useBossHealthStore.getState().sync(room.state, room.sessionId, player.position);
        useTargetStore.getState().sync(room.state);
        loot.update();
        if (!dungeon) {
          const area = getQuestArea(player.position);
          if (useQuestStore.getState().area !== area) useQuestStore.getState().setArea(area);
        }

        const smoothing =
          1 -
          Math.exp(
            -REMOTE_SMOOTHING *
              deltaTime /
              1000
          );


        const now =
          performance.now();


        /*
         * REMOTE PLAYERS
         */

        for (
          const entity
          of remotePlayers.values()
        ) {
          if (!entity.visibility.isVisible()) continue;
          /*
           * POSITION
           */

          Vector3.LerpToRef(
            entity.root.position,
            entity.targetPosition,
            smoothing,
            entity.root.position
          );


          /*
           * ROTATION
           */

          const angleDifference =
            normalizeAngle(
              entity
                .targetRotationY -
                entity.root
                  .rotation.y
            );


          entity.root.rotation.y +=
            angleDifference *
            smoothing;


          /*
           * JUMP
           */

          const isJumping =
            entity.targetPosition.y >
              JUMP_THRESHOLD ||
            entity.root.position.y >
              JUMP_THRESHOLD;


          entity.animations
            .setJumping(
              isJumping
            );


          /*
           * RUN / IDLE
           */

          entity.animations.setChatAnimation?.(entity.playerState?.chatAnimation || "");
          entity.animations
            .setRunning(
              !isJumping &&
              now <
                entity.movingUntil
            );

          entity.mount.setRunning(!isJumping && now < entity.movingUntil);


          /*
           * Procedural animations
           * require an update every
           * frame.
           */

          entity.animations
            .update(
              deltaTime
            );


          /*
           * REMOTE ATTACK
           */

          entity.combat
            .update(
              deltaTime
            );
        }


        /*
         * ENEMIES
         */

        for (
          const enemy
          of enemies.values()
        ) {
          if (!enemy.visibility.isVisible()) {
            enemy.visualElapsed = 0;
            continue;
          }
          enemy.visualElapsed += deltaTime;
          const interval = enemy.visibility.getDistanceSquared() <= ENTITY_VISIBILITY.nameplateDistance ** 2
            ? ENTITY_VISIBILITY.nearEnemyInterval : ENTITY_VISIBILITY.farEnemyInterval;
          if (enemy.visualElapsed < interval) continue;
          const enemySmoothing = 1 - Math.exp(-REMOTE_SMOOTHING * enemy.visualElapsed / 1000);
          enemy.visualElapsed = 0;
          const distance =
            Vector3.DistanceSquared(
              enemy.root.position,
              enemy.targetPosition
            );


          Vector3.LerpToRef(
            enemy.root.position,
            enemy.targetPosition,
            enemySmoothing,
            enemy.root.position
          );


          const difference =
            normalizeAngle(
              enemy
                .getTargetRotation() -
                enemy.root
                  .rotation.y
            );


          enemy.root.rotation.y +=
            difference *
            enemySmoothing;


          if (
            distance >
            0.03 ** 2
          ) {
            enemy.animations
              .walk();
          } else {
            enemy.animations
              .idle();
          }
        }
      };


    /*
     * =========================================================
     * SEND ATTACK
     * =========================================================
     */

    const sendAttack =
      (code = "Digit1") => {
        if (!localPlayerState || localPlayerState.health <= 0) return;
        room.send(
          "attack", code
        );
      };


    /*
     * =========================================================
     * SEND HEAL
     * =========================================================
     */

    const sendHeal =
      () => {
        if (!localPlayerState || localPlayerState.health <= 0) return;
        room.send(
          "heal"
        );
      };

    const equipItem = (itemId, slot) => {
      if (!localPlayerState || localPlayerState.health <= 0) return;
      room.send("equipItem", { itemId, slot });
    };

    const unequipItem = (slot) => {
      if (!localPlayerState || localPlayerState.health <= 0) return;
      room.send("unequipItem", slot);
    };

    const useConsumable = (itemId) => {
      if (!localPlayerState || localPlayerState.health <= 0) return;
      room.send("useConsumable", itemId);
    };


    /*
     * =========================================================
     * CLEANUP
     * =========================================================
     */

    const destroy =
      async ({ keepConnection = false } = {}) => {
        destroyed = true;
        for (const stop of disposers) stop();
        dungeonInteractions.destroy();
        projectiles.destroy();
        bossVisuals.destroy();
        useBossHealthStore.getState().reset();
        useTargetStore.getState().clear();
        useChatStore.getState().disconnect();
        useBossNoticeStore.getState().reset();
        useWorldEventStore.getState().reset();
        loot.destroy();
        useQuestStore.getState().reset();

        useCombatStore
          .getState()
          .resetCombat();


        for (
          const entity
          of remotePlayers.values()
        ) {
          entity.destroy();
        }


        remotePlayers.clear();


        for (
          const enemy
          of enemies.values()
        ) {
          enemy.destroy();
        }


        enemies.clear();

        useMinimapStore
          .getState()
          .reset();

        if (!keepConnection) await closeGameSession();
      };


    return {
      room,
      getChatAnimation: () => localPlayerState?.chatAnimation || "",
      getRemotePlayerName: (sessionId) => room.state.players.get(sessionId)?.name || "",
      getMovementSpeedMultiplier: () => localPlayerState?.movementSpeedMultiplier ?? 1,
      getEnemyId(mesh) {
        for (let node = mesh; node; node = node.parent) {
          const id = node.metadata?.enemyId;
          if (id && enemies.get(id)?.visibility.isVisible() && room.state.enemies.get(id)?.health > 0) return id;
        }
        return null;
      },
      getRemotePlayerId(mesh) {
        for (let node = mesh; node; node = node.parent) {
          const id = node.metadata?.remotePlayerId;
          if (id && remotePlayers.get(id)?.visibility.isVisible()) return room.state.players.get(id)?.worldSessionId || id;
        }
        return null;
      },
      getPerformanceStats() {
        let activeEnemies = 0;
        let activePlayers = 0;
        let nameplates = 0;
        for (const enemy of enemies.values()) {
          if (enemy.visibility.isVisible()) activeEnemies++;
          if (enemy.visibility.hasLabels()) nameplates++;
        }
        for (const entity of remotePlayers.values()) {
          if (entity.visibility.isVisible()) activePlayers++;
          if (entity.visibility.hasLabels()) nameplates++;
        }
        const projectileStats = projectiles.getStats();
        const bossStats = bossVisuals.getStats();
        const lootStats = loot.getStats();
        return { activeEnemies, enemies: enemies.size, activePlayers, players: remotePlayers.size, nameplates,
          projectiles: projectileStats.active, vfx: bossStats.active + lootStats.active,
          pooledVisuals: projectileStats.retained + bossStats.retained + lootStats.retained,
          createdVisuals: projectileStats.created + bossStats.created + lootStats.created,
          movementMessages, statePatches };
      },

      sendMovement,
      sendAttack,
      sendHeal,
      equipItem,
      unequipItem,
      useConsumable,
      collectLoot: loot.collect,
      interactDungeon: dungeonInteractions.interact,


      update,
      destroy,
    };
  };
