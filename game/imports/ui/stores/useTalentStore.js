import { create } from "zustand";

export const useTalentStore = create((set, get) => ({
  changeHandler: null,
  setChangeHandler: (changeHandler) => set({ changeHandler }),
  select: (level, talentId) => get().changeHandler?.("selectTalent", { level, talentId }),
  reset: () => get().changeHandler?.("resetTalents"),
}));
