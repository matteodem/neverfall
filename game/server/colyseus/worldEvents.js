import { Meteor } from "meteor/meteor";
import { WORLD_EVENTS } from "../../imports/game/worldEvents";
import { spawnLoot } from "../inventory/loot";
import { WorldEventState } from "./WorldState";

// One active event per world room. Waves use the ordinary enemy lifecycle.
export const createWorldEvents = (room) => {
  const startedAt = Date.now();
  const nextStarts = new Map(WORLD_EVENTS.map((event) => [event.id, startedAt + event.initialDelay]));
  const nextConfig = () => WORLD_EVENTS.reduce((earliest, event) =>
    nextStarts.get(event.id) < nextStarts.get(earliest.id) ? event : earliest);
  let config = nextConfig();
  let run = 0;
  let stage = 0;
  let nextWaveAt = 0;
  const enemies = new Set();
  const participants = new Map();
  const state = new WorldEventState({ nextStartAt: nextStarts.get(config.id) });
  room.state.worldEvent = state;

  const nearbyPlayers = (targetableOnly = true) => Array.from(room.state.players.entries()).filter(([, player]) =>
    player.characterId && player.health > 0 && !player.inDungeon &&
    (!targetableOnly || room.canEnemyTarget(player)) &&
    Math.hypot(player.x - config.center.x, player.z - config.center.z) <= config.participationRadius);

  const trackParticipants = () => {
    const nearby = state.status === "active" ? nearbyPlayers(false) : [];
    const sessions = new Set(nearby.map(([sessionId]) => sessionId));
    for (const [sessionId, player] of room.state.players) {
      player.worldEventId = sessions.has(sessionId) ? config.id : "";
    }
    const eligible = nearby.filter(([, player]) => room.canEnemyTarget(player));
    for (const [, player] of eligible) {
      participants.set(player.characterId, { userId: player.userId });
    }
    return eligible;
  };

  const spawnStage = () => {
    nextWaveAt = 0;
    state.nextWaveIn = 0;
    const wave = config.waves[stage] || config.boss;
    const playerCount = Math.max(1, new Set(nearbyPlayers().map(([, player]) => player.characterId)).size);
    const extraPlayers = playerCount - 1;
    const scaling = {
      health: 1 + extraPlayers * (config.scaling?.healthPerExtraPlayer ?? 0),
      damage: 1 + extraPlayers * (config.scaling?.damagePerExtraPlayer ?? 0),
    };
    state.wave = Math.min(stage + 1, config.waves.length + 1);
    for (let index = 0; index < wave.count; index++) {
      const angle = index * Math.PI * 2 / wave.count + stage * 0.4;
      const id = `event-${config.id}-${run}-${stage}-${index}`;
      room.spawnEnemy({ id, type: wave.type, level: wave.level,
        x: config.center.x + Math.cos(angle) * config.spawnRadius,
        y: 0, z: config.center.z + Math.sin(angle) * config.spawnRadius,
        eventId: config.id, scaling });
      enemies.add(id);
    }
    state.enemiesRemaining = enemies.size;
  };

  const finish = (completed) => {
    if (state.status !== "active") return;
    const recipients = new Map(participants);
    const rewardConfig = config;
    state.status = "cooldown";
    nextStarts.set(config.id, Date.now() + config.cooldown);
    state.nextStartAt = nextStarts.get(nextConfig().id);
    state.enemiesRemaining = 0;
    nextWaveAt = 0;
    state.nextWaveIn = 0;
    for (const id of enemies) {
      room.state.enemies.delete(id);
      room.enemyRuntime.delete(id);
    }
    enemies.clear();
    participants.clear();
    trackParticipants();
    room.broadcast("worldEventNotice", completed
      ? `World Event: ${config.name} completed!` : `World Event: ${config.name} has ended.`);
    if (!completed) return;

    // Claim completion before any persistence work, so concurrent kills cannot pay twice.
    for (const [characterId, participant] of recipients) {
      for (const [sessionId, player] of room.state.players) {
        if (player.characterId === characterId) {
          spawnLoot(room, { type: rewardConfig.rewards.lootType, ...rewardConfig.center, y: 0 }, sessionId);
          break;
        }
      }
      void (async () => {
        await room.awardXp(characterId, rewardConfig.rewards.xp);
        await Meteor.users.updateAsync(participant.userId, {
          $inc: { "profile.inventory.money": rewardConfig.rewards.money },
        });
      })().catch((error) => console.error("[World Events] Could not save completion reward", error));
    }
  };

  return {
    update() {
      const now = Date.now();
      if (state.status === "cooldown") {
        config = nextConfig();
        if (now < state.nextStartAt) return;
        state.id = config.id;
        state.name = config.name;
        state.status = "active";
        state.totalWaves = config.waves.length;
        state.endsAt = now + config.duration;
        run++;
        stage = 0;
        trackParticipants();
        spawnStage();
        room.broadcast("worldEventNotice", config.announcement);
      }
      if (now >= state.endsAt) { finish(false); return; }
      const nearby = trackParticipants();
      if (nextWaveAt) {
        state.nextWaveIn = Math.max(0, Math.ceil((nextWaveAt - now) / 1000));
        if (now < nextWaveAt) return;
        spawnStage();
      }
      for (const id of enemies) {
        const enemy = room.state.enemies.get(id);
        const runtime = room.enemyRuntime.get(id);
        if (!enemy || !runtime || runtime.targetSessionId) continue;
        let closest = Infinity;
        for (const [sessionId, player] of nearby) {
          const distance = Math.hypot(player.x - enemy.x, player.z - enemy.z);
          if (distance < closest) { closest = distance; runtime.targetSessionId = sessionId; }
        }
      }
    },
    onEnemyKilled(id) {
      if (state.status !== "active" || !enemies.delete(id)) return;
      trackParticipants();
      state.enemiesRemaining = enemies.size;
      if (enemies.size) return;
      stage++;
      if (stage <= config.waves.length) {
        nextWaveAt = Date.now() + config.waveDelay;
        state.nextWaveIn = Math.ceil(config.waveDelay / 1000);
        state.wave = stage + 1;
      }
      else finish(true);
    },
  };
};
