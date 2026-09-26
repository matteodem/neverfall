import { create } from "zustand";

let hideTimeout = null;
export const useBossNoticeStore = create((set) => ({
  text: null,
  show(text) {
    clearTimeout(hideTimeout);
    set({ text });
    hideTimeout = setTimeout(() => set({ text: null }), 3000);
  },
  reset() {
    clearTimeout(hideTimeout);
    hideTimeout = null;
    set({ text: null });
  },
}));
