import {
  create,
} from "zustand";


const INITIAL_CREATOR = {
  gender:
    "female",

  skinTone:
    "medium",

  bodyType:
    "medium",

  head:
    "head1",

  species:
    "human",

  gameClass:
    "warrior",

  name:
    "",
};


export const useCharacterStore =
  create(
    (set) => ({
      screen:
        "overview",

      creator: {
        ...INITIAL_CREATOR,
      },

      setScreen(
        screen
      ) {
        set({
          screen,
        });
      },

      setCreatorField(
        field,
        value
      ) {
        set(
          (
            state
          ) => ({
            creator: {
              ...state.creator,

              [field]:
                value,
            },
          })
        );
      },

      resetCreator() {
        set({
          creator: {
            ...INITIAL_CREATOR,
          },
        });
      },
    })
  );