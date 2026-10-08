import { create } from "zustand";

export const useInventoryDragStore = create((set) => ({
  source: null,
  busy: false,
  error: "",
  select: (source) => set({ source, error: "" }),
  clear: () => set({ source: null }),
  setBusy: (busy) => set({ busy }),
  setError: (error) => set({ source: null, error }),
}));
