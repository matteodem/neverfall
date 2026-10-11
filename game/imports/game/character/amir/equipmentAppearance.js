import { EQUIPMENT_ITEMS, canEquipItem } from "../../equipment";
import { normalizeAmirAppearance, applyAmirClassWeapon, AMIR_CLASS_WEAPONS } from "./appearance";

// Resolve from the saved base each time so unequipping restores the original class outfit.
export const resolveAmirEquipment = (input, gameClass, equipped = {}) => {
  const base = applyAmirClassWeapon(normalizeAmirAppearance(input), gameClass);
  const outfit = { ...base.outfit };
  const equipment = { ...base.equipment };
  const weapon = EQUIPMENT_ITEMS[equipped.weapon];
  const armor = EQUIPMENT_ITEMS[equipped.armor];
  const hand = AMIR_CLASS_WEAPONS[gameClass]?.slot;
  if (hand && weapon?.slot === "weapon" && canEquipItem(weapon, gameClass)) equipment[hand] = weapon.amirMeshId;
  if (armor?.slot === "armor" && canEquipItem(armor, gameClass)) outfit.torso = armor.amirMeshId;
  return { ...base, outfit, equipment };
};
