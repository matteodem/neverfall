import { create } from "zustand";

export const useEquipmentStore = create((set, get) => ({
  changeHandler: null,
  setChangeHandler(changeHandler) {
    set({ changeHandler });
  },
  requestChange(action, payload) {
    get().changeHandler?.(action, payload);
  },
}));
