import {
  create,
} from "zustand";

export const useLoadingStore =
  create(
    (set) => ({
      visible: false,
      progress: 0,
      error: "",
      mode: "initial",

      show() {
        set({
          visible: true,
          progress: 0,
          error: "",
          mode: "initial",
        });
      },

      showDestination() {
        set({ visible: true, error: "", mode: "destination" });
      },

      hide() {
        set({
          visible: false,
          mode: "initial",
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
