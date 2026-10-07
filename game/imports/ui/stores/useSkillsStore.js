import { create } from "zustand";

export const useSkillsStore = create((set, get) => ({
  equippedSkills: undefined,
  inCombat: false,
  pending: false,
  error: "",
  changeHandler: null,
  setChangeHandler: (changeHandler) => set({ changeHandler, pending: false, error: "" }),
  sync: (equippedSkills, inCombat) => set({ equippedSkills, inCombat }),
  change: (equippedSkills) => {
    const state = get();
    if (!state.changeHandler || state.pending || state.inCombat) return;
    set({ pending: true, error: "" });
    state.changeHandler(equippedSkills);
  },
  finish: ({ equippedSkills, error = "" }) => set((state) => ({
    equippedSkills: equippedSkills || state.equippedSkills, pending: false, error,
  })),
}));
