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
        });
      },
    })
  );