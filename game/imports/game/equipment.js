export const EQUIPMENT_SLOTS = ["ring", "accessory"];

export const DEFAULT_EQUIPMENT = {
  ring: null,
  accessory: null,
};

export const EQUIPMENT_DROP_CHANCE = 0.20;

export const EQUIPMENT_ITEMS = {
  ring_vitality: {
    id: "ring_vitality",
    name: "Ring of Vitality",
    slot: "ring",
    stats: { maxHealth: 25 },
  },
  ring_strength: {
    id: "ring_strength",
    name: "Ring of Strength",
    slot: "ring",
    stats: { attackDamage: 5 },
  },
};

export const getEquipmentStats = (equipment = {}) => {
  const stats = { maxHealth: 0, attackDamage: 0 };

  for (const slot of EQUIPMENT_SLOTS) {
    const item = EQUIPMENT_ITEMS[equipment?.[slot]];
    if (!item || item.slot !== slot) continue;

    stats.maxHealth += item.stats.maxHealth || 0;
    stats.attackDamage += item.stats.attackDamage || 0;
  }

  return stats;
};

export const formatEquipmentStats = (item) => {
  if (!item) return [];

  return Object.entries(item.stats).map(([stat, value]) => {
    if (stat === "maxHealth") return `+${value} Max HP`;
    if (stat === "attackDamage") return `+${value} Attack Damage`;
    return `+${value} ${stat}`;
  });
};
