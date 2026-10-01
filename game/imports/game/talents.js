import { getClassConfig } from "./classConfig";

export const TALENT_LEVELS = [5, 10, 15/*, 20*/];

export const TALENTS = {
  warrior: {
    5: [
      { id: "berserker", label: "Berserker", effect: "heavyStrikeDamage", value: 0.10, description: "+10% Heavy Strike damage" },
      { id: "guardian", label: "Guardian", effect: "maxHealth", value: 15, description: "+15 Max HP" },
    ],
    10: [
      { id: "vanguard", label: "Vanguard", effect: "damage", value: 0.05, description: "+5% damage" },
      { id: "runner", label: "Runner", effect: "movementSpeed", value: 0.05, description: "+5% movement speed" },
    ],
    15: [
      { id: "cleaver", label: "Cleaver", effect: "aoeDamage", value: 0.10, description: "+10% Cleave damage" },
      { id: "stalwart", label: "Stalwart", effect: "maxHealth", value: 20, description: "+20 Max HP" },
    ],
    20: [
      { id: "champion", label: "Champion", effect: "damage", value: 0.10, description: "+10% damage" },
      { id: "fortress", label: "Fortress", effect: "maxHealth", value: 30, description: "+30 Max HP" },
    ],
  },
  ranger: {
    5: [
      { id: "hunter", label: "Hunter", effect: "projectileDamage", value: 0.05, description: "+5% projectile damage" },
      { id: "survivor", label: "Survivor", effect: "maxHealth", value: 15, description: "+15 Max HP" },
    ],
    10: [
      { id: "sharpshooter", label: "Sharpshooter", effect: "projectileDamage", value: 0.10, description: "+10% projectile damage" },
      { id: "pathfinder", label: "Pathfinder", effect: "movementSpeed", value: 0.05, description: "+5% movement speed" },
    ],
    15: [
      { id: "marksman", label: "Marksman", effect: "projectileDamage", value: 0.10, description: "+10% projectile damage" },
      { id: "scout", label: "Scout", effect: "movementSpeed", value: 0.05, description: "+5% movement speed" },
    ],
    20: [
      { id: "deadeye", label: "Deadeye", effect: "projectileDamage", value: 0.10, description: "+10% projectile damage" },
      { id: "endurance", label: "Endurance", effect: "maxHealth", value: 25, description: "+25 Max HP" },
    ],
  },
  mage: {
    5: [
      { id: "ember", label: "Ember", effect: "fireDamage", value: 0.05, description: "+5% fire damage" },
      { id: "ward", label: "Ward", effect: "maxHealth", value: 15, description: "+15 Max HP" },
    ],
    10: [
      { id: "spellweaver", label: "Spellweaver", effect: "fireDamage", value: 0.05, description: "+5% fire damage" },
      { id: "swift", label: "Swift", effect: "movementSpeed", value: 0.05, description: "+5% movement speed" },
    ],
    15: [
      { id: "pyromancer", label: "Pyromancer", effect: "fireDamage", value: 0.10, description: "+10% fire damage" },
      { id: "arcanist", label: "Arcanist", effect: "cooldownReduction", value: 0.10, description: "-10% ability cooldowns" },
    ],
    20: [
      { id: "inferno", label: "Inferno", effect: "aoeDamage", value: 0.10, description: "+10% Fire Nova damage" },
      { id: "barrier", label: "Barrier", effect: "maxHealth", value: 25, description: "+25 Max HP" },
    ],
  },
};

export const getSelectedTalents = (player) =>
  Object.fromEntries(TALENT_LEVELS.map((level) => [level, player[`talent${level}`]]));

export const getTalentBonuses = (gameClass, level, selections = {}) => {
  const bonuses = { maxHealth: 0, damage: 0, movementSpeed: 0, aoeDamage: 0, heavyStrikeDamage: 0, projectileDamage: 0, fireDamage: 0, cooldownReduction: 0 };
  for (const milestone of TALENT_LEVELS) {
    if (milestone > level) continue;
    const talent = TALENTS[gameClass]?.[milestone]?.find((option) => option.id === selections?.[milestone]);
    if (talent) bonuses[talent.effect] += talent.value;
  }
  return bonuses;
};

export const getTalentSkill = (gameClass, code, level, selections) => {
  const skill = getClassConfig(gameClass).skills[code];
  if (!skill) return null;
  const bonuses = getTalentBonuses(gameClass, level, selections);
  const specificDamage =
    (gameClass === "warrior" && code === "Digit2" ? bonuses.heavyStrikeDamage : 0) +
    (gameClass === "ranger" && skill.projectile ? bonuses.projectileDamage : 0) +
    (gameClass === "mage" ? bonuses.fireDamage : 0);
  return {
    ...skill,
    damageMultiplier: (skill.damageMultiplier || 1) * (1 + specificDamage),
    cooldown: Math.round(skill.cooldown * (1 - bonuses.cooldownReduction)),
  };
};
