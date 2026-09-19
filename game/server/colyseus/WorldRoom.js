import {
  Room,
} from "colyseus";
import jwt from "jsonwebtoken";

import {
  PlayerState,
  WorldState,
} from "./WorldState";

export class WorldRoom extends Room {
  /*
   * Synchronized state.
   */
  state =
    new WorldState();

  respawnPlayer(
    player
  ) {
    player.x = 0;
    player.y = 0;
    player.z = 0;

    player.rotationY = 0;

    player.health =
      player.maxHealth;
  }

  static async onAuth(
    token,
    options,
    context
  ) {
    const secret =
      process.env
        .COLYSEUS_AUTH_SECRET ||
      "neverfall-development-secret";

    try {
      const payload =
        jwt.verify(
          token,
          secret,
          {
            issuer:
              "neverfall-meteor",
          }
        );

      if (!payload.userId) {
        return false;
      }

      return {
        userId:
          payload.userId,
      };
    } catch (error) {
      console.error(
        "[Colyseus] Invalid auth token"
      );

      return false;
    }
  }

  /*
   * Client messages.
   */
  messages = {
    /*
     * Player sends its current
     * Babylon position.
     */
    move: (
      client,
      data
    ) => {
      const player =
        this.state.players.get(
          client.sessionId
        );

      if (!player) {
        return;
      }

      /*
       * Very basic validation.
       */
      if (
        !Number.isFinite(
          data.x
        ) ||
        !Number.isFinite(
          data.y
        ) ||
        !Number.isFinite(
          data.z
        ) ||
        !Number.isFinite(
          data.rotationY
        )
      ) {
        return;
      }

      player.x =
        data.x;

      player.y =
        data.y;

      player.z =
        data.z;

      player.rotationY =
        data.rotationY;
    },

    /*
     * Optional:
     * basic attack event.
     *
     * Doesn't belong in persistent
     * state because it's a one-time
     * event.
     */
    attack: (
      client
    ) => {
      const attacker =
        this.state.players.get(
          client.sessionId
        );

      if (!attacker) {
        return;
      }

      const ATTACK_RANGE =
        2.5;

      const DAMAGE =
        25;

      let target =
        null;

      let targetSessionId =
        null;

      let closestDistance =
        Infinity;

      /*
      * Find closest living
      * player in attack range.
      */
      this.state.players.forEach(
        (
          player,
          sessionId
        ) => {
          if (
            sessionId ===
            client.sessionId
          ) {
            return;
          }

          if (
            player.health <= 0
          ) {
            return;
          }

          const dx =
            player.x -
            attacker.x;

          const dy =
            player.y -
            attacker.y;

          const dz =
            player.z -
            attacker.z;

          const distance =
            Math.sqrt(
              dx * dx +
              dy * dy +
              dz * dz
            );

          if (
            distance >
            ATTACK_RANGE
          ) {
            return;
          }

          if (
            distance <
            closestDistance
          ) {
            closestDistance =
              distance;

            target =
              player;

            targetSessionId =
              sessionId;
          }
        }
      );

      /*
      * Server changes health.
      *
      * Colyseus then automatically
      * synchronizes it.
      */
      if (
        target &&
        targetSessionId
      ) {
        target.health =
          Math.max(
            0,
            target.health -
              DAMAGE
          );

        if (
          target.health <= 0
        ) {
          const deadSessionId =
            targetSessionId;

          setTimeout(
            () => {
              const deadPlayer =
                this.state.players.get(
                  deadSessionId
                );

              /*
              * Player may have disconnected.
              */
              if (!deadPlayer) {
                return;
              }

              this.respawnPlayer(
                deadPlayer
              );
            },
            2000
          );
        }
      }

      /*
      * Existing visual attack
      * event for remote clients.
      */
      this.broadcast(
        "attack",
        {
          sessionId:
            client.sessionId,
        },
        {
          except: client,
        }
      );
    },
  };

  onJoin(
    client,
    options,
    auth
  ) {
    const userId =
      auth.userId;

    console.log(
      `[Colyseus] user ${userId} joined world`
    );

    console.log(
      `[Colyseus] session ${client.sessionId}`
    );

    const player =
      new PlayerState({
        userId,

        x: 0,
        y: 0,
        z: 0,

        rotationY: 0,

        health: 100,
        maxHealth: 100,
      });

    /*
    * Continue using sessionId
    * as map key.
    *
    * More on why below.
    */
    this.state.players.set(
      client.sessionId,
      player
    );
  }

  /*
   * Player leaves.
   */
  onLeave(
    client
  ) {
    console.log(
      `[Colyseus] ${client.sessionId} left world`
    );

    this.state.players.delete(
      client.sessionId
    );
  }
}