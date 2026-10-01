import { create } from "zustand";

export const useWaypointStore = create((set, get) => ({
  travelHandler: null,
  traveling: false,
  setTravelHandler: (travelHandler) => set({ travelHandler }),
  setTraveling: (traveling) => set({ traveling }),
  travel: (waypointId) => get().travelHandler?.(waypointId),
}));
