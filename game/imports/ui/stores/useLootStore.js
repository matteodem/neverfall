import { create } from "zustand";

export const useLootStore = create((set) => ({
  nearbyId: null,
  setNearbyId: (nearbyId) => set({ nearbyId }),
}));
