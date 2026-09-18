import {
  Callbacks,
  Client,
} from "@colyseus/sdk";

import {
  Color3,
  MeshBuilder,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";

const SERVER_URL =
  "ws://localhost:2567";

const SEND_INTERVAL =
  50;

const createRemotePlayer = (
  scene
) => {
  const mesh =
    MeshBuilder.CreateCapsule(
      "remotePlayer",
      {
        height: 2,
        radius: 0.5,
      },
      scene
    );

  const material =
    new StandardMaterial(
      "remotePlayerMaterial",
      scene
    );

  material.diffuseColor =
    new Color3(
      1,
      0.5,
      0.1
    );

  mesh.material =
    material;

  return mesh;
};

export const createMultiplayer =
  async ({
    scene,
  }) => {
    /*
     * Connect to Colyseus.
     */

    const client =
      new Client(
        SERVER_URL
      );

    const room =
      await client.joinOrCreate(
        "world"
      );

    const callbacks =
      Callbacks.get(
        room
      );

    console.log(
      "[Colyseus] joined world:",
      room.sessionId
    );

    /*
     * sessionId -> entity
     */
    const remotePlayers =
      new Map();

    /*
     * ===================================================
     * PLAYER ADDED
     * ===================================================
     */

    callbacks.onAdd(
      "players",
      (
        playerState,
        sessionId
      ) => {
        /*
         * Don't create a second mesh
         * for ourselves.
         */
        if (
          sessionId ===
          room.sessionId
        ) {
          return;
        }

        const mesh =
          createRemotePlayer(
            scene
          );

        mesh.position.set(
          playerState.x,
          playerState.y + 1,
          playerState.z
        );

        mesh.rotation.y =
          playerState.rotationY;

        const entity = {
          mesh,

          targetPosition:
            new Vector3(
              playerState.x,
              playerState.y + 1,
              playerState.z
            ),

          targetRotationY:
            playerState.rotationY,
        };

        remotePlayers.set(
          sessionId,
          entity
        );

        /*
         * Listen for server-side
         * position changes.
         */

        callbacks.onChange(
          playerState,
          () => {
            entity.targetPosition.set(
              playerState.x,
              playerState.y + 1,
              playerState.z
            );

            entity.targetRotationY =
              playerState.rotationY;
          }
        );
      }
    );

    /*
     * ===================================================
     * PLAYER REMOVED
     * ===================================================
     */

    callbacks.onRemove(
      "players",
      (
        _playerState,
        sessionId
      ) => {
        const entity =
          remotePlayers.get(
            sessionId
          );

        if (!entity) {
          return;
        }

        entity.mesh.dispose();

        remotePlayers.delete(
          sessionId
        );
      }
    );

    /*
     * ===================================================
     * REMOTE ATTACK EVENT
     * ===================================================
     *
     * Super simple visual for now:
     * make the remote player briefly
     * "punch" forward via scaling.
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

        entity.mesh.scaling.z =
          1.25;

        setTimeout(
          () => {
            if (
              !entity.mesh.isDisposed()
            ) {
              entity.mesh.scaling.z =
                1;
            }
          },
          120
        );
      }
    );

    /*
     * ===================================================
     * LOCAL POSITION SENDING
     * ===================================================
     */

    let sendAccumulator = 0;

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
     * ===================================================
     * REMOTE INTERPOLATION
     * ===================================================
     */

    const update =
      (
        deltaTime
      ) => {
        /*
         * Frame-rate independent
         * smoothing.
         */
        const smoothing =
          1 -
          Math.exp(
            -12 *
              deltaTime /
              1000
          );

        for (
          const entity
          of remotePlayers.values()
        ) {
          Vector3.LerpToRef(
            entity.mesh.position,
            entity.targetPosition,
            smoothing,
            entity.mesh.position
          );

          /*
           * Simple rotation smoothing.
           */

          entity.mesh.rotation.y +=
            (
              entity.targetRotationY -
              entity.mesh.rotation.y
            ) *
            smoothing;
        }
      };

    /*
     * ===================================================
     * ATTACK
     * ===================================================
     */

    const sendAttack =
      () => {
        room.send(
          "attack"
        );
      };

    /*
     * ===================================================
     * CLEANUP
     * ===================================================
     */

    const destroy =
      async () => {
        for (
          const entity
          of remotePlayers.values()
        ) {
          entity.mesh.dispose();
        }

        remotePlayers.clear();

        await room.leave();
      };

    return {
      room,

      sendMovement,
      sendAttack,

      update,
      destroy,
    };
  };