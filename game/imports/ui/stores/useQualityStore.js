import { create } from "zustand";
export const useQualityStore = create(() => ({
  quality: "standard",
}));
