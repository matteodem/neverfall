import {
  create,
} from "zustand";

let popupTimeout = null;

export const useQuestStore =
  create(
    (
      set
    ) => ({
      boarKills:
        0,
      wolfKills: 0,
      giantKills: 0,
      goatKills: 0,
      ratKills: 0,
      beeKills: 0,
      sealKills: 0,
      snowWolfKills: 0,
      mountainGoatKills: 0,
      frostOgreKills: 0,
      area: null,
      huntPopup: null,
      huntPopupVisible: false,

      showHuntProgress(title, count, target) {
        clearTimeout(popupTimeout);
        set({ huntPopup: `${title}: ${count} / ${target} defeated`, huntPopupVisible: true });
        popupTimeout = setTimeout(() => {
          set({ huntPopupVisible: false });
          popupTimeout = null;
        }, 2500);
      },

      hideHuntProgress() {
        clearTimeout(popupTimeout);
        popupTimeout = null;
        set({ huntPopup: null, huntPopupVisible: false });
      },

      setGiantKills(giantKills) { set({ giantKills }); },
      setWolfKills(wolfKills) { set({ wolfKills }); },
      setArea(area) { set({ area }); },
      setGoatKills(goatKills) { set({ goatKills }); },
      setRatKills(ratKills) { set({ ratKills }); },
      setBeeKills(beeKills) { set({ beeKills }); },
      setSealKills(sealKills) { set({ sealKills }); },
      setSnowWolfKills(snowWolfKills) { set({ snowWolfKills }); },
      setMountainGoatKills(mountainGoatKills) { set({ mountainGoatKills }); },
      setFrostOgreKills(frostOgreKills) { set({ frostOgreKills }); },

      setBoarKills(
        boarKills
      ) {
        set({
          boarKills,
        });
      },

      reset() {
        clearTimeout(popupTimeout);
        popupTimeout = null;
        set({
          boarKills:
            0,
          wolfKills: 0,
          giantKills: 0,
          goatKills: 0,
          ratKills: 0,
          beeKills: 0,
          sealKills: 0,
          snowWolfKills: 0,
          mountainGoatKills: 0,
          frostOgreKills: 0,
          area: null,
          huntPopup: null,
          huntPopupVisible: false,
        });
      },
    })
  );
