export const SKIN_TONES = {
  light: "#F1C7A5",
  fair: "#E5B08A",
  medium: "#C68662",
  tan: "#A96F4C",
  brown: "#7B4F35",
  dark: "#4A2D22",
  ash: "#8D5750",
  ember: "#A96254",
  cinder: "#614140",
  leaf: "#A9BC9A",
  moss: "#83A083",
  pale: "#CED8B6",
};

export const SPECIES = {
  human: {
    name: "Human",
    passive: "Balanced · no passive bonus",
    skinTones: ["light", "fair", "medium", "tan", "brown", "dark"],
    defaultSkinTone: "medium",
    defaultBodyType: "medium",
    damageMultiplier: 1,
    movementSpeedMultiplier: 1,
  },
  ashborn: {
    name: "Ashborn",
    passive: "+3% damage",
    skinTones: ["ash", "ember", "cinder"],
    defaultSkinTone: "ash",
    defaultBodyType: "medium",
    damageMultiplier: 1.03,
    movementSpeedMultiplier: 1,
  },
  sylvan: {
    name: "Sylvan",
    passive: "+3% movement speed",
    skinTones: ["pale", "leaf", "moss"],
    defaultSkinTone: "pale",
    defaultBodyType: "slim",
    damageMultiplier: 1,
    movementSpeedMultiplier: 1.03,
  },
};

export const getSpecies = (species) => SPECIES[species] || SPECIES.human;
