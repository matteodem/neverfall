// Projectiles use server positions and skill stats; clients only request attacks.
import { MOBILE_TARGETING } from "../../imports/game/config";

export const createProjectiles = (room) => {
  const active = new Map();
  let nextId = 0;

  const remove = (id) => {
    active.delete(id);
    room.broadcast("projectileEnd", { id });
  };

  return {
    fire(sessionId, player, skill, target = null) {
      const { type, speed, lifetime, radius, scale = 1 } = skill.projectile;
      const hitEnemies = new Set();
      const count = skill.projectiles || 1;
      for (let index = 0; index < count; index++) {
        const aim = target ? Math.atan2(target.x - player.x, target.z - player.z) : player.rotationY;
        const angle = aim + (index - (count - 1) / 2) * (skill.spreadAngle || 0) * Math.PI / 180;
        const projectile = {
          id: `${room.roomId}-${++nextId}`,
          sessionId, type, speed, lifetime, scale,
          x: player.x, y: player.y + 1, z: player.z,
          dx: Math.sin(angle), dz: Math.cos(angle),
        };
        active.set(projectile.id, { ...projectile, radius: radius + (target ? MOBILE_TARGETING.hitPadding : 0),
          remaining: lifetime, multiplier: skill.damageMultiplier, hitEnemies });
        room.broadcast("attack", { sessionId, projectile });
      }
    },
    update(deltaTime) {
      for (const projectile of active.values()) {
        const elapsed = Math.min(deltaTime, projectile.remaining);
        const distance = projectile.speed * elapsed / 1000;
        const nextX = projectile.x + projectile.dx * distance;
        const nextZ = projectile.z + projectile.dz * distance;
        let hit = null;
        let closest = Infinity;
        for (const [enemyId, enemy] of room.state.enemies.entries()) {
          if (enemy.health <= 0) continue;
          const dx = enemy.x - projectile.x;
          const dz = enemy.z - projectile.z;
          const along = Math.max(0, Math.min(distance, dx * projectile.dx + dz * projectile.dz));
          const offsetX = dx - projectile.dx * along;
          const offsetZ = dz - projectile.dz * along;
          const offsetY = enemy.y + 1 - projectile.y;
          if (offsetX ** 2 + offsetY ** 2 + offsetZ ** 2 <= projectile.radius ** 2 && along < closest) {
            closest = along;
            hit = { enemyId, enemy };
          }
        }
        projectile.x = nextX;
        projectile.z = nextZ;
        projectile.remaining -= elapsed;
        if (hit) {
          remove(projectile.id);
          if (projectile.hitEnemies.has(hit.enemy)) continue;
          projectile.hitEnemies.add(hit.enemy);
          room.damageEnemy(projectile.sessionId, hit.enemyId, hit.enemy, projectile.multiplier)
            .catch((error) => console.error("[Projectiles] Damage failed", error));
        } else if (projectile.remaining <= 0) {
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
