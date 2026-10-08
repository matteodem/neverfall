import { stackItems } from "./inventory";

export const INVENTORY_SLOTS = 20;

// Slot order is presentation metadata; the existing item records remain untouched.
export const getInventorySlots = (items = [], slotOrder = []) => {
  const stacks = new Map(stackItems(items).map((item) => [item.id, item]));
  const slots = Array(Math.max(INVENTORY_SLOTS, stacks.size)).fill(null);
  for (let index = 0; index < slots.length; index++) {
    const item = stacks.get(slotOrder[index]);
    if (!item) continue;
    slots[index] = item;
    stacks.delete(item.id);
  }
  for (const item of stacks.values()) slots[slots.indexOf(null)] = item;
  return slots;
};

export const moveInventoryItem = (items, slotOrder, itemId, targetIndex) => {
  const slots = getInventorySlots(items, slotOrder);
  const sourceIndex = slots.findIndex((item) => item?.id === itemId);
  if (sourceIndex < 0 || !Number.isInteger(targetIndex) || targetIndex < 0 || targetIndex >= slots.length) return null;
  [slots[sourceIndex], slots[targetIndex]] = [slots[targetIndex], slots[sourceIndex]];
  return slots.map((item) => item?.id || null);
};
