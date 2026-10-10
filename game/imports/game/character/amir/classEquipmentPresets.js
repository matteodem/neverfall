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
    outfit: { 
      torso: "torso-01", arms: "arms-01", hands: "hands-01",
      legs: "legs-01", feet: "feet-01",
    },
    equipment: { ...baseEquipment, rightHand: "sword-01.col" },
  },
  ranger: {
    outfit: { 
      torso: "torso-03", arms: "arms-03", hands: "hands-03",
      legs: "legs-03", feet: "feet-03",
    },
    equipment: { ...baseEquipment, leftHand: "bow-01.col" },
  },
  mage: {
    outfit: { 
      torso: "torso-02", arms: "arms-02", hands: "hands-02",
      legs: "legs-02", feet: "feet-02",
    },
    equipment: { ...baseEquipment, rightHand: "staff-02.col" },
  },
};
