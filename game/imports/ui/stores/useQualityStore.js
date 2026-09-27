import { create } from "zustand";
import { QUALITY_PRESETS } from "../../game/performanceConfig";

const defaultQuality = () => {
  try {
    const saved = localStorage.getItem("neverfall-quality");
    if (QUALITY_PRESETS[saved]) return saved;
  } catch { /* Storage may be unavailable. */ }
  return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches ? "low" : "standard";
};

export const useQualityStore = create((set) => ({
  quality: defaultQuality(),
  setQuality(quality) {
    if (!QUALITY_PRESETS[quality]) return;
    try { localStorage.setItem("neverfall-quality", quality); } catch { /* Keep the in-memory choice. */ }
    set({ quality });
  },
}));
