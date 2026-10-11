import { stackItems } from "./inventory";

export const INVENTORY_SLOTS = 20;

// Slot order is presentation metadata; the existing item records remain untouched.
export const getInventorySlots = (items = [], slotOrder = []) => {
  const entries = stackItems(items);
  const stacks = new Map();
  for (const item of entries) {
    if (!stacks.has(item.id)) stacks.set(item.id, []);
    stacks.get(item.id).push(item);
  }
  const slots = Array(Math.max(INVENTORY_SLOTS, entries.length)).fill(null);
  for (let index = 0; index < slots.length; index++) {
    const item = stacks.get(slotOrder[index])?.shift();
    if (!item) continue;
    slots[index] = item;
  }
  for (const copies of stacks.values()) {
    for (const item of copies) slots[slots.indexOf(null)] = item;
  }
  return slots;
};

export const moveInventoryItem = (items, slotOrder, itemId, targetIndex) => {
  const slots = getInventorySlots(items, slotOrder);
  const sourceIndex = slots.findIndex((item) => item?.id === itemId);
  if (sourceIndex < 0 || !Number.isInteger(targetIndex) || targetIndex < 0 || targetIndex >= slots.length) return null;
  [slots[sourceIndex], slots[targetIndex]] = [slots[targetIndex], slots[sourceIndex]];
  return slots.map((item) => item?.id || null);
};
