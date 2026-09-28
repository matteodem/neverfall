import { create } from "zustand";

export const useHudStore = create((set) => ({
  uiVisible: true,
  activeModal: null,
  openModals: [],

  toggleUi: () => set((state) => ({ uiVisible: !state.uiVisible })),

  openModal: (modal) => set((state) => {
    const openModals = state.openModals.filter((openModal) => openModal !== modal);
    openModals.push(modal);
    return { openModals, activeModal: modal };
  }),

  closeModal: (modal) => set((state) => {
    if (!modal) return { openModals: [], activeModal: null };

    const openModals = state.openModals.filter((openModal) => openModal !== modal);
    return { openModals, activeModal: openModals[openModals.length - 1] || null };
  }),
}));
