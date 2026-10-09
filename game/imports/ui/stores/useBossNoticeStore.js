import { create } from "zustand";

let hideTimeout = null;
export const useBossNoticeStore = create((set) => ({
  text: null,
  show(text, duration = 3000) {
    clearTimeout(hideTimeout);
    set({ text });
    hideTimeout = setTimeout(() => set({ text: null }), duration);
  },
  reset() {
    clearTimeout(hideTimeout);
    hideTimeout = null;
    set({ text: null });
  },
}));
