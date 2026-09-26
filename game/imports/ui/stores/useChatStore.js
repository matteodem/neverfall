import { create } from "zustand";

export const useChatStore = create((set, get) => ({
  open: false, draft: "", focusRequest: 0, roomId: null, sendHandler: null, error: "",
  show(draft) { set((state) => ({ open: true, focusRequest: state.focusRequest + 1, ...(draft !== undefined ? { draft } : {}) })); },
  close() { set({ open: false }); },
  setDraft: (draft) => set({ draft }),
  connect: (roomId, sendHandler) => set({ roomId, sendHandler }),
  disconnect: () => set({ roomId: null, sendHandler: null, open: false, draft: "", error: "" }),
  setError: (error) => set({ error }),
  send() {
    const { draft, sendHandler } = get();
    if (!draft.trim() || !sendHandler) return;
    sendHandler(draft);
    set({ draft: "", error: "" });
  },
}));
