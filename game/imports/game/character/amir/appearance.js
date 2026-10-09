import { SKIN_TONES } from "../../species";
import catalog from "./catalog.json";

// Generated from the shipped GLB; persistence, assembly and UI share this whitelist.
export const AMIR_PART_OPTIONS = catalog.options;

// Class weapons still live in appearance.equipment; these are visual defaults, not item stats.
export const AMIR_CLASS_WEAPONS = {
  warrior: { slot: "rightHand", defaultId: "sword-01.col", options: AMIR_PART_OPTIONS.rightHand.filter((id) => id?.startsWith("sword-")) },
  ranger: { slot: "leftHand", defaultId: "bow-01.col", options: AMIR_PART_OPTIONS.leftHand.filter((id) => id?.startsWith("bow-")) },
  mage: { slot: "rightHand", defaultId: "staff-02.col", options: AMIR_PART_OPTIONS.rightHand.filter((id) => /^(staff|hammer)-/.test(id || "")) },
};

export const getAmirEquipmentOptions = (slot, gameClass) => {
  const weapon = AMIR_CLASS_WEAPONS[gameClass];
  if (!weapon) return AMIR_PART_OPTIONS[slot];
  if (slot === weapon.slot) return [null, ...weapon.options];
  if (slot === "rightHand") return [null];
  if (slot === "leftHand") return AMIR_PART_OPTIONS.leftHand.filter((id) => !AMIR_CLASS_WEAPONS.ranger.options.includes(id));
  return AMIR_PART_OPTIONS[slot];
};

// Resolve visuals without migrating or mutating saved appearances. NPCs without a class
// retain unrestricted cosmetic assembly; players always display their class's weapon type.
export const applyAmirClassWeapon = (appearance, gameClass) => {
  const weapon = AMIR_CLASS_WEAPONS[gameClass];
  if (!weapon) return appearance;
  const equipment = Object.fromEntries(Object.entries(appearance.equipment).map(([slot, id]) =>
    [slot, getAmirEquipmentOptions(slot, gameClass).includes(id) ? id : null]));
  equipment[weapon.slot] ||= weapon.defaultId;
  return { ...appearance, equipment };
};

export const DEFAULT_AMIR_APPEARANCE = {
  head: "head-01", hair: "hair-51", skinTone: "medium", bodyType: "medium", gender: "female",
  outfit: { torso: "torso-01", arms: "arms-01", hands: "hands-01", legs: "legs-01", feet: "feet-01" },
  // Cosmetic geometry only; Character.equipment continues to own item stats.
  equipment: { hat: null, glasses: null, mask: null, leftHand: null, rightHand: null, back: null },
};
const LEGACY_HEADS = { head1: "head-01", head2: "head-02", head3: "head-101", head4: "head-102", head5: "head-51" };

// Shared by persistence and assembly; legacy documents need no destructive migration.
export const normalizeAmirAppearance = (appearance = {}, defaults = {}) => ({
  head: LEGACY_HEADS[appearance?.head] || appearance?.head || DEFAULT_AMIR_APPEARANCE.head,
  hair: appearance?.hair === undefined ? DEFAULT_AMIR_APPEARANCE.hair : appearance.hair,
  skinTone: appearance?.skinTone || defaults.skinTone || DEFAULT_AMIR_APPEARANCE.skinTone,
  bodyType: appearance?.bodyType || defaults.bodyType || DEFAULT_AMIR_APPEARANCE.bodyType,
  gender: appearance?.gender || DEFAULT_AMIR_APPEARANCE.gender,
  outfit: Object.fromEntries(Object.entries(DEFAULT_AMIR_APPEARANCE.outfit).map(([slot, value]) =>
    [slot, appearance?.outfit?.[slot] === undefined ? value : appearance.outfit[slot]])),
  equipment: Object.fromEntries(Object.entries(DEFAULT_AMIR_APPEARANCE.equipment).map(([slot, value]) =>
    [slot, appearance?.equipment?.[slot] === undefined ? value : appearance.equipment[slot]])),
});

export const isValidAmirAppearance = (appearance) => Boolean(
  typeof appearance.skinTone === "string" && Object.hasOwn(SKIN_TONES, appearance.skinTone) &&
  ["slim", "medium", "large"].includes(appearance.bodyType) &&
  ["female", "male"].includes(appearance.gender) &&
  Object.entries({ head: appearance.head, hair: appearance.hair, ...appearance.outfit, ...appearance.equipment })
    .every(([slot, value]) => AMIR_PART_OPTIONS[slot]?.includes(value))
);
