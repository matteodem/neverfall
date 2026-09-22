import {
  create,
} from "zustand";

export const usePlayerProgressStore =
  create(
    (set) => ({
      currentLevel: 1,
      currentXp: 0,

      setProgress({
        currentLevel,
        currentXp,
      }) {
        set({
          currentLevel,
          currentXp,
        });
      },
    })
  );