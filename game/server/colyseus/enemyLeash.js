import { cancelBossAction } from "./bossMechanics";

// Keep one origin for the whole chase, even when another player attacks.
export const updateEnemyLeash = (room, enemy, runtime, stats, deltaTime) => {
  if (runtime.targetSessionId && !runtime.chaseOrigin) {
    runtime.chaseOrigin = { x: enemy.x, z: enemy.z };
  }
  const origin = runtime.chaseOrigin;
  if (!origin) return false;
  const target = room.state.players.get(runtime.targetSessionId);
  if (!runtime.returning && (!room.canEnemyTarget(target) ||
      Math.hypot(target.x - origin.x, target.z - origin.z) >= stats.chaseRadius ||
      Math.hypot(enemy.x - origin.x, enemy.z - origin.z) >= stats.chaseRadius)) {
    runtime.returning = true;
  }
  if (!runtime.returning) return false;

  cancelBossAction(enemy, runtime);
  runtime.targetSessionId = null;
  runtime.nextAttackAt = 0;
  runtime.wanderTarget = null;
  const dx = origin.x - enemy.x;
  const dz = origin.z - enemy.z;
  const distance = Math.hypot(dx, dz);
  if (distance <= 0.15) {
    runtime.returning = false;
    runtime.chaseOrigin = null;
    runtime.nextWanderAt = Date.now() + stats.wanderWait;
    return true;
  }
  enemy.rotationY = Math.atan2(dx, dz);
  const movement = Math.min(distance, stats.speed * deltaTime / 1000);
  room.moveEnemy(enemy, enemy.x + dx / distance * movement, enemy.z + dz / distance * movement);
  return true;
};
