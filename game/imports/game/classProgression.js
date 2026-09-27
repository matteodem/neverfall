import { isValidGameClass } from "./classConfig";

export const CLASS_PROGRESSION = {
  warrior: [
    { level: 5, stat: "maxHealth", value: 10, label: "Max HP" },
    { level: 10, stat: "damage", value: 0.05, label: "Melee Damage" },
    { level: 15, stat: "maxHealth", value: 20, label: "Max HP" },
    { level: 20, stat: "damage", value: 0.10, label: "Melee Damage" },
  ],
  ranger: [
    { level: 5, stat: "damage", value: 0.05, label: "Projectile Damage" },
    { level: 10, stat: "movementSpeed", value: 0.05, label: "Movement Speed" },
    { level: 15, stat: "damage", value: 0.10, label: "Projectile Damage" },
    { level: 20, stat: "movementSpeed", value: 0.05, label: "Movement Speed" },
  ],
  mage: [
    { level: 5, stat: "damage", value: 0.05, label: "Spell Damage" },
    { level: 10, stat: "maxHealth", value: 10, label: "Max HP" },
    { level: 15, stat: "aoeDamage", value: 0.10, label: "AoE Damage" },
    { level: 20, stat: "damage", value: 0.10, label: "Spell Damage" },
  ],
};

export const getUnlockedClassBonuses = (gameClass, level = 1) =>
  CLASS_PROGRESSION[isValidGameClass(gameClass) ? gameClass : "warrior"]
    .filter((bonus) => bonus.level <= level);

export const getClassProgressionStats = (gameClass, level) =>
  getUnlockedClassBonuses(gameClass, level).reduce((stats, bonus) => {
    stats[bonus.stat] += bonus.value;
    return stats;
  }, { maxHealth: 0, damage: 0, movementSpeed: 0, aoeDamage: 0 });

export const formatClassBonus = (bonus) =>
  `+${bonus.stat === "maxHealth" ? bonus.value : `${Math.round(bonus.value * 100)}%`} ${bonus.label}`;
