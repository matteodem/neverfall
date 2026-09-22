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
  ATTACK,
} from "../../imports/game/config";

import {
  Characters,
} from "../../imports/api/characters/characters";

import {
  addXpToProgress,
} from "../../imports/game/xp";


/*
 * =====================================================
 * CONFIG
 * =====================================================
 */

const PLAYER_REGEN = {
  delay: 5000,
  percentPerSecond: 0.05,
};

const BOAR_SPAWNS = [
  {
    id: "boar-1",
    x: -20,
    y: 0,
    z: 16,
  },

  {
    id: "boar-2",
    x: 19,
    y: 0,
    z: 18,
  },

  {
    id: "boar-3",
    x: -19,
    y: 0,
    z: -17,
  },

  {
    id: "boar-4",
    x: 20,
    y: 0,
    z: -15,
  },

  {
    id: "boar-5",
    x: 22,
    y: 0,
    z: 2,
  },
];

const ENEMY = {
  health: 100,

  level: 1,

  xpReward: 20,

  speed: 2,

  attackDamage: 20,

  attackRange: 1.8,

  attackCooldown:
    1000,

  respawnDelay:
    2000,

  wanderRadius:
    3,

  wanderWait:
    1500,
};

const HEAL_AMOUNT =
  40;

const HEAL_COOLDOWN =
  15000;

const PLAYER_RESPAWN_DELAY =
  2000;


/*
 * =====================================================
 * WORLD ROOM
 * =====================================================
 */

export class WorldRoom
  extends Room {
  state =
    new WorldState();

  /*
   * Runtime-only data.
   *
   * This is intentionally not
   * synchronized through Colyseus.
   */

  enemyRuntime =
    new Map();

  playerRuntime =
    new Map();


  /*
   * =====================================================
   * AUTH
   * =====================================================
   */

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


  /*
   * =====================================================
   * ROOM
   * =====================================================
   */

  onCreate() {
    for (
      const spawn
      of BOAR_SPAWNS
    ) {
      this.spawnEnemy(
        spawn
      );
    }

    /*
     * Server-side AI update.
     */

    this.setTimestep(
      (deltaTime) => {
        this.updateEnemies(
          deltaTime
        );

        this.updatePlayerRegeneration(
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
          player.health +
            HEAL_AMOUNT
        );

      runtime.healAvailableAt =
        now +
        HEAL_COOLDOWN;

      client.send(
        "healCooldown",
        {
          duration:
            HEAL_COOLDOWN,
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
        runtime.attackAvailableAt
      ) {
        return;
      }

      runtime.attackAvailableAt =
        now +
        ATTACK.cooldown;

      this.broadcast(
        "attack",
        {
          sessionId:
            client.sessionId,
        },
        {
          except:
            client,
        }
      );

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

  markPlayerInCombat(
    sessionId
  ) {
    const runtime =
      this.playerRuntime.get(
        sessionId
      );

    if (!runtime) {
      return;
    }

    runtime.lastCombatAt =
      Date.now();
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

    const appearance =
      character.appearance || {};

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

        rotationY:
          0,

        health:
          100,

        maxHealth:
          100,

        gender:
          appearance.gender ||
          "female",

        skinTone:
          appearance.skinTone ||
          "medium",

        bodyType:
          appearance.bodyType ||
          "medium",

        head:
          appearance.head ||
          "head1",
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

        attackAvailableAt:
          0,

        lastCombatAt:
          0,
      }
    );

    /*
     * Explicitly joining the world
     * means the user is playing.
     */

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

    this.playerRuntime.delete(
      client.sessionId
    );

    /*
     * Remove this player from
     * enemy aggro targets.
     */

    for (
      const runtime
      of this.enemyRuntime.values()
    ) {
      if (
        runtime.targetSessionId ===
        client.sessionId
      ) {
        runtime.targetSessionId =
          null;

        runtime.nextAttackAt =
          0;
      }
    }

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
     * IMPORTANT:
     *
     * Do not set profile.isPlaying
     * to false here.
     *
     * Reloading/closing the browser
     * should keep the character in
     * playing mode.
     */
  }


  /*
   * =====================================================
   * PLAYER HEALTH
   * =====================================================
   */

  updatePlayerRegeneration(
    deltaTime
  ) {
    const now =
      Date.now();

    for (
      const [
        sessionId,
        player,
      ]
      of this.state.players.entries()
    ) {
      if (
        player.health <= 0 ||
        player.health >=
          player.maxHealth
      ) {
        continue;
      }

      const runtime =
        this.playerRuntime.get(
          sessionId
        );

      if (!runtime) {
        continue;
      }

      const timeSinceCombat =
        now -
        runtime.lastCombatAt;

      if (
        timeSinceCombat <
        PLAYER_REGEN.delay
      ) {
        continue;
      }

      const healthPerSecond =
        player.maxHealth *
        PLAYER_REGEN.percentPerSecond;

      const healthThisTick =
        healthPerSecond *
        (
          deltaTime /
          1000
        );

      player.health =
        Math.min(
          player.maxHealth,
          player.health +
            healthThisTick
        );
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

    this.markPlayerInCombat(
      sessionId
    );

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
    player.x =
      0;

    player.y =
      0;

    player.z =
      0;

    player.rotationY =
      0;

    player.health =
      player.maxHealth;
  }


  /*
   * =====================================================
   * XP
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
          character.currentLevel ??
          1,

        currentXp:
          character.currentXp ??
          0,

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
     * Mirror progression into
     * every online instance of
     * this character.
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


  /*
   * =====================================================
   * ENEMY SPAWNING
   * =====================================================
   */

  spawnEnemy(
    spawn
  ) {
    const enemy =
      new EnemyState({
        x:
          spawn.x,

        y:
          spawn.y,

        z:
          spawn.z,

        rotationY:
          Math.PI,

        health:
          ENEMY.health,

        maxHealth:
          ENEMY.health,
      });

    this.state.enemies.set(
      spawn.id,
      enemy
    );

    this.enemyRuntime.set(
      spawn.id,
      {
        /*
         * Original spawn point.
         * Used for respawn +
         * wandering.
         */

        spawn,

        targetSessionId:
          null,

        nextAttackAt:
          0,

        wanderTarget:
          null,

        nextWanderAt:
          0,

        /*
         * Unique character IDs
         * that damaged this enemy.
         */

        contributors:
          new Set(),
      }
    );
  }


  /*
   * =====================================================
   * PLAYER -> ENEMY COMBAT
   * =====================================================
   */

  attackEnemy(
    sessionId
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

    const target =
      this.findClosestEnemy(
        player,
        ATTACK.range
      );

    if (!target) {
      return;
    }

    const {
      enemyId,
      enemy,
    } = target;

    const runtime =
      this.enemyRuntime.get(
        enemyId
      );

    if (!runtime) {
      return;
    }
    
    this.markPlayerInCombat(
      sessionId
    );

    /*
     * Enemy becomes aggressive
     * towards this player.
     */

    runtime.targetSessionId =
      sessionId;

    runtime.wanderTarget =
      null;

    /*
     * Every unique participant
     * receives XP when it dies.
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
        enemy.health -
          ATTACK.damage
      );

    if (
      enemy.health <= 0
    ) {
      this.killEnemy(
        enemyId
      );
    }
  }


  findClosestEnemy(
    player,
    maxDistance
  ) {
    let closest =
      null;

    let closestDistance =
      Infinity;

    for (
      const [
        enemyId,
        enemy,
      ]
      of this.state.enemies.entries()
    ) {
      const distance =
        this.getHorizontalDistance(
          player,
          enemy
        );

      if (
        distance >
        maxDistance
      ) {
        continue;
      }

      if (
        distance >=
        closestDistance
      ) {
        continue;
      }

      closestDistance =
        distance;

      closest = {
        enemyId,
        enemy,
      };
    }

    return closest;
  }


  killEnemy(
    enemyId
  ) {
    const runtime =
      this.enemyRuntime.get(
        enemyId
      );

    if (!runtime) {
      return;
    }

    const {
      spawn,
      contributors,
    } = runtime;

    /*
     * Remove dead enemy.
     */

    this.state.enemies.delete(
      enemyId
    );

    this.enemyRuntime.delete(
      enemyId
    );

    /*
     * Award every participating
     * character the full reward.
     */

    for (
      const characterId
      of contributors
    ) {
      this.awardXp(
        characterId,
        ENEMY.xpReward
      ).catch(
        (error) => {
          console.error(
            "[XP] Failed to award XP:",
            error
          );
        }
      );
    }

    /*
     * Respawn the same Boar at
     * its original spawn.
     */

    this.clock.setTimeout(
      () => {
        this.spawnEnemy(
          spawn
        );
      },
      ENEMY.respawnDelay
    );
  }


  /*
   * =====================================================
   * ENEMY AI
   * =====================================================
   */

  updateEnemies(
    deltaTime
  ) {
    for (
      const [
        enemyId,
        enemy,
      ]
      of this.state.enemies.entries()
    ) {
      const runtime =
        this.enemyRuntime.get(
          enemyId
        );

      if (!runtime) {
        continue;
      }

      this.updateEnemy(
        enemyId,
        enemy,
        runtime,
        deltaTime
      );
    }
  }


  updateEnemy(
    enemyId,
    enemy,
    runtime,
    deltaTime
  ) {
    /*
     * No aggro:
     * wander around this enemy's
     * individual spawn position.
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
     * Target disconnected or died.
     */

    if (
      !target ||
      target.health <= 0
    ) {
      runtime.targetSessionId =
        null;

      runtime.nextAttackAt =
        0;

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
     * Face target.
     */

    enemy.rotationY =
      Math.atan2(
        dx,
        dz
      );

    /*
     * Chase player until
     * melee range.
     */

    if (
      distance >
      ENEMY.attackRange
    ) {
      const safeDistance =
        Math.max(
          distance,
          0.001
        );

      const movement =
        ENEMY.speed *
        (
          deltaTime /
          1000
        );

      enemy.x +=
        (
          dx /
          safeDistance
        ) *
        movement;

      enemy.z +=
        (
          dz /
          safeDistance
        ) *
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

    /*
     * IMPORTANT:
     *
     * Use this specific enemyId.
     * There is no ENEMY_ID anymore.
     */

    this.broadcast(
      "enemyAttack",
      {
        enemyId,
      }
    );

    this.damagePlayer(
      runtime.targetSessionId,
      ENEMY.attackDamage
    );
  }


  /*
   * =====================================================
   * ENEMY WANDERING
   * =====================================================
   */

  updateEnemyWander(
    enemy,
    runtime,
    deltaTime
  ) {
    const now =
      Date.now();

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
        this.pickWanderTarget(
          runtime.spawn
        );
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
     * Destination reached.
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

    const safeDistance =
      Math.max(
        distance,
        0.001
      );

    enemy.x +=
      (
        dx /
        safeDistance
      ) *
      movement;

    enemy.z +=
      (
        dz /
        safeDistance
      ) *
      movement;
  }


  pickWanderTarget(
    spawn
  ) {
    const angle =
      Math.random() *
      Math.PI *
      2;

    /*
     * sqrt gives a nicer random
     * distribution throughout the
     * entire circle.
     */

    const distance =
      Math.sqrt(
        Math.random()
      ) *
      ENEMY.wanderRadius;

    return {
      x:
        spawn.x +
        Math.cos(
          angle
        ) *
        distance,

      z:
        spawn.z +
        Math.sin(
          angle
        ) *
        distance,
    };
  }


  /*
   * =====================================================
   * HELPERS
   * =====================================================
   */

  getHorizontalDistance(
    a,
    b
  ) {
    const dx =
      a.x -
      b.x;

    const dz =
      a.z -
      b.z;

    return Math.sqrt(
      dx * dx +
      dz * dz
    );
  }
}