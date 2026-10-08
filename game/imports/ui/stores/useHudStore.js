import { create } from "zustand";

export const useHudStore = create((set) => ({
  uiVisible: true,
  activeModal: null,
  openModals: [],
  tabs: { items: "inventory", hero: "gear" },

  toggleUi: () => set((state) => ({ uiVisible: !state.uiVisible })),

  openModal: (modal) => set((state) => {
    const openModals = state.openModals.filter((openModal) => openModal !== modal);
    openModals.push(modal);
    return { openModals, activeModal: modal };
  }),

  openSection: (modal, tab) => set((state) => {
    const openModals = state.openModals.filter((openModal) => openModal !== modal &&
      !(modal === "items" && tab !== "inventory" && ["sell-item", "equipment-inspection"].includes(openModal)));
    openModals.push(modal);
    return { openModals, activeModal: modal, tabs: { ...state.tabs, [modal]: tab } };
  }),

  setTab: (modal, tab) => set((state) => {
    const openModals = state.openModals.filter((openModal) =>
      !(modal === "items" && tab !== "inventory" && ["sell-item", "equipment-inspection"].includes(openModal)));
    return { tabs: { ...state.tabs, [modal]: tab }, openModals,
      activeModal: openModals[openModals.length - 1] || null };
  }),

  closeModal: (modal) => set((state) => {
    if (!modal) return { openModals: [], activeModal: null };

    const openModals = state.openModals.filter((openModal) => openModal !== modal &&
      !(modal === "items" && ["sell-item", "equipment-inspection"].includes(openModal)));
    return { openModals, activeModal: openModals[openModals.length - 1] || null };
  }),
}));
