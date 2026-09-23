import "@babylonjs/loaders/glTF";

import {
  Callbacks,
  Client,
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
  Meteor,
} from "meteor/meteor";

import {
  ensureGuestUser,
} from "../auth/guest";

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
  createLowPolyCharacter,
} from "./character/createLowPolyCharacter";

import {
  createCharacterAnimationController,
} from "./character/createCharacterAnimationController";

import {
  useCombatStore,
} from "../ui/stores/useCombatStore";

const SERVER_URL =
  "ws://localhost:2567";

const SEND_INTERVAL =
  50;

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

const normalizeAngle = (
  angle
) => {
  while (
    angle > Math.PI
  ) {
    angle -=
      Math.PI * 2;
  }

  while (
    angle < -Math.PI
  ) {
    angle +=
      Math.PI * 2;
  }

  return angle;
};


const lerp = (
  from,
  to,
  progress
) => {
  return (
    from +
    (to - from) *
      progress
  );
};


/*
 * =========================================================
 * REMOTE SWORD COMBAT
 * =========================================================
 */

const createRemoteCombat = ({
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
    swordPivot.rotation.clone();


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


  const startAttack =
    () => {
      if (attacking) {
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
      if (!attacking) {
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

        swordPivot.rotation
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
      createLowPolyCharacter({
        scene,

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


    const root =
      character.root;


    const animations =
      createCharacterAnimationController(
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
      character.parts
        .rightArmPivot;

    swordPivot.position.set(
      0,
      -0.9,
      0
    );


    swordGrip.parent =
      swordPivot;

    sword.parent =
      swordGrip;


    swordGrip.rotation.set(
      Math.PI / 2,
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


    return {
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


      targetPosition:
        Vector3.Zero(),

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
        alive
      ) {
        root.setEnabled(
          alive
        );

        swordPivot.setEnabled(
          alive
        );

        swordGrip.setEnabled(
          alive
        );

        sword.setEnabled(
          alive
        );

        swordTip.setEnabled(
          alive
        );

        healthBar.setVisible(
          alive
        );
      },


      destroy() {
        animations.destroy();

        combat.destroy();

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
    onHealCooldown,
    onBoarQuestChange,
  }) => {
    await ensureGuestUser();


    const userId =
      Meteor.userId();


    console.log(
      "[Meteor] userId:",
      userId
    );


    const authToken =
      await Meteor.callAsync(
        "colyseus.authToken"
      );


    const client =
      new Client(
        SERVER_URL
      );


    client.auth.token =
      authToken;


    const room =
      await client.joinOrCreate(
        "world"
      );


    const callbacks =
      Callbacks.get(
        room
      );


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


          onBoarQuestChange?.(
            playerState.boarQuestKills
          );

          callbacks.listen(
            playerState,
            "boarQuestKills",
            () => {
              onBoarQuestChange?.(
                playerState.boarQuestKills
              );
            }
          );  

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
                health:
                  playerState.health,

                maxHealth:
                  playerState.maxHealth,
              });
            }
          );


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
          removedPlayers.has(
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
            0
        );


        remotePlayers.set(
          sessionId,
          entity
        );


        /*
         * HEALTH
         */

        callbacks.listen(
          playerState,
          "health",
          () => {
            const alive =
              playerState.health >
              0;


            entity.healthBar.setHealth(
              playerState.health,
              playerState.maxHealth
            );


            if (!alive) {
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


            if (!remote) {
              return;
            }


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


        if (!entity) {
          return;
        }


        entity.destroy();


        remotePlayers.delete(
          sessionId
        );
      }
    );


    /*
     * =========================================================
     * HEAL COOLDOWN
     * =========================================================
     */

    room.onMessage(
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

    room.onMessage(
      "attack",
      ({
        sessionId,
      }) => {
        const entity =
          remotePlayers.get(
            sessionId
          );


        if (!entity) {
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

    room.onMessage(
      "enemyAttack",
      ({
        enemyId,
        targetSessionId,
      }) => {
        /*
        * Play the attack animation
        * for everybody.
        */

        const enemy =
          enemies.get(
            enemyId
          );


        if (enemy) {
          enemy.animations.attack();
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

    room.onMessage(
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


        if (!entity) {
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


    const syncLocalPlayer =
      (
        localPlayer
      ) => {
        if (
          !localPlayerState
        ) {
          return;
        }


        /*
         * Detect server-side
         * respawn.
         */

        if (
          localPlayerState.health ===
            localPlayerState.maxHealth &&

          Math.abs(
            localPlayerState.x
          ) <
            0.001 &&

          Math.abs(
            localPlayerState.z
          ) <
            0.001 &&

          (
            Math.abs(
              localPlayer.position.x
            ) >
              1 ||

            Math.abs(
              localPlayer.position.z
            ) >
              1
          )
        ) {
          localPlayer.position.set(
            localPlayerState.x,
            localPlayerState.y,
            localPlayerState.z
          );


          localPlayer.rotation.y =
            localPlayerState.rotationY;
        }
      };


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
          !room.state.enemies.has(
            enemyId
          )
        ) {
          enemy.destroy();

          return;
        }


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


        if (!enemy) {
          return;
        }


        enemy.destroy();


        enemies.delete(
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
        deltaTime
      ) => {
        sendAccumulator +=
          deltaTime;


        if (
          sendAccumulator <
          SEND_INTERVAL
        ) {
          return;
        }


        sendAccumulator =
          0;


        room.send(
          "move",
          {
            x:
              localPlayer
                .position.x,

            y:
              localPlayer
                .position.y,

            z:
              localPlayer
                .position.z,

            rotationY:
              localPlayer
                .rotation.y,
          }
        );
      };


    /*
     * =========================================================
     * REMOTE UPDATE
     * =========================================================
     */

    const update =
      (
        deltaTime
      ) => {
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

          entity.animations
            .setRunning(
              !isJumping &&
              now <
                entity.movingUntil
            );


          /*
           * Procedural animations
           * require an update every
           * frame.
           */

          entity.animations.update(
            deltaTime
          );


          /*
           * REMOTE ATTACK
           */

          entity.combat.update(
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
          const distance =
            Vector3.Distance(
              enemy.root.position,
              enemy.targetPosition
            );


          Vector3.LerpToRef(
            enemy.root.position,
            enemy.targetPosition,
            smoothing,
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
            smoothing;


          if (
            distance >
            0.03
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
      () => {
        room.send(
          "attack"
        );
      };


    /*
     * =========================================================
     * SEND HEAL
     * =========================================================
     */

    const sendHeal =
      () => {
        room.send(
          "heal"
        );
      };


    /*
     * =========================================================
     * CLEANUP
     * =========================================================
     */

    const destroy =
      async () => {
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


        await room.leave();
      };


    return {
      room,

      sendMovement,
      sendAttack,
      sendHeal,

      syncLocalPlayer,

      update,
      destroy,
    };
  };