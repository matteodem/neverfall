import { create } from "zustand";

// Floating panels stay non-blocking; these dialogs and grouped tabs block gameplay.
const BLOCKING_MODALS = new Set([
  "npcDialogue", "quests", "shop", "sell-item", "settings",
  "equipment-inspection", "crafting-ingredients",
]);

export const isBlockingModal = (state, id) => BLOCKING_MODALS.has(id) ||
  (id === "items" && state.tabs.items === "shop") ||
  (id === "hero" && state.tabs.hero === "quests");

export const hasBlockingModal = (state) => state.openModals.some((id) => isBlockingModal(state, id));

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
