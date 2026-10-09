import { PERFORMANCE } from "../../imports/game/performanceConfig";
import { createWorldEvents } from "./worldEvents";
import { CAMP_PROTECTION, NORTHERN_CAMP } from "../../imports/game/campProtection";
import { SPAWN_POINTS, DEFAULT_SPAWN_POINT, NORTHERN_SPAWN_POINT, getNearestUnlockedSpawnPoint } from "../../imports/game/spawnPoints";
import { WAYPOINTS, DEFAULT_WAYPOINT } from "../../imports/game/waypoints";
import { crossesCamp, isInsideCamp, outsideCampPosition } from "./campProtection";
import { sendChat } from "../chat";
import { cancelBossAction, updateBossMechanics } from "./bossMechanics";
import { updateEnemyLeash } from "./enemyLeash";
import { trackAchievements } from "../achievements";
import { recordQuestEvent } from "../quests";
import { createDungeonInstances } from "./dungeonInstances";
import { createGroups } from "./groups";
import { getFallDamage, resetFallTracking } from "./fallDamage";
import { getStatusModifiers } from "../../imports/game/statusEffects";
import { applyStatusEffect, clearStatusEffects, updateStatusEffects } from "./statusEffects";
import { ENEMY_SPAWNS, ENEMY_TYPES, getEnemyStats, RARE_ENEMY, ENEMY_COMBAT_SPEED_MULTIPLIER } from "../../imports/game/enemyConfig";
import { getWorldHeight, WORLD_EAST_PLAYER_LIMIT, WORLD_PLAYER_LIMIT } from "../../imports/game/worldConfig";
import { LANDMARKS } from "../../imports/game/landmarks";
import { getQuestArea, FROZEN_DISTURBANCE_POINTS } from "../../imports/game/quests";
import { Guilds } from "../../imports/api/guilds/guilds";
import { registerGuildPlayer, unregisterGuildPlayer } from "./onlineGuildTags";
import { withCharacterSlots } from "../characterSlots";
import { BASIC_TOWER_CHEST_POSITION } from "../../imports/game/basicTowerConfig";
import { moveInventoryItem } from "../../imports/game/inventoryLayout";
import { claimHiddenCache } from "./hiddenCaches";
import { HEAL_SKILL, SKILL_CODES, getEquippedSkills, getPlayerSkills, isValidSkillLoadout } from "../../imports/game/skills";
import { TALENT_LEVELS, TALENTS, getSelectedTalents, getTalentSkill } from "../../imports/game/talents";
import { CONSUMABLES, POTION_DURATION_MS } from "../../imports/game/consumables";
import { createProjectiles } from "./projectiles";
import { spawnLoot, collectLoot } from "../inventory/loot";
import {
  Meteor,
} from "meteor/meteor";

import {
  Room,
  matchMaker,
} from "colyseus";

import jwt from "jsonwebtoken";

import {
  EnemyState,
  PlayerState,
  WorldState,
} from "./WorldState";

import {
  ATTACK,
  MOBILE_TARGETING,
  PLAYER,
} from "../../imports/game/config";

import {
  Characters,
} from "../../imports/api/characters/characters";

import {
  addXpToProgress,
  getMaxXp,
} from "../../imports/game/xp";

import { QUESTS } from "../../imports/game/quests";

import {
  getPlayerStats,
} from "../../imports/game/playerStats";

import {
  DEFAULT_EQUIPMENT,
  EQUIPMENT_ITEMS,
  EQUIPMENT_SLOTS,
} from "../../imports/game/equipment";

const MAX_PLAYERS =
  30;

const LOCATION_QUESTS = QUESTS.flatMap((quest) =>
  (quest.objectives || [quest.objective]).filter((objective) => objective.type === "ReachLocation"));

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

const HEAL_COOLDOWN = HEAL_SKILL.cooldown;


const PLAYER_RESPAWN_DELAY =
  2000;

const AFK_TIMEOUT_MS = 15 * 60 * 1000;
const AFK_CHECK_INTERVAL_MS = 1000;

const getEquipmentForPlayer = (player) => ({
  ring: player.ring || null,
  accessory: player.accessory || null,
});

const getStatsForPlayer = (player, now = Date.now()) => {
  const stats = getPlayerStats(player.currentLevel, getEquipmentForPlayer(player), player.gameClass, player.species, getSelectedTalents(player));
  if (player.speedPotionUntil > now) stats.movementSpeedMultiplier *= 1.1;
  if (player.powerPotionUntil > now) stats.damage *= 1.1;
  const modifiers = getStatusModifiers(player, now);
  stats.movementSpeedMultiplier *= modifiers.movementSpeed;
  stats.damage *= modifiers.damage;
  return stats;
};


/*
 * =====================================================
 * WORLD ROOM
 * =====================================================
 */

export class WorldRoom
  extends Room {
  mountsAllowed = true;
  campSafeZoneEnabled = true;

  state =
    new WorldState();

  projectiles = createProjectiles(this);

  getProjectileTerrainHeight(x, z) {
    return getWorldHeight(x, z);
  }


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

  onDispose() {
    this.dungeons?.dispose();
  }

  onCreate() {
    this.patchRate = PERFORMANCE.statePatchInterval;
    this.groups = createGroups(this.state.players);
    this.dungeons = createDungeonInstances(this);
    this.worldEvents = createWorldEvents(this);
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
    this.startAfkChecks();
  }

  startAfkChecks() {
    this.clock.setInterval(() => {
      const now = Date.now();
      for (const [sessionId, runtime] of this.playerRuntime) {
        if (runtime.afkDisconnecting || now - runtime.lastActivityAt < AFK_TIMEOUT_MS) continue;
        const client = this.clients.find((candidate) => candidate.sessionId === sessionId);
        if (client) void this.disconnectAfk(client);
      }
    }, AFK_CHECK_INTERVAL_MS);
  }

  recordActivity(sessionId) {
    const player = this.state.players.get(sessionId);
    const runtime = this.playerRuntime.get(sessionId);
    if (!player || !runtime || runtime.afkDisconnecting) return;
    runtime.lastActivityAt = Date.now();
    if (this.access?.world && player.worldSessionId) {
      const worldRuntime = this.access.world.playerRuntime.get(player.worldSessionId);
      if (worldRuntime && !worldRuntime.afkDisconnecting) worldRuntime.lastActivityAt = runtime.lastActivityAt;
    } else if (player.inDungeon && runtime.dungeonRoomId) {
      const dungeon = matchMaker.getLocalRoomById(runtime.dungeonRoomId);
      const dungeonPlayer = dungeon && [...dungeon.state.players.entries()]
        .find(([, member]) => member.worldSessionId === sessionId);
      const dungeonRuntime = dungeonPlayer && dungeon.playerRuntime.get(dungeonPlayer[0]);
      if (dungeonRuntime && !dungeonRuntime.afkDisconnecting) dungeonRuntime.lastActivityAt = runtime.lastActivityAt;
    }
  }

  async disconnectAfk(client) {
    const player = this.state.players.get(client.sessionId);
    const runtime = this.playerRuntime.get(client.sessionId);
    if (!player || !runtime || runtime.afkDisconnecting) return;
    runtime.afkDisconnecting = true;
    if (this.access?.world && player.worldSessionId) {
      const world = this.access.world;
      const worldClient = world.clients.find((candidate) => candidate.sessionId === player.worldSessionId);
      if (worldClient && world.playerRuntime.has(player.worldSessionId)) {
        await world.disconnectAfk(worldClient);
        return;
      }
    }
    try {
      await Meteor.users.updateAsync(player.userId, { $set: { "profile.isPlaying": false } });
    } catch (error) {
      console.error("[AFK] Could not clear playing status", error);
    } finally {
      client.leave();
    }
  }


  /*
   * =====================================================
   * MESSAGES
   * =====================================================
   */

  applyPlayerEquipment(player, equipment) {
    player.ring = equipment.ring || "";
    player.accessory = equipment.accessory || "";

    const stats = getStatsForPlayer(player);
    player.movementSpeedMultiplier = stats.movementSpeedMultiplier;
    player.maxHealth = stats.maxHealth;
    player.health = Math.min(player.health, player.maxHealth);
    if (player.inDungeon) this.dungeons?.syncPlayer(player);
  }

  applyPlayerStatusEffect(player, id) {
    if (applyStatusEffect(player, id)) {
      player.movementSpeedMultiplier = getStatsForPlayer(player).movementSpeedMultiplier;
    }
  }

  applyPlayerTalents(player, talents) {
    for (const level of TALENT_LEVELS) player[`talent${level}`] = talents?.[level] || "";
    const stats = getStatsForPlayer(player);
    player.movementSpeedMultiplier = stats.movementSpeedMultiplier;
    player.maxHealth = stats.maxHealth;
    player.health = Math.min(player.health, player.maxHealth);
    if (player.inDungeon) this.dungeons?.syncPlayer(player);
  }

  async persistPlayerEquipment(player, equipment, inventoryItems, character, slotOrder) {
    const updated = await Characters.updateAsync(
      {
        _id: player.characterId, userId: player.userId,
        "inventory.items": character.inventory?.items ?? { $exists: false },
        equipment: character.equipment ?? { $exists: false },
        ...(slotOrder ? { "inventory.slotOrder": character.inventory?.slotOrder ?? { $exists: false } } : {}),
      },
      {
        $set: {
          equipment,
          "inventory.items": inventoryItems,
          ...(slotOrder ? { "inventory.slotOrder": slotOrder } : {}),
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

  getAvailableWaypoint(client, waypointId) {
    const player = this.state.players.get(client.sessionId);
    const runtime = this.playerRuntime.get(client.sessionId);
    const waypoint = WAYPOINTS.find((point) => point.id === waypointId);
    if (!player || !runtime || !waypoint || !runtime.unlockedWaypoints.has(waypoint.id)) {
      client.send("waypointTravelError", "Waypoint unavailable.");
      return null;
    }
    if (player.health <= 0 || player.inDungeon || this.isPlayerInCombat(client.sessionId)) {
      client.send("waypointTravelError", "Cannot travel while dead, in combat, or in a dungeon.");
      return null;
    }
    return waypoint;
  }

  messages = {
    claimHiddenCache: (client, cacheId) => claimHiddenCache(this, client, cacheId),
    interactWorldEvent: (client) => this.worldEvents?.interact(client),
    interactQuestPoint: (client, target) => {
      const player = this.state.players.get(client.sessionId);
      const point = FROZEN_DISTURBANCE_POINTS.find((entry) => entry.id === target);
      if (!player || player.health <= 0 || player.inDungeon || !point ||
        Math.hypot(player.x - point.x, player.z - point.z) > 4) return;
      void recordQuestEvent(this, player.characterId, "Interact", point.id)
        .catch((error) => console.error("[Quests] Could not save interaction progress", error));
    },
    claimTowerChest: async (client) => {
      const player = this.state.players.get(client.sessionId);
      const chest = BASIC_TOWER_CHEST_POSITION;
      if (!player || player.health <= 0 || player.inDungeon || player.towerChestClaimed ||
        Math.hypot(player.x - chest.x, player.y - chest.y, player.z - chest.z) > 3) return;
      const updated = await Meteor.users.updateAsync({
        _id: player.userId,
        "profile.claimedTowerChestCharacterIds": { $ne: player.characterId },
      }, {
        $addToSet: { "profile.claimedTowerChestCharacterIds": player.characterId },
        $inc: { "profile.inventory.money": 50000 },
      });
      if (!updated) {
        player.towerChestClaimed = true;
        return;
      }
      this.recordActivity(client.sessionId);
      player.towerChestClaimed = true;
      await this.awardXp(player.characterId, 1000);
      await trackAchievements(player.characterId, "towerChest");
      client.send("towerChestReward", "Tower Chest · 5 Gold · 1000 XP");
    },
    prepareWaypoint: (client, waypointId) => {
      const waypoint = this.getAvailableWaypoint(client, waypointId);
      if (waypoint) client.send("waypointReady", { id: waypoint.id, position: waypoint.position });
    },
    travelWaypoint: (client, waypointId) => {
      const waypoint = this.getAvailableWaypoint(client, waypointId);
      if (!waypoint) return;
      const player = this.state.players.get(client.sessionId);
      const runtime = this.playerRuntime.get(client.sessionId);
      this.recordActivity(client.sessionId);
      player.x = waypoint.position.x + (waypoint.arrivalOffset?.x ?? 0);
      player.z = waypoint.position.z + (waypoint.arrivalOffset?.z ?? 0);
      player.y = waypoint.arrivalOffset ? getWorldHeight(player.x, player.z) : waypoint.position.y;
      runtime.lastMoveAt = Date.now();
      runtime.moveAllowance = 0;
      runtime.awaitingWaypointArrival = true;
      resetFallTracking(runtime);
      this.broadcast("waypointTravel", {
        sessionId: client.sessionId, x: player.x, y: player.y, z: player.z,
        rotationY: player.rotationY,
      });
      if (!runtime.usedWaypoint) {
        runtime.usedWaypoint = true;
        void Characters.updateAsync({ _id: player.characterId, userId: player.userId }, {
          $set: { "adventureGuide.usedWaypoint": true },
        }).catch((error) => {
          runtime.usedWaypoint = false;
          console.error("[Adventure Guide] Could not save waypoint travel", error);
        });
      }
    },
    setSkills: async (client, equippedSkills) => {
      const player = this.state.players.get(client.sessionId);
      const runtime = this.playerRuntime.get(client.sessionId);
      const reject = (message) => client.send("skillsResult", { error: message });
      if (!player || !runtime || runtime.changingSkills) return;
      if (!isValidSkillLoadout(player.gameClass, equippedSkills)) return reject("Choose four different skills from your class.");
      if (player.inDungeon || player.health <= 0 || this.isPlayerInCombat(client.sessionId)) {
        return reject("Skills can only be changed outside combat while alive.");
      }
      runtime.changingSkills = true;
      const previous = getPlayerSkills(player);
      // Commit in realtime before yielding: combat cannot start between validation and assignment.
      SKILL_CODES.forEach((code, index) => { player[`skill${index + 1}`] = equippedSkills[index]; });
      try {
        const updated = await Characters.updateAsync(
          { _id: player.characterId, userId: player.userId },
          { $set: { equippedSkills } }
        );
        if (!updated) throw new Error("Character not found");
        const now = Date.now();
        client.send("skillsResult", { equippedSkills, cooldowns: Object.fromEntries(SKILL_CODES.map((code, index) =>
          [code, Math.max(0, (runtime.skillAvailableAt[equippedSkills[index]] || 0) - now)])) });
      } catch (error) {
        SKILL_CODES.forEach((code, index) => { player[`skill${index + 1}`] = previous[index]; });
        reject("Could not save skills. Please try again.");
      } finally {
        runtime.changingSkills = false;
      }
    },

    selectTalent: async (client, { level, talentId } = {}) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || !Number.isInteger(level) || player.currentLevel < level ||
        !TALENTS[player.gameClass]?.[level]?.some((talent) => talent.id === talentId)) return;
      const updated = await Characters.updateAsync(
        { _id: player.characterId, userId: player.userId, [`talents.${level}`]: { $exists: false } },
        { $set: { [`talents.${level}`]: talentId } }
      );
      if (!updated) return;
      this.recordActivity(client.sessionId);
      player[`talent${level}`] = talentId;
      this.applyPlayerTalents(player, getSelectedTalents(player));
    },
    resetTalents: async (client) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      const updated = await Characters.updateAsync(
        { _id: player.characterId, userId: player.userId },
        { $set: { talents: {} } }
      );
      if (!updated) return;
      this.recordActivity(client.sessionId);
      this.applyPlayerTalents(player, {});
    },
    chat: (client, text) => {
      if (typeof text === "string" && text.trim()) this.recordActivity(client.sessionId);
      return sendChat(this, client, text);
    },
    dungeonEnter: (client, dungeonId) => {
      this.recordActivity(client.sessionId);
      resetFallTracking(this.playerRuntime.get(client.sessionId));
      return this.dungeons.enter(client, dungeonId);
    },
    groupInvite: (client, targetId) => {
      this.recordActivity(client.sessionId);
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
      this.recordActivity(client.sessionId);
      const error = this.groups.accept(client.sessionId, invitationId);
      if (error) client.send("groupError", error);
      else {
        const groupId = this.state.players.get(client.sessionId)?.groupId;
        for (const player of this.state.players.values()) {
          if (player.groupId === groupId) void trackAchievements(player.characterId, "party");
        }
      }
    },
    groupIgnore: (client, invitationId) => {
      this.recordActivity(client.sessionId);
      return this.groups.ignore(client.sessionId, invitationId);
    },
    groupLeave: (client) => {
      this.recordActivity(client.sessionId);
      return this.leaveGroup(client.sessionId);
    },

    loot: (client, id) => {
      this.recordActivity(client.sessionId);
      return collectLoot(this, client, id);
    },

    equipItem: async (client, { itemId, slot }) => {
      this.recordActivity(client.sessionId);
      const player = this.state.players.get(client.sessionId);
      const item = EQUIPMENT_ITEMS[itemId];
      if (!player || player.inDungeon || player.health <= 0 || !item || item.slot !== slot || !EQUIPMENT_SLOTS.includes(slot)) return;

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
      if (replacedItemId === itemId) return;
      inventoryItems.splice(itemIndex, 1);
      if (replacedItemId && replacedItemId !== itemId) {
        inventoryItems.push({ id: replacedItemId });
      }
      equipment[slot] = itemId;

      if (await this.persistPlayerEquipment(player, equipment, inventoryItems, character)) {
        await trackAchievements(player.characterId, "equip");
      }
    },

    unequipItem: async (client, target) => {
      const slot = typeof target === "string" ? target : target?.slot;
      this.recordActivity(client.sessionId);
      const player = this.state.players.get(client.sessionId);
      if (!player || player.inDungeon || player.health <= 0 || !EQUIPMENT_SLOTS.includes(slot)) return;

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
      const dragging = typeof target === "object" && target !== null;
      if (dragging && target.itemId !== equippedItemId) return;

      const inventoryItems = [...(character.inventory?.items || []), { id: equippedItemId }];
      equipment[slot] = null;
      const slotOrder = dragging
        ? moveInventoryItem(inventoryItems, character.inventory?.slotOrder, equippedItemId, target.inventoryIndex)
        : undefined;
      if (dragging && !slotOrder) return;
      await this.persistPlayerEquipment(player, equipment, inventoryItems, character, slotOrder);
    },

    useConsumable: async (client, itemId) => {
      this.recordActivity(client.sessionId);
      const player = this.state.players.get(client.sessionId);
      if (!player || player.inDungeon || player.health <= 0 || !Object.hasOwn(CONSUMABLES, itemId)) return;

      const character = await Characters.findOneAsync({ _id: player.characterId, userId: player.userId });
      const originalItems = character?.inventory?.items;
      if (!Array.isArray(originalItems)) return;
      const itemIndex = originalItems.findIndex((item) => item.id === itemId);
      if (itemIndex < 0 || this.state.players.get(client.sessionId) !== player || player.health <= 0) return;

      const remainingItems = [...originalItems];
      remainingItems.splice(itemIndex, 1);
      const now = Date.now();
      const expiresAt = now + POTION_DURATION_MS;
      const update = { "inventory.items": remainingItems };
      if (itemId === "speed_potion") update.speedPotionUntil = expiresAt;
      if (itemId === "power_potion") update.powerPotionUntil = expiresAt;
      const consumed = await Characters.updateAsync(
        { _id: player.characterId, userId: player.userId, "inventory.items": originalItems },
        { $set: update }
      );
      if (!consumed) return;
      if (this.state.players.get(client.sessionId) !== player || player.health <= 0) {
        if (itemId !== "health_potion" && player.health <= 0) {
          await Characters.updateAsync(
            { _id: player.characterId, userId: player.userId },
            { $set: { speedPotionUntil: 0, powerPotionUntil: 0 } }
          );
        }
        return;
      }

      if (itemId === "health_potion") {
        player.health = Math.min(player.maxHealth, player.health + player.maxHealth * 0.25);
      } else if (itemId === "speed_potion") {
        player.speedPotionUntil = expiresAt;
        player.movementSpeedMultiplier = getStatsForPlayer(player, now).movementSpeedMultiplier;
      } else if (itemId === "power_potion") {
        player.powerPotionUntil = expiresAt;
      }
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


      const wasMounted = player.mounted;
      if (typeof data.mounted === "boolean") {
        player.inCombat = this.isPlayerInCombat(client.sessionId);
        player.mounted = this.mountsAllowed && data.mounted && (wasMounted || !player.inCombat);
        if (player.mounted && !wasMounted) {
          void trackAchievements(player.characterId, "mount");
        }
      }

      const runtime = this.playerRuntime.get(client.sessionId);
      if (!runtime) return;
      const now = Date.now();
      const speed = PLAYER.speed * getStatsForPlayer(player).movementSpeedMultiplier * (player.mounted ? 2 : 1);
      // A small accumulated allowance tolerates packet jitter without trusting client speed.
      const elapsed = Math.max(0, (now - (runtime.lastMoveAt ?? now)) / 1000);
      runtime.lastMoveAt = now;
      const allowance = Math.min(speed * 0.5, (runtime.moveAllowance ?? speed * 0.25) + speed * elapsed);
      const dx = data.x - player.x;
      const dz = data.z - player.z;
      const distance = Math.hypot(dx, dz);
      if (runtime.awaitingWaypointArrival) {
        if (distance > 2) {
          client.send("movementCorrection", { x: player.x, y: player.y, z: player.z });
          return;
        }
        runtime.awaitingWaypointArrival = false;
      }
      const ratio = distance > allowance ? allowance / distance : 1;
      if (distance * ratio > 0.05 || Math.abs(data.y - player.y) > 0.05 ||
        Math.abs(data.rotationY - player.rotationY) > 0.02 || player.mounted !== wasMounted) {
        this.recordActivity(client.sessionId);
      }
      if (distance > 0.01) player.chatAnimation = "";
      const previousY = player.y;
      const nextX = player.x + dx * ratio;
      const nextZ = player.z + dz * ratio;
      player.x = Math.max(-WORLD_PLAYER_LIMIT, Math.min(WORLD_EAST_PLAYER_LIMIT, nextX));
      player.z = Math.max(-WORLD_PLAYER_LIMIT, Math.min(WORLD_PLAYER_LIMIT, nextZ));
      player.y = data.y;
      player.rotationY = data.rotationY;
      runtime.moveAllowance = Math.max(0, allowance - distance);
      if (ratio < 1 || player.x !== nextX || player.z !== nextZ) {
        client.send("movementCorrection", { x: player.x, y: player.y, z: player.z });
      }
      const fallDamage = getFallDamage(player, runtime, previousY, data.grounded,
        player.mounted || wasMounted, elapsed);
      if (fallDamage) this.damagePlayer(client.sessionId, fallDamage);

      if (!player.inDungeon) {
        for (const point of SPAWN_POINTS) {
          if (!point.discoveryRadius || runtime.unlockedSpawnPoints.has(point.id) ||
            Math.hypot(player.x - point.position.x, player.z - point.position.z) > point.discoveryRadius) continue;
          runtime.unlockedSpawnPoints.add(point.id);
          void Characters.updateAsync(
            { _id: player.characterId, userId: player.userId, unlockedSpawnPoints: { $ne: point.id } },
            { $addToSet: { unlockedSpawnPoints: point.id } }
          ).then((updated) => {
            if (updated) client.send("spawnPointUnlocked", point.name);
          }).catch((error) => {
            runtime.unlockedSpawnPoints.delete(point.id);
            console.error("[Spawn Points] Could not save discovery", error);
          });
        }
        for (const point of WAYPOINTS) {
          if (!point.discoveryRadius || runtime.unlockedWaypoints.has(point.id) ||
            Math.hypot(player.x - point.position.x, player.z - point.position.z) > point.discoveryRadius) continue;
          runtime.unlockedWaypoints.add(point.id);
          void Characters.updateAsync(
            { _id: player.characterId, userId: player.userId, unlockedWaypoints: { $ne: point.id } },
            { $addToSet: { unlockedWaypoints: point.id } }
          ).then((updated) => {
            if (updated) {
              client.send("waypointUnlocked", point.name);
              void trackAchievements(player.characterId, "waypoint", point.id);
            }
          }).catch((error) => {
            runtime.unlockedWaypoints.delete(point.id);
            console.error("[Waypoints] Could not save discovery", error);
          });
        }
        if (!runtime.visitedNorthernCamp &&
          Math.hypot(player.x - NORTHERN_CAMP.center.x, player.z - NORTHERN_CAMP.center.z) <= NORTHERN_CAMP.clearingRadius) {
          runtime.visitedNorthernCamp = true;
          void Characters.updateAsync({ _id: player.characterId, userId: player.userId }, {
            $set: { "adventureGuide.visitedNorthernCamp": true },
          }).catch((error) => {
            runtime.visitedNorthernCamp = false;
            console.error("[Adventure Guide] Could not save Northern Camp visit", error);
          });
        }
        for (const landmark of LANDMARKS) {
          if (runtime.discoveredLandmarks.has(landmark.id) ||
            Math.hypot(player.x - landmark.position.x, player.z - landmark.position.z) > landmark.discoveryRadius) continue;
          runtime.discoveredLandmarks.add(landmark.id);
          void (async () => {
            const claimed = await Characters.updateAsync(
              { _id: player.characterId, userId: player.userId, discoveredLandmarks: { $ne: landmark.id } },
              { $addToSet: { discoveredLandmarks: landmark.id } }
            );
            if (!claimed) return;
            const character = await Characters.findOneAsync(player.characterId);
            if (!character) return;
            const xp = getMaxXp(character.currentLevel ?? 1);
            const reward = Math.round(xp / 2);
            // Discovery grants an exact share of the level requirement, independent of XP gear.
            if (reward) await this.awardXp(player.characterId, reward, false);
            client.send("bossNotice", `Landmark Discovered: ${landmark.name} · +${reward} XP`);
          })().catch((error) => {
            console.error(`[Landmarks] Could not reward ${landmark.name} discovery`, error);
          });
        }
        runtime.reachedQuestLocations ||= new Set();
        runtime.questLocationRetryAt ||= new Map();
        for (const objective of LOCATION_QUESTS) {
          if (runtime.reachedQuestLocations.has(objective.target) ||
            Date.now() < (runtime.questLocationRetryAt.get(objective.target) || 0)) continue;
          const { x, z, radius = 10 } = objective;
          if (Math.hypot(player.x - x, player.z - z) > radius) continue;
          runtime.questLocationRetryAt.set(objective.target, Date.now() + 1000);
          void recordQuestEvent(this, player.characterId, "ReachLocation", objective.target)
            .then((advanced) => {
              if (advanced) runtime.reachedQuestLocations.add(objective.target);
            })
            .catch((error) => {
              console.error("[Quests] Could not save location progress", error);
            });
        }
      }

    },


    heal: (client) => {
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

      if (!getPlayerSkills(player).includes("heal") || runtime.changingSkills) return;
      const stats = getStatsForPlayer(player);
      this.recordActivity(client.sessionId);


      player.health =
        Math.min(
          player.maxHealth,
          player.health +
            stats.healAmount
        );


      runtime.healAvailableAt = now + HEAL_COOLDOWN;
      runtime.skillAvailableAt.heal = runtime.healAvailableAt;
      const code = SKILL_CODES[getPlayerSkills(player).indexOf("heal")];
      client.send("skillCooldown", { code, duration: HEAL_COOLDOWN });


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
      request = "Digit1"
    ) => {
      const mobileAttack = request && typeof request === "object" && "targetId" in request;
      const code = request && typeof request === "object" ? request.code : request;
      const targetId = mobileAttack && typeof request.targetId === "string" ? request.targetId : null;
      const preferredTargetId = !mobileAttack && typeof request?.preferredTargetId === "string"
        ? request.preferredTargetId : null;
      if (!SKILL_CODES.includes(code)) return;
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
        player.health <=
          0
      ) {
        return;
      }


      const skill = getTalentSkill(player.gameClass, code, player.currentLevel, getSelectedTalents(player), getPlayerSkills(player));
      if (!skill || runtime.changingSkills) return;
      if (skill.heal) return this.messages.heal(client);
      this.recordActivity(client.sessionId);
      const now =
        Date.now();


      if (
        now <
        runtime.attackAvailableAt || now < (runtime.skillAvailableAt[skill.id] || 0)
      ) {
        return;
      }


      runtime.attackAvailableAt =
        now +
        ATTACK.cooldown;

      runtime.skillAvailableAt[skill.id] = now + skill.cooldown;
      this.markPlayerInCombat(client.sessionId);
      player.mounted = false;
      player.respawnProtectedUntil = 0;
      if (skill.selfStatus) this.applyPlayerStatusEffect(player, skill.selfStatus);
      client.send("skillCooldown", { code, duration: skill.cooldown });
      if (skill.buff) return;

      if (skill.projectile) {
        this.projectiles.fire(client.sessionId, player, skill, targetId || preferredTargetId, mobileAttack);
        return;
      }

      if (skill.effect) {
        this.broadcast("attack", {
          sessionId: client.sessionId,
          effect: { id: `nova-${client.sessionId}-${now}`, type: skill.effect, x: player.x, y: player.y + 0.05, z: player.z, dx: 0, dz: 0, speed: 0, lifetime: 500, radius: skill.range },
        });
        await this.attackEnemy(client.sessionId, skill, targetId, mobileAttack);
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
        skill,
        targetId,
        mobileAttack
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

    const player = this.state.players.get(sessionId);
    if (player) {
      player.inCombat = true;
    }
  }

  isPlayerInCombat(sessionId, now = Date.now()) {
    const runtime = this.playerRuntime.get(sessionId);
    if (runtime && now - runtime.lastCombatAt < HEALTH_REGEN.delay) return true;
    for (const enemy of this.enemyRuntime.values()) {
      if (enemy.targetSessionId === sessionId) return true;
    }
    return false;
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

    const user = await Meteor.users.findOneAsync(auth.userId, {
      fields: { "profile.claimedTowerChestCharacterIds": 1 },
    });

    const guild = character.guildId && await Guilds.findOneAsync({
      _id: character.guildId,
      "members.characterId": character._id,
    });

    const unlockedSpawnPoints = new Set(character.unlockedSpawnPoints || []);
    const legacyIds = [DEFAULT_SPAWN_POINT.id];
    if (character.adventureGuide?.visitedNorthernCamp) legacyIds.push(NORTHERN_SPAWN_POINT.id);
    const missingIds = legacyIds.filter((id) => !unlockedSpawnPoints.has(id));
    if (missingIds.length) {
      await Characters.updateAsync(
        { _id: character._id, userId: auth.userId },
        { $addToSet: { unlockedSpawnPoints: { $each: missingIds } } }
      );
      missingIds.forEach((id) => unlockedSpawnPoints.add(id));
    }

    const unlockedWaypoints = new Set(character.unlockedWaypoints || []);
    const legacyWaypointIds = [DEFAULT_WAYPOINT.id];
    if (character.adventureGuide?.visitedNorthernCamp) legacyWaypointIds.push(NORTHERN_SPAWN_POINT.id);
    const missingWaypointIds = legacyWaypointIds.filter((id) => !unlockedWaypoints.has(id));
    if (missingWaypointIds.length) {
      await Characters.updateAsync(
        { _id: character._id, userId: auth.userId },
        { $addToSet: { unlockedWaypoints: { $each: missingWaypointIds } } }
      );
      missingWaypointIds.forEach((id) => unlockedWaypoints.add(id));
    }

    const discoveredLandmarks = new Set(character.discoveredLandmarks || []);
    // Preserve visits recorded before landmark discovery IDs existed.
    const legacyLandmarks = [
      ...(character.adventureGuide?.visitedAncientForestShrine ? ["ancient-forest-shrine"] : []),
      ...(character.questProgress?.["explore-highlands"] >= 1 ? ["highlands-lookout"] : []),
    ];
    const missingLandmarks = legacyLandmarks.filter((id) => !discoveredLandmarks.has(id));
    if (missingLandmarks.length) {
      await Characters.updateAsync(
        { _id: character._id, userId: auth.userId },
        { $addToSet: { discoveredLandmarks: { $each: missingLandmarks } } }
      );
      missingLandmarks.forEach((id) => discoveredLandmarks.add(id));
    }


    await trackAchievements(character._id, "level", character.currentLevel ?? 1);
    if (character.adventureGuide?.firstHunt) await trackAchievements(character._id, "hunt");
    for (const id of ["northern-camp", "snowy-mountains-waypoint"]) {
      if (unlockedWaypoints.has(id)) await trackAchievements(character._id, "waypoint", id);
    }
    if (user?.profile?.claimedTowerChestCharacterIds?.includes(character._id)) {
      await trackAchievements(character._id, "towerChest");
    }
    if (character.questProgress?.["into-the-depths"] || character.questProgress?.["northern-ruins-quest"]) {
      await trackAchievements(character._id, "dungeon");
    }
    if (character.questProgress?.["awakened-threat"] || character.questProgress?.["defend-northern-camp"]) {
      await trackAchievements(character._id, "worldEvent");
    }

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
        character.gameClass,
        character.species,
        character.talents
      );

    const now = Date.now();
    const speedPotionUntil = character.speedPotionUntil > now ? character.speedPotionUntil : 0;
    const powerPotionUntil = character.powerPotionUntil > now ? character.powerPotionUntil : 0;


    const player =
      new PlayerState({
        userId:
          auth.userId,

        characterId:
          character._id,

        towerChestClaimed: user?.profile?.claimedTowerChestCharacterIds?.includes(character._id) || false,

        name:
          character.name,

        guildTag: guild?.tag || "",

        gameClass: character.gameClass || "warrior",
        ...Object.fromEntries(getEquippedSkills(character.gameClass, character.equippedSkills).map((id, index) => [`skill${index + 1}`, id])),

        species: character.species || "human",

        currentLevel,
        ...Object.fromEntries(TALENT_LEVELS.map((level) => [`talent${level}`, character.talents?.[level] || ""])),
        movementSpeedMultiplier: stats.movementSpeedMultiplier * (speedPotionUntil ? 1.1 : 1),
        speedPotionUntil,
        powerPotionUntil,

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

        ...Object.fromEntries(QUESTS.filter((quest) => quest.progressField).map((quest) =>
          [quest.progressField, character.questProgress?.[quest.id] || 0])),
      });


    if (!isValidSkillLoadout(character.gameClass, character.equippedSkills)) {
      await Characters.updateAsync({ _id: character._id, userId: auth.userId },
        { $set: { equippedSkills: getEquippedSkills(character.gameClass, character.equippedSkills) } });
    }

    // Serialize title hydration/registration with Character updates so a selection
    // made while joining cannot be replaced by the earlier Character snapshot.
    await withCharacterSlots([auth.userId], async () => {
      const current = await Characters.findOneAsync(
        { _id: character._id, userId: auth.userId },
        { fields: { selectedTitle: 1 } }
      );
      if (!current) throw new Error("Character not found");
      player.selectedTitle = current.selectedTitle || "";
      this.state.players.set(client.sessionId, player);
      registerGuildPlayer(player);
    });


    this.playerRuntime.set(
      client.sessionId,
      {
        skillAvailableAt: {},
        healAvailableAt:
          0,

        attackAvailableAt:
          0,

        heavyStrikeAvailableAt: 0,
        cleaveAvailableAt: 0,

        lastCombatAt:
          0,

        lastActivityAt: Date.now(),
        visitedNorthernCamp: Boolean(character.adventureGuide?.visitedNorthernCamp),
        usedWaypoint: Boolean(character.adventureGuide?.usedWaypoint),
        discoveredLandmarks,
        unlockedSpawnPoints,
        unlockedWaypoints,
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
    const trace = client.dungeonExitTrace;
    trace?.("shared WorldRoom cleanup started");
    const leavingPlayer =
      this.state.players.get(
        client.sessionId
      );
    unregisterGuildPlayer(leavingPlayer);


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


    trace?.("lastPlayedAt persistence started");
    await Characters.updateAsync(
      leavingPlayer.characterId,
      {
        $set: {
          lastPlayedAt:
            new Date(),
        },
      }
    );
    trace?.("lastPlayedAt persistence completed");


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
      // The dungeon room owns active effects while the world avatar is parked.
      if (!player.inDungeon) {
        updateStatusEffects(player, (damage) => this.damagePlayer(sessionId, damage), now);
        player.movementSpeedMultiplier = getStatsForPlayer(player, now).movementSpeedMultiplier;
      }
      player.inCombat = player.health > 0 && this.isPlayerInCombat(sessionId, now);

      if (player.speedPotionUntil && player.speedPotionUntil <= now) {
        player.speedPotionUntil = 0;
        player.movementSpeedMultiplier = getStatsForPlayer(player, now).movementSpeedMultiplier;
      }
      if (player.powerPotionUntil && player.powerPotionUntil <= now) {
        player.powerPotionUntil = 0;
      }

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


  isPlayerProtected(player) {
    return player.respawnProtectedUntil > Date.now() || (this.campSafeZoneEnabled && isInsideCamp(player));
  }

  canEnemyTarget(player) {
    return Boolean(player && !player.inDungeon && player.health > 0 && !this.isPlayerProtected(player));
  }

  moveEnemy(enemy, x, z, runtime) {
    const speed = getStatusModifiers(enemy).movementSpeed;
    x = enemy.x + (x - enemy.x) * speed;
    z = enemy.z + (z - enemy.z) * speed;
    if (runtime?.chaseOrigin && !runtime.returning) {
      const stats = this.getEnemyStats(enemy.type, enemy.level, enemy.rare);
      if (Math.hypot(x - runtime.chaseOrigin.x, z - runtime.chaseOrigin.z) >= stats.chaseRadius) {
        runtime.returning = true;
        return false;
      }
    }
    if (this.campSafeZoneEnabled && crossesCamp(enemy, { x, z })) return false;
    enemy.x = x;
    enemy.z = z;
    enemy.y = getWorldHeight(x, z);
    return true;
  }

  damagePlayer(
    sessionId,
    damage,
    hitStatus = null
  ) {
    const player =
      this.state.players.get(
        sessionId
      );


    if (
      !player ||
      player.inDungeon ||
      this.isPlayerProtected(player) ||
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


    if (hitStatus) this.applyPlayerStatusEffect(player, hitStatus);

    if (
      player.health >
      0
    ) {
      return;
    }

    player.speedPotionUntil = 0;
    player.powerPotionUntil = 0;
    clearStatusEffects(player);
    player.movementSpeedMultiplier = getStatsForPlayer(player).movementSpeedMultiplier;
    void Characters.updateAsync(
      { _id: player.characterId, userId: player.userId },
      { $set: { speedPotionUntil: 0, powerPotionUntil: 0 } }
    ).catch((error) => console.error("[Consumables] Could not clear potion buffs", error));


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
          currentPlayer,
          sessionId
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
    player,
    sessionId
  ) {
    const runtime = this.playerRuntime.get(sessionId);
    resetFallTracking(runtime);
    const unlocked = runtime?.unlockedSpawnPoints;
    const spawnPoint = this.campSafeZoneEnabled
      ? getNearestUnlockedSpawnPoint(player, unlocked ? [...unlocked] : [])
      : DEFAULT_SPAWN_POINT;
    player.x = spawnPoint.position.x;


    player.y = spawnPoint.position.y;


    player.z = spawnPoint.position.z;


    player.rotationY =
      0;


    player.health =
      player.maxHealth;
    player.respawnProtectedUntil = Date.now() + CAMP_PROTECTION.respawnProtectionMs;
  }


  /*
   * =====================================================
   * XP
   * =====================================================
   */

  async awardXp(
    characterId,
    amount,
    applyXpGainMultiplier = true
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
          applyXpGainMultiplier
            ? Math.round(amount * getPlayerStats(previousLevel, character.equipment, character.gameClass).xpGainMultiplier)
            : amount,
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
          player.gameClass,
          player.species,
          getSelectedTalents(player)
        );


        player.maxHealth =
          stats.maxHealth;
        player.movementSpeedMultiplier = getStatsForPlayer(player).movementSpeedMultiplier;


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
    if (this.campSafeZoneEnabled) spawn = { ...spawn, ...outsideCampPosition(spawn) };
    const rare = !getEnemyStats(spawn.type, spawn.level).bossMechanics && Math.random() < RARE_ENEMY.chance;
    const stats = this.getEnemyStats(spawn.type, spawn.level, rare, spawn.scaling);
    const enemy =
      new EnemyState({
        type: spawn.type,
        level: spawn.level,
        rare,
        x:
          spawn.x,

        y:
          getWorldHeight(spawn.x, spawn.z),

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
        isBoss: Boolean(stats.bossMechanics),
        chaseOrigin: null,
        returning: false,

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

  getEnemyStats(type, level, rare = false, scaling = {}) {
    const stats = getEnemyStats(type, level, rare);
    return {
      ...stats,
      speed: stats.speed * WORLD_ENEMY_SPEED_MULTIPLIER,
      health: stats.health * (scaling.health ?? 1),
      attackDamage: stats.attackDamage * (scaling.damage ?? 1) * 0.5 +
        (type === "wolf" && level === 2 ? 10 : 0),
    };
  }

  async attackEnemy(
    sessionId,
    skill,
    targetId = null,
    mobileAttack = false
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


    skill = skill || getTalentSkill(player.gameClass, "Digit1", player.currentLevel, getSelectedTalents(player), getPlayerSkills(player));
    const range = skill.range + (mobileAttack ? MOBILE_TARGETING.hitPadding : 0);
    const target = skill.aoe ? null :
      (targetId && this.getTargetEnemy(player, targetId, range)) ||
      this.findClosestEnemy(player, range, mobileAttack ? MOBILE_TARGETING.coneDot : null);


    const targets = skill.aoe
      ? Array.from(this.state.enemies.entries())
        .filter(([, enemy]) => enemy.health > 0 && this.getHorizontalDistance(player, enemy) <= skill.range)
        .map(([enemyId, enemy]) => ({ enemyId, enemy }))
      : target ? [target] : [];

    // Snapshot targets so killing a dungeon pack cannot hit the next stage.
    await Promise.all(targets.map(({ enemyId, enemy }) =>
      this.damageEnemy(sessionId, enemyId, enemy, skill.damageMultiplier, skill.aoe, skill.hitStatus)));
  }


  async damageEnemy(sessionId, enemyId, enemy, damageMultiplier, aoe = false, hitStatus = null) {
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

    this.onEnemyAttacked?.();

    this.clients.find((client) => client.sessionId === sessionId)
      ?.send("enemyEngaged", { id: enemyId, level: enemy.level });


    this.markPlayerInCombat(
      sessionId
    );


    /*
     * Enemy becomes aggressive
     * towards this player.
     */

    if (!runtime.returning && this.canEnemyTarget(player)) {
      runtime.chaseOrigin ||= { x: enemy.x, z: enemy.z };
      runtime.targetSessionId = sessionId;
    }

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

    if (hitStatus) applyStatusEffect(enemy, hitStatus);
    await this.applyEnemyDamage(enemyId, enemy, stats.damage * damageMultiplier * (aoe ? stats.aoeDamageMultiplier : 1));
  }

  async applyEnemyDamage(enemyId, enemy, damage) {
    const runtime = this.enemyRuntime.get(enemyId);
    if (!runtime || enemy.health <= 0 || this.state.enemies.get(enemyId) !== enemy) return;
    runtime.lastCombatAt = Date.now();
    enemy.health = Math.max(0, enemy.health - damage);
    if (enemy.health <= 0) {
      clearStatusEffects(enemy);
      await this.killEnemy(enemyId);
    }
  }


  getTargetEnemy(player, enemyId, maxDistance) {
    const enemy = this.state.enemies.get(enemyId);
    return enemy?.health > 0 && this.getHorizontalDistance(player, enemy) <= maxDistance
      ? { enemyId, enemy } : null;
  }

  findClosestEnemy(
    player,
    maxDistance,
    coneDot = null
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

      if (enemy.health <= 0) continue;
      if (coneDot !== null && distance > 0 &&
        ((enemy.x - player.x) * Math.sin(player.rotationY) +
          (enemy.z - player.z) * Math.cos(player.rotationY)) / distance < coneDot) continue;

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
    const enemy = this.state.enemies.get(enemyId);
    const rare = enemy?.rare;
    const lootOwners = new Set();
    const lootSessions = new Map();
    const nearbyHuntKills = new Set();
    for (const [sessionId, player] of this.state.players.entries()) {
      if (!spawn.eventId && !player.inDungeon && contributors.has(player.characterId) &&
        getQuestArea(player) === spawn.type) nearbyHuntKills.add(player.characterId);
      if (!contributors.has(player.characterId) || lootOwners.has(player.userId)) {
        continue;
      }
      lootSessions.set(player.characterId, sessionId);
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
    if (!spawn.eventId) this.clock.setTimeout(() => this.spawnEnemy(spawn), stats.respawnDelay);

    for (const characterId of contributors) {
      const newlyUnlocked = await trackAchievements(characterId, "kill", spawn.type || "boar");
      const sessionId = lootSessions.get(characterId);
      const firstKill = newlyUnlocked.has("firstBlood");
      if (sessionId && this.state.players.get(sessionId)?.characterId === characterId &&
        (firstKill || !stats.moneyReward || stats.accessoryDropChance)) {
        spawnLoot(this, enemy, sessionId, firstKill);
      }
      if (rare) await trackAchievements(characterId, "rare");
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


      await recordQuestEvent(this, characterId, "Kill", spawn.type || "boar",
        { includeHunts: nearbyHuntKills.has(characterId) })
        .catch((error) => console.error("[Quests] Could not save kill progress", error));
      await recordQuestEvent(this, characterId, "Boss", spawn.type || "boar",
        { includeHunts: nearbyHuntKills.has(characterId), spawnId: spawn.id })
        .catch((error) => console.error("[Quests] Could not save boss progress", error));
    }

    // Finish normal kill rewards before granting event-completion XP.
    if (spawn.eventId) this.worldEvents?.onEnemyKilled(enemyId);

  }


  /*
   * =====================================================
   * ENEMY AI
   * =====================================================
   */

  updateEnemies(
    deltaTime
  ) {
    this.worldEvents?.update();
    this.projectiles.update(deltaTime);
    for (
      const [
        enemyId,
        enemy,
      ]
      of this.state.enemies.entries()
    ) {
      updateStatusEffects(enemy, (damage) => {
        // The early Giant needs to survive percentage-based DoTs without weakening other enemies.
        const multiplier = ENEMY_TYPES[enemy.type]?.damageOverTimeMultiplier ?? 1;
        void this.applyEnemyDamage(enemyId, enemy, damage * multiplier)
          .catch((error) => console.error("[Status effects] Enemy damage failed", error));
      });
      if (this.state.enemies.get(enemyId) !== enemy) continue;
      const runtime =
        this.enemyRuntime.get(
          enemyId
        );


      if (
        !runtime
      ) {
        continue;
      }


      runtime.aiElapsed = (runtime.aiElapsed || 0) + deltaTime;
      let nearby = Boolean(runtime.targetSessionId || runtime.returning);
      if (!nearby) {
        for (const player of this.state.players.values()) {
          if (!player.inDungeon && player.health > 0 &&
              (player.x - enemy.x) ** 2 + (player.z - enemy.z) ** 2 <= PERFORMANCE.activeEnemyDistance ** 2) {
            nearby = true;
            break;
          }
        }
      }
      if (!nearby && runtime.aiElapsed < PERFORMANCE.inactiveEnemyInterval) continue;
      const elapsed = nearby ? deltaTime : runtime.aiElapsed;
      runtime.aiElapsed = 0;
      const beforeMovement = { x: enemy.x, z: enemy.z };
      this.updateEnemy(enemyId, enemy, runtime, elapsed);
      this.projectiles.recordTargetMovement(enemy, beforeMovement, elapsed);

      enemy.bossActive = Boolean(runtime.isBoss && runtime.targetSessionId);
      this.updateEnemyRegeneration(enemy, runtime, elapsed);
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
    const stats = this.getEnemyStats(enemy.type, enemy.level, enemy.rare, runtime.spawn.scaling);
    stats.attackDamage *= getStatusModifiers(enemy).damage;
    if (runtime.isBoss && !runtime.targetSessionId && !runtime.chaseOrigin && !runtime.returning && enemy.health > 0) {
      let nearestDistance = stats.aggroRadius;
      for (const [sessionId, player] of this.state.players.entries()) {
        if (!this.canEnemyTarget(player)) continue;
        const distance = Math.hypot(player.x - enemy.x, player.z - enemy.z);
        if (distance <= nearestDistance) {
          nearestDistance = distance;
          runtime.targetSessionId = sessionId;
        }
      }
    }
    if (updateEnemyLeash(this, enemy, runtime, stats, deltaTime)) return;
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
      !this.canEnemyTarget(target)
    ) {
      cancelBossAction(enemy, runtime);
      runtime.targetSessionId =
        null;


      runtime.nextAttackAt =
        0;


      return;
    }


    if (updateBossMechanics(this, enemy, runtime, target, stats, deltaTime)) return;
    const damageMultiplier = enemy.enraged ? stats.bossMechanics.enrage.damageMultiplier : 1;
    const speedMultiplier = enemy.enraged ? stats.bossMechanics.enrage.speedMultiplier : 1;

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
        stats.speed * speedMultiplier * ENEMY_COMBAT_SPEED_MULTIPLIER *
        (
          deltaTime /
          1000
        );


      this.moveEnemy(enemy, enemy.x + dx / safeDistance * movement, enemy.z + dz / safeDistance * movement, runtime);


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
      stats.attackDamage * damageMultiplier,
      stats.hitStatus
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
    const stats = this.getEnemyStats(enemy.type, enemy.level, enemy.rare);
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


    if (!this.moveEnemy(enemy, enemy.x + dx / safeDistance * movement, enemy.z + dz / safeDistance * movement)) {
      runtime.wanderTarget = null;
      runtime.nextWanderAt = now + stats.wanderWait;
    }
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
