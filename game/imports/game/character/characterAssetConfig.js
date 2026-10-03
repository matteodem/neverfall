const ASSET_ROOT = "/models/characters/quaternius-fantasy/optimized/modular-parts/";

const OUTFITS = {
  // The pack has Ranger and Peasant parts; these are the closest current class looks.
  warrior: ["Ranger_Body", "Ranger_Arms", "Ranger_Legs", "Ranger_Feet", "Ranger_Acc"],
  ranger: ["Ranger_Body", "Ranger_Arms", "Ranger_Legs", "Ranger_Feet"],
  mage: ["Peasant_Body", "Ranger_Arms", "Peasant_Legs", "Peasant_Feet"],
};

export const CHARACTER_HEAD_OPTIONS = [{ id: "hood", label: "Hood" }];
const HEAD_PARTS = { hood: "Ranger_Head_Hood" };

const PART_NAMES = {
  male: { Ranger_Feet: "Ranger_Feet_Boots", Ranger_Acc: "Ranger_Acc_Pauldron" },
  female: { Ranger_Acc: "Ranger_Acc_Pauldrons" },
};

export const QUATERNIUS_HAND_BONE = "hand_r";

export const resolveCharacterParts = ({ appearance = {}, gameClass = "warrior", species = "human" }) => {
  const gender = appearance.gender === "female" ? "female" : "male";
  const prefix = gender === "female" ? "Female" : "Male";
  const outfit = OUTFITS[gameClass] || OUTFITS.warrior;
  // Ashborn and Sylvan use the same humanoid parts until species-specific assets exist.
  void species;
  const head = HEAD_PARTS[appearance.head] || HEAD_PARTS.hood;
  return [...outfit, head].map((part) => `${ASSET_ROOT}${prefix}_${PART_NAMES[gender][part] || part}.glb`);
};
