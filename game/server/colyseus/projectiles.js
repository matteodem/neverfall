// Projectiles use server positions and skill stats; clients only request attacks.
import { MOBILE_TARGETING, PROJECTILE_AIM } from "../../imports/game/config";

export const createProjectiles = (room) => {
  const active = new Map();
  let nextId = 0;

  const remove = (id) => {
    active.delete(id);
    room.broadcast("projectileEnd", { id });
  };

  const firstTerrainHit = (origin, direction, distance) => {
    const steps = Math.max(1, Math.ceil(distance / 0.5));
    for (let step = 1; step <= steps; step++) {
      const traveled = distance * step / steps;
      const x = origin.x + direction.dx * traveled;
      const y = origin.y + direction.dy * traveled;
      const z = origin.z + direction.dz * traveled;
      if (y <= room.getProjectileTerrainHeight(x, z) + 0.02) return traveled;
    }
    return null;
  };

  const findAimTarget = (player, skill, preferredTargetId, mobileLock) => {
    const maxDistance = skill.projectile.speed * skill.projectile.lifetime / 1000;
    const coneDot = Math.cos(PROJECTILE_AIM.coneDegrees * Math.PI / 180);
    const forwardX = Math.sin(player.rotationY);
    const forwardZ = Math.cos(player.rotationY);
    const origin = { x: player.x, y: player.y + 1, z: player.z };
    let best = null;
    let bestAlignment = -1;
    let bestDistance = Infinity;
    for (const [id, enemy] of room.state.enemies.entries()) {
      if (enemy.health <= 0) continue;
      const dx = enemy.x - player.x;
      const dz = enemy.z - player.z;
      const horizontal = Math.hypot(dx, dz);
      const dy = enemy.y - player.y;
      const distance = Math.hypot(horizontal, dy);
      if (distance > maxDistance) continue;
      const alignment = horizontal > 0.001 ? (dx * forwardX + dz * forwardZ) / horizontal : 1;
      const locked = mobileLock && id === preferredTargetId;
      if (alignment < coneDot && !locked) continue;
      const direction = distance > 0.001
        ? { dx: dx / distance, dy: dy / distance, dz: dz / distance }
        : { dx: forwardX, dy: 0, dz: forwardZ };
      if (firstTerrainHit(origin, direction, distance) !== null) continue;
      if (id === preferredTargetId) return { enemy, locked };
      if (alignment > bestAlignment + 0.001 ||
        (Math.abs(alignment - bestAlignment) <= 0.001 && distance < bestDistance)) {
        best = { enemy, locked: false };
        bestAlignment = alignment;
        bestDistance = distance;
      }
    }
    return best;
  };

  return {
    fire(sessionId, player, skill, preferredTargetId = null, mobileLock = false) {
      const { type, speed, lifetime, radius, scale = 1 } = skill.projectile;
      const hitEnemies = new Set();
      const count = skill.projectiles || 1;
      const { enemy: target, locked } = findAimTarget(player, skill, preferredTargetId, mobileLock) || {};
      const horizontalDistance = target ? Math.hypot(target.x - player.x, target.z - player.z) : 0;
      const pitch = target ? Math.atan2(target.y - player.y, horizontalDistance) : 0;
      const horizontalSpeed = Math.cos(pitch);
      for (let index = 0; index < count; index++) {
        const aim = target ? Math.atan2(target.x - player.x, target.z - player.z) : player.rotationY;
        const angle = aim + (index - (count - 1) / 2) * (skill.spreadAngle || 0) * Math.PI / 180;
        const projectile = {
          id: `${room.roomId}-${++nextId}`,
          sessionId, type, speed, lifetime, scale,
          x: player.x, y: player.y + 1, z: player.z,
          dx: Math.sin(angle) * horizontalSpeed, dy: Math.sin(pitch), dz: Math.cos(angle) * horizontalSpeed,
        };
        active.set(projectile.id, { ...projectile,
          radius: radius * PROJECTILE_AIM.hitboxScale + (locked ? MOBILE_TARGETING.hitPadding : 0),
          remaining: lifetime, multiplier: skill.damageMultiplier, hitStatus: skill.hitStatus, hitEnemies });
        room.broadcast("attack", { sessionId, projectile });
      }
    },
    update(deltaTime) {
      for (const projectile of active.values()) {
        const elapsed = Math.min(deltaTime, projectile.remaining);
        const distance = projectile.speed * elapsed / 1000;
        const terrainHit = firstTerrainHit(projectile, projectile, distance);
        const travel = terrainHit ?? distance;
        const nextX = projectile.x + projectile.dx * travel;
        const nextY = projectile.y + projectile.dy * travel;
        const nextZ = projectile.z + projectile.dz * travel;
        let hit = null;
        let closest = Infinity;
        for (const [enemyId, enemy] of room.state.enemies.entries()) {
          if (enemy.health <= 0) continue;
          const dx = enemy.x - projectile.x;
          const dy = enemy.y + 1 - projectile.y;
          const dz = enemy.z - projectile.z;
          const along = dx * projectile.dx + dy * projectile.dy + dz * projectile.dz;
          if (along < -projectile.radius ||
            along > travel + (terrainHit === null ? projectile.radius : 0)) continue;
          const nearest = Math.max(0, Math.min(travel, along));
          const offsetX = dx - projectile.dx * nearest;
          const offsetY = dy - projectile.dy * nearest;
          const offsetZ = dz - projectile.dz * nearest;
          if (offsetX ** 2 + offsetY ** 2 + offsetZ ** 2 <= projectile.radius ** 2 && nearest < closest) {
            closest = nearest;
            hit = { enemyId, enemy };
          }
        }
        projectile.x = nextX;
        projectile.y = nextY;
        projectile.z = nextZ;
        projectile.remaining -= elapsed;
        if (hit) {
          remove(projectile.id);
          if (projectile.hitEnemies.has(hit.enemy)) continue;
          projectile.hitEnemies.add(hit.enemy);
          room.damageEnemy(projectile.sessionId, hit.enemyId, hit.enemy, projectile.multiplier, false, projectile.hitStatus)
            .catch((error) => console.error("[Projectiles] Damage failed", error));
        } else if (terrainHit !== null || projectile.remaining <= 0) {
          remove(projectile.id);
        }
      }
    },
    removePlayer(sessionId) {
      for (const projectile of active.values()) {
        if (projectile.sessionId === sessionId) remove(projectile.id);
      }
    },
  };
};
