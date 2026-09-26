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
      area: "boar",

      setGiantKills(giantKills) { set({ giantKills }); },
      setWolfKills(wolfKills) { set({ wolfKills }); },
      setArea(area) { set({ area }); },

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
          area: "boar",
        });
      },
    })
  );