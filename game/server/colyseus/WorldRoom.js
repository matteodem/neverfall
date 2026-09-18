import {
  Room,
} from "colyseus";

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

  /*
   * New player joins.
   */
  onJoin(
    client
  ) {
    console.log(
      `[Colyseus] ${client.sessionId} joined world`
    );

    const player =
      new PlayerState({
        x: 0,
        y: 0,
        z: 0,

        rotationY: 0,
      });

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