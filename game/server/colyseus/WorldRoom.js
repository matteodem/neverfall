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