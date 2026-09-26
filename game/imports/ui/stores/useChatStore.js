import { create } from "zustand";

export const useChatStore = create((set, get) => ({
  open: false, draft: "", lastChannelPrefix: "", focusRequest: 0, roomId: null, sendHandler: null, error: "",
  show(draft) { set((state) => ({ open: true, focusRequest: state.focusRequest + 1, ...(draft !== undefined ? { draft } : {}) })); },
  close() { set({ open: false }); },
  setDraft: (draft) => set({ draft }),
  connect: (roomId, sendHandler) => set({ roomId, sendHandler }),
  disconnect: () => set({ roomId: null, sendHandler: null, open: false, draft: get().lastChannelPrefix, error: "" }),
  setError: (error) => set({ error }),
  send() {
    const { draft, sendHandler } = get();
    if (!draft.trim() || !sendHandler) return;
    const text = draft.trim();
    if (text === get().lastChannelPrefix.trim() && get().lastChannelPrefix) return;
    const whisper = text.match(/^\/whisper\s+"([^"]+)"\s+(.+)$/i);
    let prefix = get().lastChannelPrefix;
    if (whisper) prefix = `/whisper "${whisper[1]}" `;
    else if (/^\/party\s+\S/i.test(text)) prefix = "/party ";
    else if (!text.startsWith("/")) prefix = "";
    sendHandler(draft);
    set({ draft: prefix, lastChannelPrefix: prefix, error: "" });
  },
}));
