import { SKIN_TONES } from "../../species";

const variants = (slot, ids = ["00", "01", "02", "101", "102", "51", "52"]) => ids.map((id) => `${slot}-${id}`);
export const AMIR_PART_OPTIONS = {
  head: variants("head"), hair: [null, "hair-51", "hair-102"],
  torso: variants("torso"), arms: variants("arms"), legs: variants("legs"), feet: variants("feet"),
  hands: variants("hands", ["00", "01", "02", "101", "51", "52"]),
  hat: [null, "hat-01", "hat-02", "hat-101", "hat-51"],
  glasses: [null, "glasses-102", "glasses-52"], mask: [null, "mask-102"],
  leftHand: [null, "bow-01.col", "bow-02.col", "shield-01.col", "shield-02.col"],
  rightHand: [null, "2Hgun-51.col", "axe-01.col", "gun-101.col", "hammer-01.col", "staff-02.col", "sword-01.col", "sword-02.col"],
  back: [null, "arrows-01.col", "arrows-02.col", "backpack-01.col", "cloak-01.col"],
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
