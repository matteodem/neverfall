import {
  Room,
} from "colyseus";

import jwt from "jsonwebtoken";

import {
  EnemyState,
  PlayerState,
  WorldState,
} from "./WorldState";

const ENEMY_ID =
  "training-enemy";

const ENEMY_SPAWN = {
  x: 0,
  y: 0,
  z: 5,
};

const ENEMY = {
  health: 100,
  speed: 2,

  attackDamage: 20,
  attackRange: 1.8,
  attackCooldown: 1000,

  respawnDelay: 2000,
};

const HEAL_AMOUNT =
  50;

const PLAYER_RESPAWN_DELAY =
  2000;

export class WorldRoom extends Room {
  state =
    new WorldState();

  /*
   * Runtime-only enemy data.
   *
   * This does not need to be
   * synchronized to clients.
   */
  enemyRuntime =
    new Map();

  static async onAuth(
    token
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
    } catch {
      return false;
    }
  }

  onCreate() {
    this.spawnEnemy();

    /*
     * Server-side enemy AI.
     */
    this.setTimestep(
      (deltaTime) => {
        this.updateEnemy(
          deltaTime
        );
      },
      50
    );
  }

  /*
   * =====================================================
   * MESSAGES
   * =====================================================
   */

  messages = {
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

      if (
        !Number.isFinite(data.x) ||
        !Number.isFinite(data.y) ||
        !Number.isFinite(data.z) ||
        !Number.isFinite(
          data.rotationY
        )
      ) {
        return;
      }

      player.x = data.x;
      player.y = data.y;
      player.z = data.z;

      player.rotationY =
        data.rotationY;
    },

    heal: (
      client
    ) => {
      const player =
        this.state.players.get(
          client.sessionId
        );

      if (
        !player ||
        player.health <= 0
      ) {
        return;
      }

      /*
      * Already full health.
      */
      if (
        player.health >=
        player.maxHealth
      ) {
        return;
      }

      player.health =
        Math.min(
          player.maxHealth,
          player.health +
            HEAL_AMOUNT
        );

      /*
      * Visual effect for
      * every connected client.
      */
      this.broadcast(
        "playerHeal",
        {
          sessionId:
            client.sessionId,
        }
      );
    },

    attack: (
      client
    ) => {
      /*
       * Visual sword attack for
       * other players.
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

      /*
       * Actual damage is decided
       * server-side.
       */
      this.attackEnemy(
        client.sessionId
      );
    },
  };

  /*
   * =====================================================
   * PLAYERS
   * =====================================================
   */

  onJoin(
    client,
    options,
    auth
  ) {
    const player =
      new PlayerState({
        userId:
          auth.userId,

        x: 0,
        y: 0,
        z: 0,

        rotationY: 0,

        health: 100,
        maxHealth: 100,
      });

    this.state.players.set(
      client.sessionId,
      player
    );
  }

  onLeave(
    client
  ) {
    this.state.players.delete(
      client.sessionId
    );

    /*
     * Remove aggro if enemy was
     * chasing this player.
     */
    const runtime =
      this.enemyRuntime.get(
        ENEMY_ID
      );

    if (
      runtime?.targetSessionId ===
      client.sessionId
    ) {
      runtime.targetSessionId =
        null;
    }
  }

  damagePlayer(
    sessionId,
    damage
  ) {
    const player =
      this.state.players.get(
        sessionId
      );

    if (
      !player ||
      player.health <= 0
    ) {
      return;
    }

    player.health =
      Math.max(
        0,
        player.health -
          damage
      );

    if (
      player.health > 0
    ) {
      return;
    }

    /*
     * Respawn player.
     */

    this.clock.setTimeout(
      () => {
        const currentPlayer =
          this.state.players.get(
            sessionId
          );

        if (
          !currentPlayer ||
          currentPlayer.health > 0
        ) {
          return;
        }

        this.respawnPlayer(
          currentPlayer
        );
      },
      PLAYER_RESPAWN_DELAY
    );
  }

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

  /*
   * =====================================================
   * ENEMY
   * =====================================================
   */

  spawnEnemy() {
    /*
     * Don't spawn two.
     */
    if (
      this.state.enemies.has(
        ENEMY_ID
      )
    ) {
      return;
    }

    const enemy =
      new EnemyState({
        x:
          ENEMY_SPAWN.x,

        y:
          ENEMY_SPAWN.y,

        z:
          ENEMY_SPAWN.z,

        rotationY: Math.PI,

        health:
          ENEMY.health,

        maxHealth:
          ENEMY.health,
      });

    this.state.enemies.set(
      ENEMY_ID,
      enemy
    );

    this.enemyRuntime.set(
      ENEMY_ID,
      {
        targetSessionId:
          null,

        nextAttackAt:
          0,
      }
    );
  }

  attackEnemy(
    sessionId
  ) {
    const player =
      this.state.players.get(
        sessionId
      );

    const enemy =
      this.state.enemies.get(
        ENEMY_ID
      );

    if (
      !player ||
      !enemy ||
      enemy.health <= 0
    ) {
      return;
    }

    const distance =
      this.getDistance(
        player,
        enemy
      );

    /*
     * Same approximate range
     * as our sword attack.
     */
    if (
      distance > 2.5
    ) {
      return;
    }

    const runtime =
      this.enemyRuntime.get(
        ENEMY_ID
      );

    /*
     * Enemy only aggroes after
     * somebody attacks it.
     */
    runtime.targetSessionId =
      sessionId;

    enemy.health =
      Math.max(
        0,
        enemy.health - 25
      );

    if (
      enemy.health <= 0
    ) {
      this.killEnemy();
    }
  }

  killEnemy() {
    this.state.enemies.delete(
      ENEMY_ID
    );

    this.enemyRuntime.delete(
      ENEMY_ID
    );

    /*
     * Colyseus clock automatically
     * belongs to this room.
     */
    this.clock.setTimeout(
      () => {
        this.spawnEnemy();
      },
      ENEMY.respawnDelay
    );
  }

  /*
   * =====================================================
   * ENEMY AI
   * =====================================================
   */

  updateEnemy(
    deltaTime
  ) {
    const enemy =
      this.state.enemies.get(
        ENEMY_ID
      );

    const runtime =
      this.enemyRuntime.get(
        ENEMY_ID
      );

    /*
     * No enemy or no aggro:
     * do absolutely nothing.
     */
    if (
      !enemy ||
      !runtime?.targetSessionId
    ) {
      return;
    }

    const target =
      this.state.players.get(
        runtime.targetSessionId
      );

    /*
     * Target left or died.
     */
    if (
      !target ||
      target.health <= 0
    ) {
      runtime.targetSessionId =
        null;

      return;
    }

    const dx =
      target.x -
      enemy.x;

    const dz =
      target.z -
      enemy.z;

    const distance =
      Math.sqrt(
        dx * dx +
        dz * dz
      );

    /*
     * Face player.
     */
    enemy.rotationY =
      Math.atan2(
        dx,
        dz
      );

    /*
     * Chase until melee range.
     */
    if (
      distance >
      ENEMY.attackRange
    ) {
      const length =
        Math.max(
          distance,
          0.001
        );

      const movement =
        ENEMY.speed *
        (deltaTime / 1000);

      enemy.x +=
        (dx / length) *
        movement;

      enemy.z +=
        (dz / length) *
        movement;

      return;
    }

    /*
     * Melee attack.
     */

    const now =
      Date.now();

    if (
      now <
      runtime.nextAttackAt
    ) {
      return;
    }

    runtime.nextAttackAt =
      now +
      ENEMY.attackCooldown;

    this.broadcast(
      "enemyAttack",
      {
        enemyId:
          ENEMY_ID,
      }
    );

    this.damagePlayer(
      runtime.targetSessionId,
      ENEMY.attackDamage
    );
  }

  getDistance(
    a,
    b
  ) {
    const dx =
      a.x - b.x;

    const dy =
      a.y - b.y;

    const dz =
      a.z - b.z;

    return Math.sqrt(
      dx * dx +
      dy * dy +
      dz * dz
    );
  }
}