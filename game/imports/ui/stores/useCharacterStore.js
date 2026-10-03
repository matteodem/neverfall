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
    "hood",

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

      setCreatorSpecies(species, defaults) {
        set((state) => ({
          creator: {
            ...state.creator,
            species,
            skinTone: defaults.defaultSkinTone,
            bodyType: defaults.defaultBodyType,
          },
        }));
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
