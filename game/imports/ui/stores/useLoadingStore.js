import {
  create,
} from "zustand";

export const useLoadingStore =
  create(
    (set) => ({
      visible: false,
      progress: 0,
      error: "",

      show() {
        set({
          visible: true,
          progress: 0,
          error: "",
        });
      },

      hide() {
        set({
          visible: false,
        });
      },

      setError(error) {
        set({
          visible: true,
          error,
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
