import { EQUIPMENT_ITEMS } from "./equipment";
import { CONSUMABLES } from "./consumables";
import { CRAFTING_MATERIALS } from "./crafting";

// Keep the persisted one-record-per-copy inventory format used by existing characters.
export const ITEMS = {
  // boar_skin: { id: "boar_skin", name: "Boar Skin", type: "material", stackable: true },
  // wolf_skin: { id: "wolf_skin", name: "Wolf Skin", type: "material", stackable: true },
  ...Object.fromEntries(Object.entries(CRAFTING_MATERIALS).map(([id, item]) =>
    [id, { id, type: "material", stackable: true, ...item }])),
  ...Object.fromEntries(Object.entries(CONSUMABLES).map(([id, item]) =>
    [id, { id, type: "consumable", stackable: true, ...item }])),
  ...EQUIPMENT_ITEMS,
};

export const expandItemRewards = (rewards = []) => rewards.flatMap(({ itemId, quantity = 1 }) => {
  if (!Object.hasOwn(ITEMS, itemId) || !Number.isSafeInteger(quantity) || quantity < 1) {
    throw new Error("Invalid item reward");
  }
  return Array.from({ length: quantity }, () => ({ id: itemId }));
});
