import { ENEMY_COMBAT_SPEED_MULTIPLIER } from "../../imports/game/enemyConfig";

// Special attacks use the same authoritative damage path as normal melee.
const damageArea = (room, x, z, radius, damage, hitPlayers, start, hitStatus) => {
  const damagedPlayers = [];
  for (const [sessionId, player] of room.state.players) {
    if (player.inDungeon || player.health <= 0 || hitPlayers?.has(sessionId)) continue;
    let closestX = x;
    let closestZ = z;
    if (start) {
      const dx = x - start.x;
      const dz = z - start.z;
      const lengthSquared = dx * dx + dz * dz;
      const t = lengthSquared ? Math.max(0, Math.min(1,
        ((player.x - start.x) * dx + (player.z - start.z) * dz) / lengthSquared)) : 0;
      closestX = start.x + dx * t;
      closestZ = start.z + dz * t;
    }
    if (Math.hypot(player.x - closestX, player.z - closestZ) > radius) continue;
    hitPlayers?.add(sessionId);
    const health = player.health;
    room.damagePlayer(sessionId, damage, hitStatus);
    if (player.health < health) damagedPlayers.push(sessionId);
  }
  return damagedPlayers;
};

const notify = (room, enemy, text) => {
  for (const client of room.clients) {
    const player = room.state.players.get(client.sessionId);
    if (player && !player.inDungeon && Math.hypot(player.x - enemy.x, player.z - enemy.z) <= 50) {
      client.send("bossNotice", text);
    }
  }
};

export const cancelBossAction = (enemy, runtime) => {
  enemy.bossAction = "";
  runtime.bossAction = null;
};

// Returns true while an ability owns movement/attacks; otherwise normal AI runs.
export const updateBossMechanics = (room, enemy, runtime, target, stats, deltaTime) => {
  const config = stats.bossMechanics;
  if (!config) return false;
  const now = Date.now();
  if (!runtime.bossStarted) {
    runtime.bossStarted = true;
    runtime.nextBossAoeAt = now + config.aoe.cooldown;
    runtime.nextBossChargeAt = now + config.charge.cooldown;
  }
  if (!enemy.enraged && enemy.health <= enemy.maxHealth * config.enrage.threshold) {
    enemy.enraged = true;
    notify(room, enemy, `${stats.name} becomes enraged!`);
  }
  const damage = stats.attackDamage * (enemy.enraged ? config.enrage.damageMultiplier : 1);
  const action = runtime.bossAction;
  if (action) {
    runtime.lastCombatAt = now;
    if (enemy.bossAction === "aoe") {
      if (now >= action.endsAt) {
        const hitSessionIds = damageArea(room, enemy.bossTargetX, enemy.bossTargetZ,
          config.aoe.radius, damage, null, null, stats.heavyHitStatus);
        if (config.aoe.name) room.broadcast("bossImpact", {
          enemyId: runtime.spawn.id, type: enemy.type,
          x: enemy.bossTargetX, z: enemy.bossTargetZ, radius: config.aoe.radius, hitSessionIds,
        });
        cancelBossAction(enemy, runtime);
      }
    } else if (enemy.bossAction === "chargeWindup") {
      if (now >= action.endsAt) {
        enemy.bossAction = "charge";
        action.hitPlayers = new Set();
      }
    } else if (enemy.bossAction === "charge") {
      const start = { x: enemy.x, z: enemy.z };
      const movement = Math.min(action.remaining, config.charge.speed * ENEMY_COMBAT_SPEED_MULTIPLIER * (enemy.enraged ? config.enrage.speedMultiplier : 1) * deltaTime / 1000);
      if (!room.moveEnemy(enemy, enemy.x + action.dx * movement, enemy.z + action.dz * movement, runtime)) {
        cancelBossAction(enemy, runtime);
        return true;
      }
      action.remaining -= Math.hypot(enemy.x - start.x, enemy.z - start.z);
      damageArea(room, enemy.x, enemy.z, config.charge.radius, damage, action.hitPlayers, start, stats.heavyHitStatus);
      if (action.remaining <= 0.01) cancelBossAction(enemy, runtime);
    }
    return true;
  }
  if (now >= runtime.nextBossAoeAt) {
    enemy.bossAction = "aoe";
    enemy.bossTargetX = target.x;
    enemy.bossTargetZ = target.z;
    enemy.bossRadius = config.aoe.radius;
    runtime.bossAction = { endsAt: now + config.aoe.telegraphDuration };
    runtime.nextBossAoeAt = now + config.aoe.cooldown;
    if (config.aoe.name) notify(room, enemy, `${stats.name}: ${config.aoe.name} — move out of the circle!`);
    return true;
  }
  if (now >= runtime.nextBossChargeAt) {
    const dx = target.x - enemy.x;
    const dz = target.z - enemy.z;
    const distance = Math.hypot(dx, dz);
    if (distance < 0.01) return false;
    const length = Math.min(distance, config.charge.maxDistance);
    enemy.bossAction = "chargeWindup";
    enemy.bossTargetX = enemy.x + dx / distance * length;
    enemy.bossTargetZ = enemy.z + dz / distance * length;
    enemy.bossRadius = config.charge.radius;
    enemy.rotationY = Math.atan2(dx, dz);
    runtime.bossAction = {
      endsAt: now + config.charge.windup,
      dx: dx / distance, dz: dz / distance, remaining: length,
    };
    runtime.nextBossChargeAt = now + config.charge.cooldown;
    return true;
  }
  return false;
};
