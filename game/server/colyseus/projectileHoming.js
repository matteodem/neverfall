import { PROJECTILE_HOMING } from "../../imports/game/config";

// Guide only the original server-selected enemy; never acquire a new target.
export const guideProjectile = (projectile, room, elapsed, terrainHit) => {
  const target = projectile.homingTarget;
  if (!target || target.health <= 0 || room.state.enemies.get(projectile.homingTargetId) !== target) return false;
  const dx = target.x - projectile.x;
  const dy = target.y + 1 - projectile.y;
  const dz = target.z - projectile.z;
  const distance = Math.hypot(dx, dy, dz);
  if (!Number.isFinite(distance) || distance <= 0.001 ||
    distance > projectile.speed * projectile.remaining / 1000 + projectile.radius) return false;
  const desired = { dx: dx / distance, dy: dy / distance, dz: dz / distance };
  const dot = Math.max(-1, Math.min(1,
    projectile.dx * desired.dx + projectile.dy * desired.dy + projectile.dz * desired.dz));
  // Drop targets that move behind/off-course instead of curving around or orbiting.
  if (dot < Math.cos(PROJECTILE_HOMING.maxTrackingAngleDegrees * Math.PI / 180) ||
    terrainHit(projectile, desired, distance) !== null) return false;
  const angle = Math.acos(dot);
  if (angle < 0.000001) return true;
  const turn = Math.min(angle, PROJECTILE_HOMING.maxTurnDegreesPerSecond * Math.PI / 180 * elapsed / 1000);
  // Spherical interpolation caps the actual angular change, independently of tick rate.
  const originalWeight = Math.sin(angle - turn) / Math.sin(angle);
  const desiredWeight = Math.sin(turn) / Math.sin(angle);
  const nextX = projectile.dx * originalWeight + desired.dx * desiredWeight;
  const nextY = projectile.dy * originalWeight + desired.dy * desiredWeight;
  const nextZ = projectile.dz * originalWeight + desired.dz * desiredWeight;
  const length = Math.hypot(nextX, nextY, nextZ);
  projectile.dx = nextX / length;
  projectile.dy = nextY / length;
  projectile.dz = nextZ / length;
  return true;
};
