import { create } from "zustand";

export const useConsumableStore = create((set, get) => ({
  useHandler: null,
  setUseHandler(useHandler) {
    set({ useHandler });
  },
  requestUse(itemId) {
    get().useHandler?.(itemId);
  },
}));
