import {
  create,
} from "zustand";
import { normalizeAmirAppearance } from "../../game/character/amir/appearance";


const initialCreator = () => ({
  ...normalizeAmirAppearance({ gender: "male" }),
  species: "human", gameClass: "warrior", name: "",
});


export const useCharacterStore =
  create(
    (set) => ({
      screen:
        "overview",

      creator: initialCreator(),

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
          creator: initialCreator(),
        });
      },
    })
  );
