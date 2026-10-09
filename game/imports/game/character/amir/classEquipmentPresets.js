// Starting cosmetic geometry only, not inventory items or combat stats.
// Applied at creation; saved characters and later slot replacements keep their gear.
const baseOutfit = {
  torso: "torso-00", arms: "arms-00", hands: "hands-00",
  legs: "legs-00", feet: "feet-00",
};
const baseEquipment = {
  hat: null, glasses: null, mask: null, leftHand: null, rightHand: null, back: null,
};

export const AMIR_CLASS_EQUIPMENT_PRESETS = {
  warrior: {
    outfit: { ...baseOutfit },
    equipment: { ...baseEquipment, rightHand: "sword-01.col" },
  },
  ranger: {
    outfit: { ...baseOutfit },
    equipment: { ...baseEquipment, leftHand: "bow-01.col" },
  },
  mage: {
    outfit: { ...baseOutfit },
    equipment: { ...baseEquipment, rightHand: "staff-02.col" },
  },
};
