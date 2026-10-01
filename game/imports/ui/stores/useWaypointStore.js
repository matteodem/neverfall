import { create } from "zustand";

export const useWaypointStore = create((set, get) => ({
  travelHandler: null,
  setTravelHandler: (travelHandler) => set({ travelHandler }),
  travel: (waypointId) => get().travelHandler?.(waypointId),
}));
