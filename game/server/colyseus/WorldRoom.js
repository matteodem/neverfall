import {
  Meteor,
} from "meteor/meteor";

import {
  Room,
} from "colyseus";

import jwt from "jsonwebtoken";

import {
  EnemyState,
  PlayerState,
  WorldState,
} from "./WorldState";

import {
  Characters,
} from "../../imports/api/characters/characters";

import {
  addXpToProgress,
} from "../../imports/game/xp";

const ENEMY_ID =
  "training-enemy";

const ENEMY_SPAWN = {
  x: 0,
  y: 0,
  z: 5,
};

const ENEMY = {
  health: 100,

  level: 1,

  xpReward: 20,

  speed: 2,

  attackDamage: 20,
  attackRange: 1.8,
  attackCooldown: 1000,

  respawnDelay: 2000,

  wanderRadius: 3,
  wanderWait: 1500,
};

const HEAL_AMOUNT =
  50;

const HEAL_COOLDOWN =
  15000;

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

  playerRuntime =
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

      if (
        !payload.userId ||
        !payload.characterId
      ) {
        return false;
      }

      return {
        userId:
          payload.userId,

        characterId:
          payload.characterId,

        characterName:
          payload.characterName,
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

      const runtime =
        this.playerRuntime.get(
          client.sessionId
        );

      if (
        !player ||
        !runtime ||
        player.health <= 0
      ) {
        return;
      }

      const now =
        Date.now();

      if (
        now <
        runtime.healAvailableAt
      ) {
        return;
      }

      if (
        player.health >=
        player.maxHealth
      ) {
        return;
      }

      player.health =
        Math.min(
          player.maxHealth,
          player.health + 30
        );

      runtime.healAvailableAt =
        now + 15000;

      client.send(
        "healCooldown",
        {
          duration: 15000,
        }
      );

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

  async awardXp(
    characterId,
    amount
  ) {
    const character =
      await Characters.findOneAsync(
        characterId
      );

    if (!character) {
      return;
    }

    const progress =
      addXpToProgress({
        currentLevel:
          character.currentLevel,

        currentXp:
          character.currentXp,

        gainedXp:
          amount,
      });

    await Characters.updateAsync(
      characterId,
      {
        $set: {
          currentLevel:
            progress.currentLevel,

          currentXp:
            progress.currentXp,
        },
      }
    );

    /*
    * Update online Colyseus player
    * immediately as well.
    */
    for (
      const player
      of this.state.players.values()
    ) {
      if (
        player.characterId !==
        characterId
      ) {
        continue;
      }

      player.currentLevel =
        progress.currentLevel;

      player.currentXp =
        progress.currentXp;
    }
  }

  async onJoin(
    client,
    options,
    auth
  ) {
    const character =
      await Characters.findOneAsync({
        _id:
          auth.characterId,

        userId:
          auth.userId,
      });

    if (!character) {
      throw new Error(
        "Character not found"
      );
    }

    const player =
      new PlayerState({
        userId:
          auth.userId,

        characterId:
          character._id,

        name:
          character.name,

        currentLevel:
          character.currentLevel ??
          1,

        currentXp:
          character.currentXp ??
          0,

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

    this.playerRuntime.set(
      client.sessionId,
      {
        healAvailableAt:
          0,
      }
    );

    await Meteor.users.updateAsync(
      auth.userId,
      {
        $set: {
          "profile.isPlaying":
            true,
        },
      }
    );
  }

  async onLeave(
    client
  ) {
    const leavingPlayer =
      this.state.players.get(
        client.sessionId
      );

    this.state.players.delete(
      client.sessionId
    );

    if (!leavingPlayer) {
      return;
    }

    await Characters.updateAsync(
      leavingPlayer.characterId,
      {
        $set: {
          lastPlayedAt:
            new Date(),
        },
      }
    );

    /*
    * Your existing enemy aggro
    * cleanup can stay below this.
    */
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

        wanderTarget:
          null,

        nextWanderAt:
          0,

        contributors:
          new Set(),
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

    if (!runtime) {
      return;
    }

    runtime.targetSessionId =
      sessionId;

    runtime.wanderTarget =
      null;

    /*
    * Remember everyone who
    * participated in the fight.
    */
    if (
      player.characterId
    ) {
      runtime.contributors.add(
        player.characterId
      );
    }

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
    const runtime =
      this.enemyRuntime.get(
        ENEMY_ID
      );

    const contributors =
      [
        ...(
          runtime
            ?.contributors ||
          []
        ),
      ];

    this.state.enemies.delete(
      ENEMY_ID
    );

    this.enemyRuntime.delete(
      ENEMY_ID
    );

    /*
    * Reward everyone who
    * participated.
    */
    for (
      const characterId
      of contributors
    ) {
      this.awardXp(
        characterId,
        ENEMY.xpReward
      );
    }

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

  pickWanderTarget() {
    const angle =
      Math.random() *
      Math.PI *
      2;

    const distance =
      Math.random() *
      ENEMY.wanderRadius;

    return {
      x:
        ENEMY_SPAWN.x +
        Math.cos(angle) *
        distance,

      z:
        ENEMY_SPAWN.z +
        Math.sin(angle) *
        distance,
    };
  }

  updateEnemyWander(
    enemy,
    runtime,
    deltaTime
  ) {
    const now =
      Date.now();

    /*
    * No target yet.
    */
    if (
      !runtime.wanderTarget
    ) {
      if (
        now <
        runtime.nextWanderAt
      ) {
        return;
      }

      runtime.wanderTarget =
        this.pickWanderTarget();
    }

    const dx =
      runtime.wanderTarget.x -
      enemy.x;

    const dz =
      runtime.wanderTarget.z -
      enemy.z;

    const distance =
      Math.sqrt(
        dx * dx +
        dz * dz
      );

    /*
    * Reached destination.
    */
    if (
      distance < 0.15
    ) {
      runtime.wanderTarget =
        null;

      runtime.nextWanderAt =
        now +
        ENEMY.wanderWait;

      return;
    }

    enemy.rotationY =
      Math.atan2(
        dx,
        dz
      );

    const movement =
      ENEMY.speed *
      0.5 *
      (
        deltaTime /
        1000
      );

    enemy.x +=
      (
        dx /
        distance
      ) *
      movement;

    enemy.z +=
      (
        dz /
        distance
      ) *
      movement;
  }

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

    if (
      !enemy ||
      !runtime
    ) {
      return;
    }

    /*
    * No aggro:
    * wander around spawn.
    */
    if (
      !runtime.targetSessionId
    ) {
      this.updateEnemyWander(
        enemy,
        runtime,
        deltaTime
      );

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