import {
  create,
} from "zustand";

export const useActionBarStore =
  create(
    (set, get) => ({
      skillHandler:
        null,

      cooldownUntil: {},

      setCooldown(code, duration) {
        set((state) => ({
          cooldownUntil: { ...state.cooldownUntil, [code]: Date.now() + duration },
        }));
      },

      resetCooldowns() {
        set({ cooldownUntil: {} });
      },

      setSkillHandler(
        skillHandler
      ) {
        set({
          skillHandler,
        });
      },

      triggerSkill(
        code
      ) {
        get()
          .skillHandler
          ?.(
            code
          );
      },
    })
  );
