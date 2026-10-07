import { STATUS_EFFECTS } from "../../imports/game/statusEffects";
import { StatusEffectState } from "./WorldState";

// One instance per effect: reapplication refreshes duration without delaying DoT.
export const applyStatusEffect = (entity, id, now = Date.now()) => {
  if (!Object.hasOwn(STATUS_EFFECTS, id) || entity.health <= 0) return false;
  const definition = STATUS_EFFECTS[id];
  const previous = entity.statusEffects.get(id);
  if (previous?.expiresAt > now) {
    previous.expiresAt = now + definition.duration;
  } else {
    entity.statusEffects.set(id, new StatusEffectState({
      expiresAt: now + definition.duration,
      nextTickAt: definition.tickInterval ? now + definition.tickInterval : 0,
    }));
  }
  return true;
};

export const removeStatusEffect = (entity, id) => entity.statusEffects.delete(id);
export const clearStatusEffects = (entity) => entity.statusEffects.clear();

// Called by the existing room tick, never by per-effect timers.
export const updateStatusEffects = (entity, damage, now = Date.now()) => {
  let changed = false;
  for (const [id, effect] of entity.statusEffects) {
    if (entity.health <= 0) {
      clearStatusEffects(entity);
      return true;
    }
    const definition = STATUS_EFFECTS[id];
    if (definition?.tickInterval && effect.nextTickAt <= Math.min(now, effect.expiresAt)) {
      const ticks = Math.floor((Math.min(now, effect.expiresAt) - effect.nextTickAt) / definition.tickInterval) + 1;
      effect.nextTickAt += ticks * definition.tickInterval;
      damage(definition.damage * ticks);
    }
    if (effect.expiresAt <= now) {
      removeStatusEffect(entity, id);
      changed = true;
    }
  }
  return changed;
};

// Separate schema instances are required for separate room encoders.
export const copyStatusEffects = (source, target) => {
  clearStatusEffects(target);
  for (const [id, effect] of source.statusEffects) {
    target.statusEffects.set(id, new StatusEffectState({
      expiresAt: effect.expiresAt,
      nextTickAt: effect.nextTickAt,
    }));
  }
};
