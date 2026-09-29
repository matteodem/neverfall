import {
  create,
} from "zustand";


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
      area: null,

      setGiantKills(giantKills) { set({ giantKills }); },
      setWolfKills(wolfKills) { set({ wolfKills }); },
      setArea(area) { set({ area }); },
      setGoatKills(goatKills) { set({ goatKills }); },
      setRatKills(ratKills) { set({ ratKills }); },
      setBeeKills(beeKills) { set({ beeKills }); },
      setSealKills(sealKills) { set({ sealKills }); },

      setBoarKills(
        boarKills
      ) {
        set({
          boarKills,
        });
      },

      reset() {
        set({
          boarKills:
            0,
          wolfKills: 0,
          giantKills: 0,
          goatKills: 0,
          ratKills: 0,
          beeKills: 0,
          sealKills: 0,
          area: null,
        });
      },
    })
  );
