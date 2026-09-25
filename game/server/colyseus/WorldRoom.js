import { ENEMY_SPAWNS, getEnemyStats } from "../../imports/game/enemyConfig";
import { spawnLoot, collectLoot } from "../inventory/loot";
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

import {
  HUNT_QUESTS,
} from "../../imports/game/quests";

import {
  getPlayerStats,
} from "../../imports/game/playerStats";


/*
 * =====================================================
 * CONFIG
 * =====================================================
 */

const PLAYER_REGEN = {
  delay:
    5000,

  percentPerSecond:
    0.05,
};


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
   * QUESTS
   * =====================================================
   */

  advanceHuntQuest(
    characterId,
    type
  ) {
    const quest = HUNT_QUESTS[type];
    const field = quest.progressField;
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


      player[field] =
        (
          player[field] ??
          0
        ) +
        1;


      if (
        player[field] <
        quest.target
      ) {
        return false;
      }


      player[field] =
        0;


      return true;
    }


    return false;
  }


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
      of ENEMY_SPAWNS
    ) {
      this.spawnEnemy(
        spawn
      );
    }


    /*
     * Server-side AI update.
     */

    this.setTimestep(
      (
        deltaTime
      ) => {
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
    loot: (client, id) => collectLoot(this, client, id),

    move: (
      client,
      data
    ) => {
      const player =
        this.state.players.get(
          client.sessionId
        );


      if (
        !player
      ) {
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
        player.health <=
          0
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

      const stats =
        getPlayerStats(
          player.currentLevel
        );


      player.health =
        Math.min(
          player.maxHealth,
          player.health +
            stats.healAmount
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


    attack: async (
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
        player.health <=
          0
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


      await this.attackEnemy(
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


    if (
      !runtime
    ) {
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


    if (
      !character
    ) {
      throw new Error(
        "Character not found"
      );
    }


    const appearance =
      character.appearance ||
      {};


    const currentLevel =
      character.currentLevel ??
      1;


    const stats =
      getPlayerStats(
        currentLevel
      );


    const player =
      new PlayerState({
        userId:
          auth.userId,

        characterId:
          character._id,

        name:
          character.name,

        currentLevel,

        currentXp:
          character.currentXp ??
          0,

        x:
          0,

        y:
          0,

        z:
          0,

        rotationY:
          0,

        health:
          stats.maxHealth,

        maxHealth:
          stats.maxHealth,

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


    if (
      !leavingPlayer
    ) {
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
        player.health <=
          0 ||
        player.health >=
          player.maxHealth
      ) {
        continue;
      }


      const runtime =
        this.playerRuntime.get(
          sessionId
        );


      if (
        !runtime
      ) {
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
      player.health <=
        0
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
      player.health >
      0
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
          currentPlayer.health >
            0
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


    if (
      !character
    ) {
      return;
    }


    const previousLevel =
      character.currentLevel ??
      1;


    const progress =
      addXpToProgress({
        currentLevel:
          previousLevel,

        currentXp:
          character.currentXp,

        gainedXp:
          amount,
      });


    const leveledUp =
      progress.currentLevel >
      previousLevel;


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
     * Update online Colyseus
     * player immediately.
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


      /*
       * Only update HP when
       * an actual level-up
       * happened.
       */

      if (
        leveledUp
      ) {
        const stats =
          getPlayerStats(
            progress.currentLevel
          );


        player.maxHealth =
          stats.maxHealth;


        /*
         * MVP behavior:
         *
         * Level-up completely
         * restores health.
         */

        player.health =
          stats.maxHealth;
      }
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
    const stats = getEnemyStats(spawn.type, spawn.level);
    const enemy =
      new EnemyState({
        type: spawn.type,
        level: spawn.level,
        x:
          spawn.x,

        y:
          spawn.y,

        z:
          spawn.z,

        rotationY:
          Math.PI,

        health:
          stats.health,

        maxHealth:
          stats.health,
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

  async attackEnemy(
    sessionId
  ) {
    const player =
      this.state.players.get(
        sessionId
      );


    if (
      !player ||
      player.health <=
        0
    ) {
      return;
    }


    const target =
      this.findClosestEnemy(
        player,
        ATTACK.range
      );


    if (
      !target
    ) {
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


    if (
      !runtime
    ) {
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


    /*
     * Damage is derived from the
     * player's current level.
     *
     * Never trust damage sent
     * from the client.
     */

    const stats =
      getPlayerStats(
        player.currentLevel
      );


    enemy.health =
      Math.max(
        0,
        enemy.health -
          stats.damage
      );


    if (
      enemy.health <=
      0
    ) {
      await this.killEnemy(
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


  async killEnemy(
    enemyId
  ) {
    const runtime =
      this.enemyRuntime.get(
        enemyId
      );


    if (
      !runtime
    ) {
      return;
    }


    const {
      spawn,
      contributors,
    } = runtime;


    const stats = getEnemyStats(spawn.type, spawn.level);
    const quest = HUNT_QUESTS[spawn.type || "boar"];
    const lootOwners = new Set();
    for (const [sessionId, player] of this.state.players.entries()) {
      if (!contributors.has(player.characterId) || lootOwners.has(player.userId)) {
        continue;
      }
      spawnLoot(this, this.state.enemies.get(enemyId), sessionId);
      lootOwners.add(player.userId);
    }

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
      await this.awardXp(
        characterId,
        stats.xpReward
      );


      const completed =
        this.advanceHuntQuest(
          characterId,
          spawn.type || "boar"
        );


      if (
        completed
      ) {
        await this.awardXp(
          characterId,
          quest.rewardXp
        );
      }
    }


    /*
     * Respawn the same enemy at
     * its original spawn.
     */

    this.clock.setTimeout(
      () => {
        this.spawnEnemy(
          spawn
        );
      },
      stats.respawnDelay
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


      if (
        !runtime
      ) {
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
    const stats = getEnemyStats(enemy.type, enemy.level);
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
      target.health <=
        0
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
      stats.attackRange
    ) {
      const safeDistance =
        Math.max(
          distance,
          0.001
        );


      const movement =
        stats.speed *
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
      stats.attackCooldown;


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

        targetSessionId:
          runtime.targetSessionId,
      }
    );


    this.damagePlayer(
      runtime.targetSessionId,
      stats.attackDamage
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
    const stats = getEnemyStats(enemy.type, enemy.level);
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
      distance <
      0.15
    ) {
      runtime.wanderTarget =
        null;


      runtime.nextWanderAt =
        now +
        stats.wanderWait;


      return;
    }


    enemy.rotationY =
      Math.atan2(
        dx,
        dz
      );


    const movement =
      stats.speed *
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
    const stats = getEnemyStats(spawn.type, spawn.level);
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
      stats.wanderRadius;


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
