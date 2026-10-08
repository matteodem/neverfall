import { EQUIPMENT_ITEMS } from "./equipment";

const STATS = {
  maxHealth: { label: "Max HP", multiplier: 1, unit: "" },
  attackDamage: { label: "Attack Damage", multiplier: 1, unit: "" },
  xpGain: { label: "XP gain", multiplier: 100, unit: "%" },
  movementSpeed: { label: "Movement Speed", multiplier: 100, unit: "%" },
};

export const getEquipmentComparison = (item, equipment = {}) => {
  const equipped = EQUIPMENT_ITEMS[equipment?.[item.slot]];
  const current = equipped?.slot === item.slot ? equipped : null;
  const stats = Object.entries(STATS)
    .filter(([stat]) => item.stats[stat] || current?.stats[stat])
    .map(([stat, { label, multiplier, unit }]) => {
      const value = item.stats[stat] || 0;
      const previous = current?.stats[stat] || 0;
      const delta = Number(((value - previous) * multiplier).toFixed(2));
      return {
        id: stat, label, delta,
        value: `${Number((value * multiplier).toFixed(2))}${unit}`,
        difference: `${delta > 0 ? "+" : ""}${delta}${unit}`,
      };
    });
  return {
    current, stats,
    isUpgrade: stats.some((stat) => stat.delta > 0) && stats.every((stat) => stat.delta >= 0),
  };
};
