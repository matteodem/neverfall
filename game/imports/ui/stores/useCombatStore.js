import {
  create,
} from "zustand";


let combatTimeout =
  null;


export const useCombatStore =
  create(
    (set) => ({
      isInCombat:
        false,


      triggerCombat() {
        set({
          isInCombat:
            true,
        });


        if (
          combatTimeout
        ) {
          clearTimeout(
            combatTimeout
          );
        }


        /*
         * Boars currently attack roughly
         * once per second.
         *
         * Every attack refreshes this.
         * After the last attack the border
         * fades away.
         */
        combatTimeout =
          setTimeout(
            () => {
              set({
                isInCombat:
                  false,
              });

              combatTimeout =
                null;
            },
            500
          );
      },


      resetCombat() {
        if (
          combatTimeout
        ) {
          clearTimeout(
            combatTimeout
          );

          combatTimeout =
            null;
        }


        set({
          isInCombat:
            false,
        });
      },
    })
  );