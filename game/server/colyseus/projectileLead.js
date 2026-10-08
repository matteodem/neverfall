const MAX_LEAD_SECONDS = 0.75;
const MAX_LEAD_DISTANCE = 3;
const MIN_TARGET_SPEED = 0.1;
const MAX_TARGET_SPEED = 10;
const MAX_VELOCITY_CHANGE = 3;
const MAX_SAMPLE_AGE = 250;

// Server-only samples; no schema fields or client-supplied velocity are needed.
export const createProjectileLead = () => {
  const motion = new WeakMap();
  return {
    record(enemy, before, deltaTime) {
      const previous = motion.get(enemy);
      const seconds = deltaTime / 1000;
      const vx = seconds > 0 ? (enemy.x - before.x) / seconds : NaN;
      const vz = seconds > 0 ? (enemy.z - before.z) / seconds : NaN;
      const speed = Math.hypot(vx, vz);
      const valid = enemy.health > 0 && deltaTime > 0 && deltaTime <= MAX_SAMPLE_AGE &&
        Number.isFinite(speed) && speed <= MAX_TARGET_SPEED && Boolean(previous) &&
        previous.x === before.x && previous.z === before.z &&
        Math.hypot(vx - previous.vx, vz - previous.vz) <= MAX_VELOCITY_CHANGE;
      motion.set(enemy, { x: enemy.x, z: enemy.z, vx, vz, valid, at: Date.now() });
    },
    predict(player, target, projectileSpeed) {
      if (!target || !Number.isFinite(projectileSpeed) || projectileSpeed <= 0) return target;
      const sample = motion.get(target);
      if (!sample?.valid || Date.now() - sample.at > MAX_SAMPLE_AGE ||
        sample.x !== target.x || sample.z !== target.z) return target;
      const speed = Math.hypot(sample.vx, sample.vz);
      if (speed < MIN_TARGET_SPEED) return target;
      const distance = Math.hypot(target.x - player.x, target.y - player.y, target.z - player.z);
      if (!Number.isFinite(distance) || distance <= 0.001) return target;
      const time = Math.min(distance / projectileSpeed, MAX_LEAD_SECONDS, MAX_LEAD_DISTANCE / speed);
      return { x: target.x + sample.vx * time, y: target.y, z: target.z + sample.vz * time };
    },
  };
};
