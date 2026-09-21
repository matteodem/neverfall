import {
  create,
} from "zustand";

export const useLoadingStore =
  create(
    (set) => ({
      visible: false,
      progress: 0,

      show() {
        set({
          visible: true,
          progress: 0,
        });
      },

      hide() {
        set({
          visible: false,
        });
      },

      setProgress(
        progress
      ) {
        set({
          progress:
            Math.max(
              0,
              Math.min(
                100,
                progress
              )
            ),
        });
      },
    })
  );