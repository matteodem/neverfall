import { CAMERA, COMBAT_CAMERA_IMPULSE } from "./config";

const impulses = new WeakMap();

export const createCameraImpulse = (camera) => {
  const reducedMotion = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)");
  let startedAt = -Infinity;
  let availableAt = 0;
  let amplitude = 0;
  let directionX = 0;
  let directionZ = 0;
  const offset = { x: 0, y: 0, z: 0 };
  const controller = {
    trigger(kind, mobile = false, strength = 1) {
      const now = performance.now();
      const tuning = COMBAT_CAMERA_IMPULSE;
      if (reducedMotion?.matches || now < availableAt || amplitude > 0) return;
      // Overlapping hits neither add amplitude nor extend the active impulse.
      amplitude = Math.max(0, Math.min(tuning.maxAmplitude, (tuning[kind] || 0) *
        (mobile ? tuning.mobileMultiplier : 1) * Math.max(0, Math.min(1, strength)) *
        Math.min(1, camera.radius / CAMERA.radius)));
      if (!amplitude) return;
      startedAt = now;
      availableAt = now + Math.max(tuning.cooldown, tuning.duration);
      directionX = -Math.sin(camera.alpha) * 0.6;
      directionZ = Math.cos(camera.alpha) * 0.6;
    },
    sample() {
      const progress = (performance.now() - startedAt) / COMBAT_CAMERA_IMPULSE.duration;
      if (reducedMotion?.matches || progress >= 1) amplitude = 0;
      // One smooth recoil, with zero velocity at both ends; no oscillation or roll.
      const displacement = amplitude ? amplitude * Math.sin(Math.PI * progress) ** 2 : 0;
      offset.x = directionX * displacement;
      offset.y = 0.8 * displacement;
      offset.z = directionZ * displacement;
      return offset;
    },
    reset() { amplitude = 0; },
  };
  impulses.set(camera, controller);
  camera.onDisposeObservable.addOnce(() => impulses.delete(camera));
  return controller;
};

export const triggerCameraImpulse = (camera, kind, mobile, strength) =>
  impulses.get(camera)?.trigger(kind, mobile, strength);

export const resetCameraImpulse = (camera) => impulses.get(camera)?.reset();
