import {
  create,
} from "zustand";


let hideTimeout =
  null;


export const useLevelUpStore =
  create(
    (set) => ({
      visible:
        false,

      level:
        null,


      showLevelUp(
        level
      ) {
        if (
          hideTimeout
        ) {
          clearTimeout(
            hideTimeout
          );
        }


        set({
          visible:
            true,

          level,
        });


        hideTimeout =
          setTimeout(
            () => {
              set({
                visible:
                  false,
              });

              hideTimeout =
                null;
            },
            5000
          );
      },


      hideLevelUp() {
        if (
          hideTimeout
        ) {
          clearTimeout(
            hideTimeout
          );

          hideTimeout =
            null;
        }


        set({
          visible:
            false,
        });
      },
    })
  );