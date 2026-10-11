export const EQUIPMENT_SLOTS = ["weapon", "armor", "ring", "accessory"];

export const DEFAULT_EQUIPMENT = {
  weapon: null,
  armor: null,
  ring: null,
  accessory: null,
};

export const EQUIPMENT_DROP_CHANCE = 0.20;
export const ACCESSORY_DROP_CHANCE = 0.05;

export const EQUIPMENT_ITEMS = {
  "iron-sword": {
    id: "iron-sword", name: "Iron Sword", type: "weapon", slot: "weapon",
    equipmentSlot: "weapon", gameClass: "warrior", amirMeshId: "sword-02.col",
    stackable: false, stats: {},
  },
  "hunting-bow": {
    id: "hunting-bow", name: "Hunting Bow", type: "weapon", slot: "weapon",
    equipmentSlot: "weapon", gameClass: "ranger", amirMeshId: "bow-02.col",
    stackable: false, stats: {},
  },
  "oak-staff": {
    id: "oak-staff", name: "Oak Staff", type: "weapon", slot: "weapon",
    equipmentSlot: "weapon", gameClass: "mage", amirMeshId: "staff-03.col",
    stackable: false, stats: {},
  },
  "purple-armor": {
    id: "purple-armor", name: "Purple Armor", type: "armor", slot: "armor",
    equipmentSlot: "armor", amirMeshId: "torso-04", stackable: false, stats: {},
  },
  lucky_charm: {
    id: "lucky_charm",
    name: "Lucky Charm",
    slot: "accessory",
    stats: { xpGain: 0.05 },
  },
  guardian_talisman: {
    id: "guardian_talisman",
    name: "Guardian Talisman",
    slot: "accessory",
    stats: { maxHealth: 10, attackDamage: 2 },
  },
  swift_feather: {
    id: "swift_feather",
    name: "Swift Feather",
    slot: "accessory",
    stats: { movementSpeed: 0.05 },
  },
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

export const canEquipItem = (item, gameClass) => Boolean(item &&
  (!item.gameClass || item.gameClass === gameClass));

export const getEquipmentStats = (equipment = {}) => {
  const stats = { maxHealth: 0, attackDamage: 0, xpGain: 0, movementSpeed: 0 };

  for (const slot of EQUIPMENT_SLOTS) {
    const item = EQUIPMENT_ITEMS[equipment?.[slot]];
    if (!item || item.slot !== slot) continue;

    stats.maxHealth += item.stats.maxHealth || 0;
    stats.attackDamage += item.stats.attackDamage || 0;
    stats.xpGain += item.stats.xpGain || 0;
    stats.movementSpeed += item.stats.movementSpeed || 0;
  }

  return stats;
};

export const formatEquipmentStats = (item) => {
  if (!item) return [];

  return Object.entries(item.stats).map(([stat, value]) => {
    if (stat === "xpGain") return `+${value * 100}% XP gain`;
    if (stat === "movementSpeed") return `+${value * 100}% Movement Speed`;
    if (stat === "maxHealth") return `+${value} Max HP`;
    if (stat === "attackDamage") return `+${value} Attack Damage`;
    return `+${value} ${stat}`;
  });
};
