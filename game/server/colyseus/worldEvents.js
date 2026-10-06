import { Meteor } from "meteor/meteor";
import { WORLD_EVENTS, WORLD_EVENT_INTERACTION_RADIUS } from "../../imports/game/worldEvents";
import { getWorldHeight } from "../../imports/game/worldConfig";
import { spawnLoot } from "../inventory/loot";
import { WorldEventState } from "./WorldState";
import { recordQuestEvent } from "../quests";
import { trackAchievements } from "../achievements";

// One active event per world room. Phases use the ordinary enemy lifecycle.
export const createWorldEvents = (room) => {
  const startedAt = Date.now();
  const nextStarts = new Map(WORLD_EVENTS.map((event) => [event.id, startedAt + event.initialDelay]));
  const nextConfig = () => WORLD_EVENTS.reduce((earliest, event) =>
    nextStarts.get(event.id) < nextStarts.get(earliest.id) ? event : earliest);
  let config = nextConfig();
  const getPhases = (event) => event.phases || [
    ...event.waves.map((wave, index) => ({ type: "combat", name: `Wave ${index + 1}`,
      objective: "Defeat the enemies", waves: [wave] })),
    { type: "boss", name: `Defeat ${event.name}`, objective: "Defeat the boss", boss: event.boss },
  ];
  let phases = getPhases(config);
  let run = 0;
  let phaseIndex = 0;
  let waveIndex = 0;
  let pointIndex = 0;
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
    const phase = phases[phaseIndex];
    const wave = phase.type === "boss" ? phase.boss : phase.waves[waveIndex];
    const playerCount = Math.max(1, new Set(nearbyPlayers().map(([, player]) => player.characterId)).size);
    const extraPlayers = playerCount - 1;
    const scaling = {
      health: 1 + extraPlayers * (config.scaling?.healthPerExtraPlayer ?? 0),
      damage: 1 + extraPlayers * (config.scaling?.damagePerExtraPlayer ?? 0),
    };
    state.wave = waveIndex + 1;
    for (let index = 0; index < wave.count; index++) {
      const angle = index * Math.PI * 2 / wave.count + (phaseIndex + waveIndex) * 0.4;
      const id = `event-${config.id}-${run}-${phaseIndex}-${waveIndex}-${index}`;
      room.spawnEnemy({ id, type: wave.type, level: wave.level,
        x: config.center.x + Math.cos(angle) * config.spawnRadius,
        y: 0, z: config.center.z + Math.sin(angle) * config.spawnRadius,
        eventId: config.id, scaling });
      enemies.add(id);
    }
    state.enemiesRemaining = enemies.size;
  };

  const startPhase = () => {
    const phase = phases[phaseIndex];
    waveIndex = 0;
    pointIndex = 0;
    nextWaveAt = 0;
    state.nextWaveIn = 0;
    state.phase = phaseIndex + 1;
    state.totalPhases = phases.length;
    state.phaseName = phase.name;
    state.objective = phase.objective;
    state.objectiveProgress = 0;
    state.objectiveTarget = phase.type === "combat"
      ? phase.waves.reduce((total, wave) => total + wave.count, 0)
      : phase.type === "interact" ? phase.points.length : 1;
    state.interaction = phase.type === "interact" ? phase.interaction : "";
    state.objectiveX = phase.type === "interact" ? phase.points[0].x : config.center.x;
    state.objectiveZ = phase.type === "interact" ? phase.points[0].z : config.center.z;
    state.totalWaves = phase.type === "combat" ? phase.waves.length : 0;
    state.wave = 0;
    state.enemiesRemaining = 0;
    if (phase.type !== "interact") spawnStage();
    if (phaseIndex) room.broadcast("worldEventNotice", `${config.name}: ${phase.name}`);
  };

  const finish = (completed) => {
    if (state.status !== "active") return;
    const recipients = new Map(participants);
    const rewardConfig = config;
    state.status = "cooldown";
    nextStarts.set(config.id, Date.now() + config.cooldown);
    state.nextStartAt = nextStarts.get(nextConfig().id);
    state.enemiesRemaining = 0;
    state.interaction = "";
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
          spawnLoot(room, { type: rewardConfig.rewards.lootType, ...rewardConfig.center,
            y: getWorldHeight(rewardConfig.center.x, rewardConfig.center.z) }, sessionId);
          break;
        }
      }
      void (async () => {
        await trackAchievements(characterId, "worldEvent");
        await recordQuestEvent(room, characterId, "CompleteEvent", rewardConfig.id)
          .catch((error) => console.error("[Quests] Could not save event progress", error));
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
        state.activatedSeals = 0;
        state.endsAt = now + config.duration;
        run++;
        phases = getPhases(config);
        phaseIndex = 0;
        trackParticipants();
        startPhase();
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
        if (!enemy || !runtime || runtime.targetSessionId || runtime.returning || runtime.chaseOrigin) continue;
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
      state.objectiveProgress++;
      state.enemiesRemaining = enemies.size;
      if (enemies.size) return;
      const phase = phases[phaseIndex];
      if (phase.type === "combat" && ++waveIndex < phase.waves.length) {
        nextWaveAt = Date.now() + config.waveDelay;
        state.nextWaveIn = Math.ceil(config.waveDelay / 1000);
        state.wave = waveIndex + 1;
      } else if (++phaseIndex < phases.length) startPhase();
      else finish(true);
    },
    interact(client) {
      if (state.status !== "active") return;
      const phase = phases[phaseIndex];
      if (phase.type !== "interact") return;
      const player = room.state.players.get(client.sessionId);
      const point = phase.points[pointIndex];
      if (!player || player.health <= 0 || player.inDungeon ||
        Math.hypot(player.x - point.x, player.z - point.z) > WORLD_EVENT_INTERACTION_RADIUS) return;
      trackParticipants();
      pointIndex++;
      state.objectiveProgress = pointIndex;
      const frozenSeal = config.id === "frozen-rift" && phase.interaction === "seal";
      if (frozenSeal) state.activatedSeals = pointIndex;
      if (pointIndex >= phase.points.length) {
        phaseIndex++;
        if (phaseIndex < phases.length) startPhase();
        else finish(true);
      } else {
        state.objectiveX = phase.points[pointIndex].x;
        state.objectiveZ = phase.points[pointIndex].z;
      }
      if (frozenSeal) {
        room.broadcast("worldEventNotice", `Frozen Rift Seal activated — ${pointIndex} / ${phase.points.length}`);
      }
    },
  };
};
