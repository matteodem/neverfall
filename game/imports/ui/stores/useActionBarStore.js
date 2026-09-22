import {
  create,
} from "zustand";

export const useActionBarStore =
  create(
    (set, get) => ({
      skillHandler:
        null,

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