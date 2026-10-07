export const STATUS_EFFECTS = {
  bleed: { name: "Bleed", description: "Lose 4% of max health per second.", duration: 5000, tickInterval: 1000, maxHealthDamage: 0.04, icon: "heavyStrike", color: "text-red-400" },
  poison: { name: "Poison", description: "Lose 3% of max health per second.", duration: 6000, tickInterval: 1000, maxHealthDamage: 0.03, icon: "healthCapsule", color: "text-lime-400" },
  slow: { name: "Slow", description: "25% less movement speed.", duration: 4000, movementSpeed: 0.75, icon: "mapPin", color: "text-cyan-400" },
  damageUp: { name: "Damage Up", description: "15% more damage.", duration: 4000, damageMultiplier: 1.15, icon: "sword", color: "text-orange-400" },
  speedUp: { name: "Speed Up", description: "20% more movement speed.", duration: 4000, movementSpeed: 1.2, icon: "locationArrow", color: "text-green-400" },
};

export const getStatusModifiers = (entity, now = Date.now()) => {
  const modifiers = { movementSpeed: 1, damage: 1 };
  for (const [id, effect] of entity.statusEffects || []) {
    if (effect.expiresAt <= now || !Object.hasOwn(STATUS_EFFECTS, id)) continue;
    modifiers.movementSpeed *= STATUS_EFFECTS[id].movementSpeed || 1;
    modifiers.damage *= STATUS_EFFECTS[id].damageMultiplier || 1;
  }
  return modifiers;
};
