import { trackAchievements } from "../achievements";
import { createDungeonInstances } from "./dungeonInstances";
import { createGroups } from "./groups";
import { ENEMY_SPAWNS, getEnemyStats } from "../../imports/game/enemyConfig";
import { getClassConfig } from "../../imports/game/classConfig";
import { createProjectiles } from "./projectiles";
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

import {
  DEFAULT_EQUIPMENT,
  EQUIPMENT_ITEMS,
  EQUIPMENT_SLOTS,
} from "../../imports/game/equipment";

const MAX_PLAYERS =
  50;

/*
 * =====================================================
 * CONFIG
 * =====================================================
 */

const HEALTH_REGEN = {
  delay:
    5000,

  percentPerSecond:
    0.05,
};

const WORLD_ENEMY_SPEED_MULTIPLIER = 2.3;

const ATTACK_COOLDOWN_FIELDS = {
  Digit1: "attackAvailableAt",
  Digit2: "heavyStrikeAvailableAt",
  Digit3: "cleaveAvailableAt",
};


const HEAL_COOLDOWN =
  15000;


const PLAYER_RESPAWN_DELAY =
  2000;

const getEquipmentForPlayer = (player) => ({
  ring: player.ring || null,
  accessory: player.accessory || null,
});

const getStatsForPlayer = (player) =>
  getPlayerStats(player.currentLevel, getEquipmentForPlayer(player), player.gameClass);


/*
 * =====================================================
 * WORLD ROOM
 * =====================================================
 */

export class WorldRoom
  extends Room {
  mountsAllowed = true;

  state =
    new WorldState();

  projectiles = createProjectiles(this);


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

  onDispose() {
    this.dungeons?.dispose();
  }

  onCreate() {
    this.groups = createGroups(this.state.players);
    this.dungeons = createDungeonInstances(this);
    this.maxClients =
      MAX_PLAYERS;

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

  applyPlayerEquipment(player, equipment) {
    player.ring = equipment.ring || "";
    player.accessory = equipment.accessory || "";

    const stats = getPlayerStats(player.currentLevel, equipment, player.gameClass);
    player.maxHealth = stats.maxHealth;
    player.health = Math.min(player.health, player.maxHealth);
    if (player.inDungeon) this.dungeons?.syncPlayer(player);
  }

  async persistPlayerEquipment(player, equipment, inventoryItems) {
    const updated = await Characters.updateAsync(
      { _id: player.characterId, userId: player.userId },
      {
        $set: {
          equipment,
          "inventory.items": inventoryItems,
        },
      }
    );

    if (!updated) return false;
    this.applyPlayerEquipment(player, equipment);
    return true;
  }

  leaveGroup(sessionId) {
    for (const targetId of this.groups.leave(sessionId)) {
      this.clients.find((client) => client.sessionId === targetId)?.send("groupInvitationCancelled");
    }
  }

  messages = {
    dungeonEnter: (client) => this.dungeons.enter(client),
    groupInvite: (client, targetId) => {
      const target = this.clients.find((candidate) => candidate.sessionId === targetId);
      if (!target) {
        client.send("groupError", "That player is no longer connected.");
        return;
      }
      const { error, invitation } = this.groups.invite(client.sessionId, targetId);
      if (error) client.send("groupError", error);
      else target.send("groupInvitation", invitation);
    },
    groupAccept: (client, invitationId) => {
      const error = this.groups.accept(client.sessionId, invitationId);
      if (error) client.send("groupError", error);
    },
    groupIgnore: (client, invitationId) => this.groups.ignore(client.sessionId, invitationId),
    groupLeave: (client) => this.leaveGroup(client.sessionId),

    loot: (client, id) => collectLoot(this, client, id),

    equipItem: async (client, { itemId, slot }) => {
      const player = this.state.players.get(client.sessionId);
      const item = EQUIPMENT_ITEMS[itemId];
      if (!player || player.inDungeon || !item || item.slot !== slot || !EQUIPMENT_SLOTS.includes(slot)) return;

      const character = await Characters.findOneAsync({
        _id: player.characterId,
        userId: player.userId,
      });
      const inventoryItems = [...(character?.inventory?.items || [])];
      const itemIndex = inventoryItems.findIndex((ownedItem) => ownedItem.id === itemId);
      if (itemIndex < 0) return;

      const equipment = {
        ...DEFAULT_EQUIPMENT,
        ...(character.equipment || {}),
      };
      const replacedItemId = equipment[slot];
      inventoryItems.splice(itemIndex, 1);
      if (replacedItemId && replacedItemId !== itemId) {
        inventoryItems.push({ id: replacedItemId });
      }
      equipment[slot] = itemId;

      if (await this.persistPlayerEquipment(player, equipment, inventoryItems)) {
        await trackAchievements(player.characterId, "equip");
      }
    },

    unequipItem: async (client, slot) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || player.inDungeon || !EQUIPMENT_SLOTS.includes(slot)) return;

      const character = await Characters.findOneAsync({
        _id: player.characterId,
        userId: player.userId,
      });
      if (!character) return;

      const equipment = {
        ...DEFAULT_EQUIPMENT,
        ...(character.equipment || {}),
      };
      const equippedItemId = equipment[slot];
      if (!equippedItemId) return;

      const inventoryItems = [...(character.inventory?.items || []), { id: equippedItemId }];
      equipment[slot] = null;

      await this.persistPlayerEquipment(player, equipment, inventoryItems);
    },

    move: (
      client,
      data
    ) => {
      const player =
        this.state.players.get(
          client.sessionId
        );


      if (
        !player || player.inDungeon || player.health <= 0
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

      if (typeof data.mounted === "boolean") {
        const wasMounted = player.mounted;
        player.mounted = this.mountsAllowed && data.mounted;
        if (player.mounted && !wasMounted) {
          void trackAchievements(player.characterId, "mount");
        }
      }
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
        player.inDungeon ||
        player.mounted ||
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

      const stats = getStatsForPlayer(player);


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
      client,
      code = "Digit1"
    ) => {
      if (!["Digit1", "Digit2", "Digit3"].includes(code)) return;
      const cooldownField = ATTACK_COOLDOWN_FIELDS[code];
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
        player.inDungeon ||
        player.mounted ||
        player.health <=
          0
      ) {
        return;
      }


      const skill = getClassConfig(player.gameClass).skills[code];
      if (!skill) return;
      const now =
        Date.now();


      if (
        now <
        runtime.attackAvailableAt || now < runtime[cooldownField]
      ) {
        return;
      }


      runtime.attackAvailableAt =
        now +
        ATTACK.cooldown;

      runtime[cooldownField] = now + skill.cooldown;
      if (code !== "Digit1") {
        client.send("skillCooldown", { code, duration: skill.cooldown });
      }

      if (skill.projectile) {
        this.projectiles.fire(client.sessionId, player, skill);
        return;
      }

      if (skill.effect) {
        this.broadcast("attack", {
          sessionId: client.sessionId,
          effect: { id: `nova-${client.sessionId}-${now}`, type: skill.effect, x: player.x, y: player.y + 0.05, z: player.z, dx: 0, dz: 0, speed: 0, lifetime: 500, radius: skill.range },
        });
        await this.attackEnemy(client.sessionId, skill);
        return;
      }


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
        client.sessionId,
        skill
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


    await trackAchievements(character._id, "level", character.currentLevel ?? 1);

    const appearance =
      character.appearance ||
      {};


    const currentLevel =
      character.currentLevel ??
      1;

    const equipment = {
      ...DEFAULT_EQUIPMENT,
      ...(character.equipment || {}),
    };

    const stats =
      getPlayerStats(
        currentLevel,
        equipment,
        character.gameClass
      );


    const player =
      new PlayerState({
        userId:
          auth.userId,

        characterId:
          character._id,

        name:
          character.name,

        gameClass: character.gameClass || "warrior",

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

        ring:
          equipment.ring || "",

        accessory:
          equipment.accessory || "",

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

        heavyStrikeAvailableAt: 0,
        cleaveAvailableAt: 0,

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


    this.dungeons?.removePlayer(client.sessionId);
    this.projectiles.removePlayer(client.sessionId);
    this.leaveGroup(client.sessionId);

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
        player.inDungeon ||
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
        HEALTH_REGEN.delay
      ) {
        continue;
      }


      const healthPerSecond =
        player.maxHealth *
        HEALTH_REGEN.percentPerSecond;


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
      player.inDungeon ||
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
        this.clients.find((client) => client.sessionId === sessionId)?.send("respawn", {
          x: currentPlayer.x, y: currentPlayer.y, z: currentPlayer.z,
          rotationY: currentPlayer.rotationY,
        });
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


    await trackAchievements(characterId, "level", progress.currentLevel);

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
        const stats = getPlayerStats(
          progress.currentLevel,
          getEquipmentForPlayer(player),
          player.gameClass
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
      if (player.inDungeon) this.dungeons?.syncPlayer(player);
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
    const stats = this.getEnemyStats(spawn.type, spawn.level);
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

        lastCombatAt:
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

        // Keep reward eligibility even if a participant leaves the room.
        contributorUserIds: new Set(),
      }
    );
  }


  /*
   * =====================================================
   * PLAYER -> ENEMY COMBAT
   * =====================================================
   */

  getEnemyStats(type, level) {
    const stats = getEnemyStats(type, level);
    return { ...stats, speed: stats.speed * WORLD_ENEMY_SPEED_MULTIPLIER };
  }

  async attackEnemy(
    sessionId,
    skill
  ) {
    const player =
      this.state.players.get(
        sessionId
      );


    if (
      !player ||
      player.inDungeon ||
      player.health <=
        0
    ) {
      return;
    }


    skill = skill || getClassConfig(player.gameClass).skills.Digit1;
    const target = skill.aoe ? null :
      this.findClosestEnemy(
        player,
        skill.range
      );


    const targets = skill.aoe
      ? Array.from(this.state.enemies.entries())
        .filter(([, enemy]) => enemy.health > 0 && this.getHorizontalDistance(player, enemy) <= skill.range)
        .map(([enemyId, enemy]) => ({ enemyId, enemy }))
      : target ? [target] : [];

    // Snapshot targets so killing a dungeon pack cannot hit the next stage.
    await Promise.all(targets.map(({ enemyId, enemy }) =>
      this.damageEnemy(sessionId, enemyId, enemy, skill.damageMultiplier)));
  }


  async damageEnemy(sessionId, enemyId, enemy, damageMultiplier) {
    const player = this.state.players.get(sessionId);
    if (!player || player.inDungeon || player.health <= 0 || enemy.health <= 0 || this.state.enemies.get(enemyId) !== enemy) return;


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

    runtime.lastCombatAt = Date.now();


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
      runtime.contributorUserIds.add(player.userId);
    }


    /*
     * Damage is derived from the
     * player's current level.
     *
     * Never trust damage sent
     * from the client.
     */

    const stats = getStatsForPlayer(player);


    enemy.health =
      Math.max(
        0,
        enemy.health -
          stats.damage * damageMultiplier
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


    const stats = this.getEnemyStats(spawn.type, spawn.level);
    const quest = HUNT_QUESTS[spawn.type || "boar"];
    const lootOwners = new Set();
    for (const [sessionId, player] of this.state.players.entries()) {
      if (!contributors.has(player.characterId) || lootOwners.has(player.userId)) {
        continue;
      }
      if (!stats.moneyReward) {
        spawnLoot(this, this.state.enemies.get(enemyId), sessionId);
      }
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

    // Remove the enemy before any await so simultaneous killing blows cannot
    // grant rewards twice. Schedule respawn independently of persistence.
    this.clock.setTimeout(
      () => this.spawnEnemy(spawn),
      stats.respawnDelay
    );

    for (const characterId of contributors) {
      await trackAchievements(characterId, "kill", spawn.type || "boar");
    }

    if (stats.moneyReward) {
      await Meteor.users.updateAsync(
        { _id: { $in: Array.from(runtime.contributorUserIds) } },
        { $inc: { "profile.inventory.money": stats.moneyReward } },
        { multi: true }
      );
    }


    /*
     * Award every participating
     * character the full reward.
     */

    for (
      const characterId
      of contributors
    ) {
      if (stats.xpReward > 0) {
        await this.awardXp(
          characterId,
          stats.xpReward
        );
      }


      const completed =
        quest && this.advanceHuntQuest(
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


  }


  /*
   * =====================================================
   * ENEMY AI
   * =====================================================
   */

  updateEnemies(
    deltaTime
  ) {
    this.projectiles.update(deltaTime);
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

      this.updateEnemyRegeneration(enemy, runtime, deltaTime);
    }
  }


  updateEnemyRegeneration(enemy, runtime, deltaTime) {
    if (
      runtime.targetSessionId ||
      enemy.health <= 0 ||
      enemy.health >= enemy.maxHealth ||
      Date.now() - runtime.lastCombatAt < HEALTH_REGEN.delay
    ) {
      return;
    }

    enemy.health = Math.min(
      enemy.maxHealth,
      enemy.health + enemy.maxHealth * HEALTH_REGEN.percentPerSecond * (deltaTime / 1000)
    );
  }


  updateEnemy(
    enemyId,
    enemy,
    runtime,
    deltaTime
  ) {
    const stats = this.getEnemyStats(enemy.type, enemy.level);
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
      target.inDungeon ||
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

    runtime.lastCombatAt = now;


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
    const stats = this.getEnemyStats(enemy.type, enemy.level);
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
    const stats = this.getEnemyStats(spawn.type, spawn.level);
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
