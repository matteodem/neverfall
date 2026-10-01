const SAFE_FALL_DISTANCE = 4;
const LETHAL_FALL_DISTANCE = 20;
const MAX_VERTICAL_STEP = 8;
const FALL_SPEED_THRESHOLD = 5;

export const resetFallTracking = (runtime) => {
  if (!runtime) return;
  runtime.fallPeakY = null;
  runtime.fallFast = false;
  runtime.ignoreFallUntilGrounded = true;
};

export const getFallDamage = (player, runtime, previousY, grounded, mounted, elapsed) => {
  if (mounted) {
    resetFallTracking(runtime);
    return 0;
  }
  if (typeof grounded !== "boolean" || Math.abs(player.y - previousY) > MAX_VERTICAL_STEP) {
    resetFallTracking(runtime);
    return 0;
  }
  if (runtime.ignoreFallUntilGrounded) {
    if (grounded) runtime.ignoreFallUntilGrounded = false;
    return 0;
  }
  const fallingFast = previousY - player.y > FALL_SPEED_THRESHOLD * Math.max(elapsed, 0.05);
  if (!grounded) {
    runtime.fallPeakY = Math.max(runtime.fallPeakY ?? previousY, player.y);
    runtime.fallFast ||= fallingFast;
    return 0;
  }
  const distance = (runtime.fallPeakY ?? player.y) - player.y;
  const wasFallingFast = runtime.fallFast || fallingFast;
  runtime.fallPeakY = null;
  runtime.fallFast = false;
  if (!wasFallingFast || distance <= SAFE_FALL_DISTANCE) return 0;
  return Math.min(player.maxHealth,
    Math.ceil(player.maxHealth * (distance - SAFE_FALL_DISTANCE) / LETHAL_FALL_DISTANCE));
};
