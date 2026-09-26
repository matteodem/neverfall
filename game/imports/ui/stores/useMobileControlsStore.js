import { create } from "zustand";

export const useMobileControlsStore = create((set) => ({
  direction: { x: 0, y: 0 },
  setDirection: (direction) => set({ direction }),
  reset: () => set({ direction: { x: 0, y: 0 } }),
}));
