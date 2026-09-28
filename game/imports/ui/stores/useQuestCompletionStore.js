import { create } from "zustand";

export const useQuestCompletionStore = create((set) => ({
  current: null,
  queue: [],
  show(quest) {
    set((state) => state.current
      ? { queue: [...state.queue, quest] }
      : { current: quest });
  },
  dismiss() {
    set((state) => ({
      current: state.queue[0] || null,
      queue: state.queue.slice(1),
    }));
  },
  reset() { set({ current: null, queue: [] }); },
}));
