import "@babylonjs/loaders/glTF";

import {
  Callbacks,
  Client,
} from "@colyseus/sdk";

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
  Color3,
  MeshBuilder,
  SceneLoader,
  StandardMaterial,
  TrailMesh,
  TransformNode,
  Vector3,
} from "@babylonjs/core";

const SERVER_URL =
  "ws://localhost:2567";

const SEND_INTERVAL =
  50;

const REMOTE_SMOOTHING =
  12;

const RUN_TIMEOUT =
  150;

/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

const findAnimation = (
  animationGroups,
  names
) => {
  const searchNames =
    names.map(
      (name) =>
        name.toLowerCase()
    );

  return animationGroups.find(
    (animation) => {
      const animationName =
        animation.name.toLowerCase();

      return searchNames.some(
        (name) =>
          animationName.includes(
            name
          )
      );
    }
  );
};

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
 * ANIMATION CONTROLLER
 * =========================================================
 */

const createAnimationController = (
  animationGroups
) => {
  const idle =
    findAnimation(
      animationGroups,
      ["idle"]
    );

  const run =
    findAnimation(
      animationGroups,
      ["run", "running"]
    );

  let currentAnimation =
    null;

  const play = (
    animation
  ) => {
    if (
      !animation ||
      currentAnimation === animation
    ) {
      return;
    }

    currentAnimation?.stop();

    animation.start(
      true
    );

    currentAnimation =
      animation;
  };

  play(
    idle
  );

  return {
    setRunning(
      running
    ) {
      play(
        running
          ? run
          : idle
      );
    },

    destroy() {
      idle?.stop();
      run?.stop();
    },
  };
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
  let attacking = false;
  let progress = 0;

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

      attacking = true;
      progress = 0;
    };

  const update = (
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
    if (progress < 0.25) {
      const t =
        progress / 0.25;

      swordPivot.rotation.x =
        lerp(
          defaultRotation.x,
          defaultRotation.x - 0.9,
          t
        );

      swordPivot.rotation.y =
        lerp(
          defaultRotation.y,
          defaultRotation.y + 0.65,
          t
        );

      swordPivot.rotation.z =
        lerp(
          defaultRotation.z,
          defaultRotation.z - 0.35,
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
    if (progress < 0.65) {
      const t =
        (progress - 0.25) /
        0.4;

      trail.setEnabled(
        true
      );

      swordPivot.rotation.x =
        lerp(
          defaultRotation.x - 0.9,
          defaultRotation.x + 1.15,
          t
        );

      swordPivot.rotation.y =
        lerp(
          defaultRotation.y + 0.65,
          defaultRotation.y - 0.55,
          t
        );

      swordPivot.rotation.z =
        lerp(
          defaultRotation.z - 0.35,
          defaultRotation.z + 0.25,
          t
        );

      return;
    }

    /*
     * RECOVERY
     */
    const t =
      (progress - 0.65) /
      0.35;

    trail.setEnabled(
      false
    );

    swordPivot.rotation.x =
      lerp(
        defaultRotation.x + 1.15,
        defaultRotation.x,
        t
      );

    swordPivot.rotation.y =
      lerp(
        defaultRotation.y - 0.55,
        defaultRotation.y,
        t
      );

    swordPivot.rotation.z =
      lerp(
        defaultRotation.z + 0.25,
        defaultRotation.z,
        t
      );

    if (progress >= 1) {
      attacking = false;
      progress = 0;

      swordPivot.rotation.copyFrom(
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
    sessionId
  ) => {
    const root =
      new TransformNode(
        `remote-player-${sessionId}`,
        scene
      );

    const healthBar =
      createHealthBar({
        scene,
        player: root,
      });

    /*
     * PLAYER MODEL
     */

    const playerResult =
      await SceneLoader.ImportMeshAsync(
        "",
        "/models/",
        "player.glb",
        scene
      );

    const model =
      playerResult.meshes[0];

    model.parent =
      root;

    const skeleton =
      playerResult.skeletons[0];

    const skinnedMesh =
      playerResult.meshes.find(
        (mesh) =>
          mesh.skeleton === skeleton
      );

    const animations =
      createAnimationController(
        playerResult.animationGroups
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

    const rightHandBone =
      findRightHandBone(
        skeleton
      );

    if (
      rightHandBone &&
      skinnedMesh
    ) {
      swordPivot.attachToBone(
        rightHandBone,
        skinnedMesh
      );

      swordGrip.parent =
        swordPivot;

      sword.parent =
        swordGrip;
    } else {
      console.warn(
        "Remote sword could not find right hand bone."
      );
    }

    /*
     * Same rough hand alignment
     * as local player.
     *
     * Adjust if needed.
     */

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
          diameter: 0.03,
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
     * REMOTE COMBAT
     */

    const combat =
      createRemoteCombat({
        scene,
        swordPivot,
        swordTip,
      });

    return {
      root,
      model,

      healthBar,

      animations,
      combat,

      targetPosition:
        Vector3.Zero(),

      targetRotationY:
        0,

      movingUntil:
        0,

      destroy() {
        healthBar.destroy();

        animations.destroy();
        combat.destroy();

        swordTip?.dispose();
        sword?.dispose();

        swordGrip?.dispose();
        swordPivot?.dispose();

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
    onLocalHealthChange,
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

    let localPlayerState =
      null;

    const removedPlayers =
      new Set();

    /*
     * PLAYER JOIN
     */

    callbacks.onAdd(
      "players",
      async (
        playerState,
        sessionId
      ) => {
        if (
          sessionId ===
          room.sessionId
        ) {
          localPlayerState =
            playerState;

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

          return;
        }

        removedPlayers.delete(
          sessionId
        );

        const entity =
          await createRemotePlayer(
            scene,
            sessionId
          );

        entity.healthBar.setHealth(
          playerState.health,
          playerState.maxHealth
        );

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

        remotePlayers.set(
          sessionId,
          entity
        );

        callbacks.listen(
          playerState,
          "health",
          () => {
            entity.healthBar.setHealth(
              playerState.health,
              playerState.maxHealth
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

            const positionChanged =
              Math.abs(
                remote.targetPosition.x -
                  playerState.x
              ) > 0.001 ||
              Math.abs(
                remote.targetPosition.y -
                  playerState.y
              ) > 0.001 ||
              Math.abs(
                remote.targetPosition.z -
                  playerState.z
              ) > 0.001;

            remote.targetPosition.set(
              playerState.x,
              playerState.y,
              playerState.z
            );

            remote.targetRotationY =
              playerState.rotationY;

            if (
              positionChanged
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
     * PLAYER LEAVE
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
     * REMOTE ATTACK
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

        entity.combat.startAttack();
      }
    );

    /*
     * LOCAL MOVEMENT SEND
     */

    let sendAccumulator =
      0;

    const syncLocalPlayer = (
      player
    ) => {
      if (!localPlayerState) {
        return;
      }

      /*
      * Detect server-side respawn.
      *
      * If server put us back at spawn
      * while client is far away,
      * accept server position.
      */
      if (
        localPlayerState.health ===
          localPlayerState.maxHealth &&
        Math.abs(
          localPlayerState.x
        ) < 0.001 &&
        Math.abs(
          localPlayerState.z
        ) < 0.001 &&
        (
          Math.abs(
            player.position.x
          ) > 1 ||
          Math.abs(
            player.position.z
          ) > 1
        )
      ) {
        player.position.set(
          localPlayerState.x,
          localPlayerState.y,
          localPlayerState.z
        );

        player.rotation.y =
          localPlayerState.rotationY;
      }
    };

    const sendMovement = (
      player,
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

      sendAccumulator = 0;

      room.send(
        "move",
        {
          x:
            player.position.x,

          y:
            player.position.y,

          z:
            player.position.z,

          rotationY:
            player.rotation.y,
        }
      );
    };

    /*
     * REMOTE UPDATE
     */

    const update = (
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
            entity.targetRotationY -
              entity.root.rotation.y
          );

        entity.root.rotation.y +=
          angleDifference *
          smoothing;

        /*
         * IDLE / RUN
         */

        entity.animations.setRunning(
          now <
            entity.movingUntil
        );

        /*
         * REMOTE ATTACK
         */

        entity.combat.update(
          deltaTime
        );
      }
    };

    /*
     * SEND ATTACK
     */

    const sendAttack =
      () => {
        room.send(
          "attack"
        );
      };

    /*
     * CLEANUP
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

        await room.leave();
      };

    return {
      room,

      sendMovement,
      sendAttack,
      syncLocalPlayer,

      update,
      destroy,
    };
  };