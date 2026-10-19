import { create } from "zustand";
export const useQualityStore = create(() => ({
  quality: typeof navigator !== "undefined" && /iPhone/i.test(navigator.userAgent) ? "low" : "standard",
}));
