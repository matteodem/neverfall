import { PERFORMANCE } from "../../imports/game/performanceConfig";
import { trackAchievements } from "../achievements";
import { LOOT_RANGE } from "../../imports/game/inventory";
import { PLAYER } from "../../imports/game/config";
import { WorldRoom } from "./WorldRoom";
import { DungeonState, LootState } from "./WorldState";
import { getDungeonAccess, removeDungeonAccess } from "./dungeonInstances";
import { getDungeonConfig, DUNGEON_PLAYER_FIELDS, nearDungeonObject } from "../../imports/game/dungeonConfig";
import { getWorldHeight } from "../../imports/game/worldConfig";
import { collectLoot, spawnLoot } from "../inventory/loot";
import { recordQuestEvent } from "../quests";
import { QUESTS } from "../../imports/game/quests";

const HUNT_FIELDS = QUESTS.map((quest) => quest.progressField).filter(Boolean);

const COMBAT_TIMERS = ["healAvailableAt", "attackAvailableAt", "heavyStrikeAvailableAt", "cleaveAvailableAt", "lastCombatAt"];

export class DungeonRoom extends WorldRoom {
  campSafeZoneEnabled = false;
  mountsAllowed = false;
  state = new DungeonState();
  participants = new Map();

  // Combat/equipment messages are reused; party actions use the world connection.
  messages = {
    ...Object.fromEntries(Object.entries(this.messages).filter(([name]) =>
      !["groupInvite", "groupAccept", "groupIgnore", "groupLeave", "dungeonEnter"].includes(name))),
    dungeonExit: (client) => {
      const player = this.state.players.get(client.sessionId);
      if (player) this.recordActivity(client.sessionId);
      if (player?.health > 0 && nearDungeonObject(player, this.config.exit, this.config.interactionDistance)) client.send("dungeonExitReady");
      else client.send("dungeonError", "Move closer to the exit portal.");
    },
    dungeonReward: async (client) => {
      const player = this.state.players.get(client.sessionId);
      if (!this.state.completed || !player || !nearDungeonObject(player, this.config.chest, LOOT_RANGE)) return;
      this.recordActivity(client.sessionId);
      await collectLoot(this, client, `chest-${player.characterId}`);
    },
  };

  async onCreate({ accessKey } = {}) {
    this.patchRate = PERFORMANCE.statePatchInterval;
    const access = getDungeonAccess(accessKey);
    if (!access || access.roomId) throw new Error("Dungeon access denied");
    this.config = getDungeonConfig(access.dungeonId);
    if (!this.config) throw new Error("Unknown dungeon");
    access.roomId = this.roomId;
    this.access = access;
    this.accessKey = accessKey;
    this.maxClients = 5;
    await this.setPrivate(true);
    this.spawnStage();
    this.setTimestep((deltaTime) => {
      this.updateEnemies(deltaTime);
      this.updatePlayerRegeneration(deltaTime);
      this.syncPartyState();
    }, 50);
    this.startAfkChecks();
  }

  async onJoin(client, options, auth) {
    const source = this.access.world.state.players.get(options.worldSessionId);
    const allowed = source && source.userId === auth.userId && source.characterId === auth.characterId
      && (this.access.groupId ? source.groupId === this.access.groupId : !source.groupId && source.characterId === this.access.soloCharacterId);
    if (!allowed || source.inDungeon || source.health <= 0 ||
      !nearDungeonObject(source, this.config.entrance, this.config.interactionDistance)) {
      throw new Error("You cannot enter this dungeon instance.");
    }
    if (this.state.completed && !this.participants.has(source.characterId)) throw new Error("This dungeon is already completed.");
    if ([...this.state.players.values()].some((player) => player.characterId === source.characterId || player.userId === source.userId)) throw new Error("Already in this dungeon.");
    source.inDungeon = true;
    source.mounted = false;
    try {
      await super.onJoin(client, options, auth);
      // The world connection may have closed while loading persistent data.
      if (this.access.world.state.players.get(options.worldSessionId) !== source) throw new Error("World connection lost.");
      if (this.access.groupId ? source.groupId !== this.access.groupId : Boolean(source.groupId)) throw new Error("Your group changed. Please enter again.");
      const player = this.state.players.get(client.sessionId);
      player.worldSessionId = options.worldSessionId;
      const worldRuntime = this.access.world.playerRuntime.get(options.worldSessionId);
      worldRuntime.dungeonRoomId = this.roomId;
      const runtime = this.playerRuntime.get(client.sessionId);
      for (const key of COMBAT_TIMERS) runtime[key] = worldRuntime[key];
      this.recordActivity(client.sessionId);
      player.groupId = source.groupId;
      player.health = Math.min(source.health, player.maxHealth);
      player.speedPotionUntil = source.speedPotionUntil;
      player.powerPotionUntil = source.powerPotionUntil;
      player.movementSpeedMultiplier = source.movementSpeedMultiplier;
      player.respawnProtectedUntil = source.respawnProtectedUntil;
      this.respawnPosition(player);
      if (!this.participants.has(player.characterId)) {
        this.participants.set(player.characterId, { userId: player.userId, claimed: false });
      }
      const participant = this.participants.get(player.characterId);
      player.dungeonRewardClaimed = participant.claimed;
    } catch (error) {
      source.inDungeon = false;
      this.state.players.delete(client.sessionId);
      this.playerRuntime.delete(client.sessionId);
      throw error;
    }
  }

  respawnPosition(player) {
    player.x = this.config.spawn.x;
    player.y = 0;
    player.z = this.config.spawn.z;
    player.rotationY = 0;
  }

  getProjectileTerrainHeight() {
    return 0;
  }

  respawnPlayer(player) {
    super.respawnPlayer(player);
    this.respawnPosition(player);
  }

  spawnStage() {
    const stage = this.config.stages[this.state.stage];
    if (stage.boss) {
      const { id, type, level, position } = this.config.finalBoss;
      this.spawnEnemy({ id, type, level, ...position });
    } else {
      for (const spawn of stage.enemies) this.spawnEnemy(spawn);
    }
  }

  getEnemyStats(type, level, rare = false, scaling = {}) {
    const stats = super.getEnemyStats(type, level, rare, scaling);
    return {
      ...stats,
      health: stats.health * this.config.enemyHealthMultiplier,
      attackDamage: stats.attackDamage * this.config.enemyDamageMultiplier,
      speed: (scaling.speed ?? PLAYER.speed) * this.config.enemySpeedMultiplier,
    };
  }

  killEnemy(enemyId) {
    const runtime = this.enemyRuntime.get(enemyId);
    if (!runtime) return;
    // The final boss's accessory roll belongs to the existing reward chest.
    const enemy = this.state.enemies.get(enemyId);
    if (runtime.spawn.id === this.config.miniBoss?.id ||
      runtime.spawn.type === this.config.miniBoss?.type || enemy?.rare) {
      for (const [sessionId, player] of this.state.players) {
        if (runtime.contributors.has(player.characterId)) spawnLoot(this, enemy, sessionId);
      }
    }
    for (const characterId of runtime.contributors) {
      void trackAchievements(characterId, "kill", runtime.spawn.type || "boar");
      if (enemy?.rare) void trackAchievements(characterId, "rare");
      void recordQuestEvent(this, characterId, "Kill", runtime.spawn.type || "boar")
        .catch((error) => console.error("[Quests] Could not save kill progress", error));
      void recordQuestEvent(this, characterId, "Boss", runtime.spawn.type || "boar")
        .catch((error) => console.error("[Quests] Could not save boss progress", error));
    }
    this.state.enemies.delete(enemyId);
    this.enemyRuntime.delete(enemyId);
    if (this.state.enemies.size) return;
    if (this.state.stage < this.config.stages.length - 1) {
      this.state.stage++;
      this.spawnStage();
    } else if (!this.state.completed) {
      this.state.bossDefeated = true;
      this.state.completed = true;
      for (const [characterId, participant] of this.participants) this.addChestLoot(characterId, participant);
      for (const characterId of this.participants.keys()) {
        void trackAchievements(characterId, "dungeon");
        void recordQuestEvent(this, characterId, "CompleteDungeon", this.config.id)
          .catch((error) => console.error("[Quests] Could not save dungeon progress", error));
      }
    }
  }

  addChestLoot(characterId, participant) {
    if (participant.claimed) return;
    this.state.loot.set(`chest-${characterId}`, new LootState({
      ownerId: participant.userId, ownerCharacterId: characterId,
      enemyType: this.config.rewards.lootType, xpReward: this.config.rewards.xp,
      x: this.config.chest.x, y: 0, z: this.config.chest.z,
    }));
  }

  onLootCollected(player, loot) {
    if (loot.enemyType !== this.config.rewards.lootType) return;
    this.participants.get(player.characterId).claimed = true;
    player.dungeonRewardClaimed = true;
  }

  syncPartyState() {
    for (const player of this.state.players.values()) {
      const source = this.access.world.state.players.get(player.worldSessionId);
      if (!source) continue;
      player.groupId = source.groupId;
      for (const key of DUNGEON_PLAYER_FIELDS) source[key] = player[key];
      for (const key of HUNT_FIELDS) source[key] = player[key];
    }
  }

  // WorldRoom.onLeave still handles aggro cleanup and last-played persistence.
  leaveGroup() {}

  async onLeave(client) {
    this.syncPartyState();
    const player = this.state.players.get(client.sessionId);
    const source = player && this.access.world.state.players.get(player.worldSessionId);
    if (source) {
      const runtime = this.access.world.playerRuntime.get(player.worldSessionId);
      if (runtime?.dungeonRoomId === this.roomId) {
        runtime.dungeonRoomId = null;
        const activeRuntime = this.playerRuntime.get(client.sessionId);
        for (const key of COMBAT_TIMERS) runtime[key] = activeRuntime[key];
      }
      if (source.health <= 0) source.health = source.maxHealth;
      source.x = this.config.entrance.x;
      source.z = this.config.entrance.z + 4;
      source.y = getWorldHeight(source.x, source.z);
      source.rotationY = 0;
      source.inDungeon = false;
    }
    await super.onLeave(client);
  }

  onDispose() {
    removeDungeonAccess(this.accessKey);
  }
}
