import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import { CLASS_CONFIG } from "../game/classConfig";
import { SPECIES } from "../game/species";
import { createAmirStartingAppearance, normalizeAmirAppearance } from "../game/character/amir/appearance";
import { AmirAppearanceControls } from "./components/AmirAppearanceControls";

import {
  Meteor,
} from "meteor/meteor";

import {
  Wizard,
  useWizard,
} from "react-use-wizard";

import {
  useCharacterStore,
} from "./stores/useCharacterStore";

import {
  CharacterPreview,
} from "./CharacterPreview";


const Screen = ({
  title,
  children,
}) => {
  return (
    <div className="character-creator-screen flex min-h-[400px] flex-col items-center justify-center">
      <h2 className="mb-8 text-center text-3xl font-bold">
        {title}
      </h2>

      {children}
    </div>
  );
};


const Navigation = () => {
  const {
    previousStep,
    nextStep,
    isFirstStep,
    isLastStep,
  } =
    useWizard();

  const setScreen =
    useCharacterStore(
      (state) =>
        state.setScreen
    );


  const handleBack =
    () => {
      if (
        isFirstStep
      ) {
        setScreen(
          "overview"
        );

        return;
      }

      previousStep();
    };


  return (
    <div className="character-creator-nav flex shrink-0 justify-between pt-4">
      <button
        type="button"
        onClick={
          handleBack
        }
        className="btn btn-secondary cursor-pointer"
      >
        Back
      </button>

      {!isLastStep && (
        <button
          type="button"
          onClick={
            nextStep
          }
          className="btn btn-primary cursor-pointer"
        >
          Next
        </button>
      )}
    </div>
  );
};


const AppearanceStep = () => {
  const creator = useCharacterStore((state) => state.creator);
  const setField = useCharacterStore((state) => state.setCreatorField);
  const [showAllCustomizations, setShowAllCustomizations] = useState(false);
  const initializedDevelopmentOptions = useRef(false);
  const developmentPreview = Meteor.isDevelopment && showAllCustomizations;
  const toggleCustomizations = (show) => {
    if (!Meteor.isDevelopment) return;
    if (show && !initializedDevelopmentOptions.current) {
      // Start manual exploration from the outfit currently shown in the preview.
      const startingAppearance = createAmirStartingAppearance(creator, creator.gameClass);
      setField("outfit", startingAppearance.outfit);
      setField("equipment", startingAppearance.equipment);
      initializedDevelopmentOptions.current = true;
    }
    setShowAllCustomizations(show);
  };
  return (
    <div className="character-creator-appearance mb-4">
      <h2 className="mb-4 text-center text-3xl font-bold">Character Appearance</h2>
      <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_280px]">
        <div className="order-first h-[260px] overflow-hidden rounded-xl border border-white/10 bg-black/20 md:order-last md:sticky md:top-0 md:h-[440px]">
          <CharacterPreview appearance={developmentPreview ? normalizeAmirAppearance(creator) : createAmirStartingAppearance(creator, creator.gameClass)}
            gameClass={creator.gameClass} previewAllEquipment={developmentPreview} />
        </div>
        <AmirAppearanceControls showAllCustomizations={developmentPreview} onShowAllCustomizationsChange={toggleCustomizations} />
      </div>
    </div>
  );
};


const SpeciesStep =
  () => {
    const species = useCharacterStore((state) => state.creator.species);
    const setCreatorSpecies = useCharacterStore((state) => state.setCreatorSpecies);

    return (
      <Screen
        title="Species"
      >
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
          {Object.entries(SPECIES).map(([id, config]) => (
            <button
              key={id}
              type="button"
              onClick={() => setCreatorSpecies(id, config)}
              aria-pressed={species === id}
              className={`flex min-h-16 cursor-pointer flex-col items-center justify-center rounded-lg border px-4 py-2 text-center sm:min-h-20 ${species === id ? "border-primary bg-primary text-primary-content" : "border-white/20 hover:border-primary"}`}
            >
              <span className="font-bold">{config.name}</span>
              <span className="text-sm">{config.passive}</span>
            </button>
          ))}
        </div>
      </Screen>
    );
  };


const ClassStep =
  () => {
    const gameClass = useCharacterStore((state) => state.creator.gameClass);
    const setCreatorField = useCharacterStore((state) => state.setCreatorField);
    return (
      <Screen
        title="Class"
      >
        <div className="character-creator-classes grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          {Object.entries(CLASS_CONFIG).map(([id, config]) => (
            <button
              key={id}
              type="button"
              onClick={() => setCreatorField("gameClass", id)}
              className={`btn w-full cursor-pointer px-4 py-5 sm:px-8 ${gameClass === id ? "btn-primary" : "btn-outline text-white hover:text-black"}`}
            >
              {config.name}
            </button>
          ))}
        </div>
      </Screen>
    );
  };


const NameStep = ({
  onCreated,
}) => {
  const creator =
    useCharacterStore(
      (state) =>
        state.creator
    );

  const setCreatorField =
    useCharacterStore(
      (state) =>
        state.setCreatorField
    );


  const [
    available,
    setAvailable,
  ] =
    useState(
      null
    );


  const [
    checking,
    setChecking,
  ] =
    useState(
      false
    );


  const [
    creating,
    setCreating,
  ] =
    useState(
      false
    );


  useEffect(
    () => {
      const name =
        creator.name.trim();

      if (
        !name
      ) {
        setAvailable(
          null
        );

        return;
      }


      setChecking(
        true
      );


      const timeout =
        setTimeout(
          async () => {
            try {
              const result =
                await Meteor.callAsync(
                  "characters.isNameAvailable",
                  name
                );

              setAvailable(
                result
              );
            } finally {
              setChecking(
                false
              );
            }
          },
          300
        );


      return () => {
        clearTimeout(
          timeout
        );
      };
    },
    [
      creator.name,
    ]
  );


  const create =
    async () => {
      if (
        !available ||
        creating
      ) {
        return;
      }


      setCreating(
        true
      );


      try {
        await Meteor.callAsync(
          "characters.create",
          {
            name:
              creator.name,

            species:
              creator.species,

            gameClass:
              creator.gameClass,

            appearance: createAmirStartingAppearance(creator, creator.gameClass),
          }
        );


        onCreated();
      } finally {
        setCreating(
          false
        );
      }
    };


  return (
    <Screen
      title="Name"
    >
      <div className="w-full max-w-96">
        <div className="relative">
          <input
            value={
              creator.name
            }
            onChange={
              (
                event
              ) =>
                setCreatorField(
                  "name",
                  event.target.value
                )
            }
            placeholder="Character name"
            className="input input-bordered w-full pr-12 text-black placeholder:text-gray-500"
          />

          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {checking && (
              <span className="text-white/50">
                …
              </span>
            )}

            {!checking &&
              available ===
                true && (
                <span className="font-bold text-green-400">
                  ✓
                </span>
              )}

            {!checking &&
              available ===
                false && (
                <span className="font-bold text-red-400">
                  ✕
                </span>
              )}
          </div>
        </div>

        <div className="mt-2 h-5 text-sm">
          {available ===
            true && (
            <span className="text-green-400">
              Name available
            </span>
          )}

          {available ===
            false && (
            <span className="text-red-400">
              Name already taken
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={
            !available ||
            creating
          }
          onClick={
            create
          }
          className="character-creator-create btn btn-success mt-8 w-full cursor-pointer text-lg disabled:cursor-not-allowed"
        >
          {creating
            ? "Creating..."
            : "Create"}
        </button>
      </div>
    </Screen>
  );
};


export const CharacterCreator =
  () => {
    const setScreen =
      useCharacterStore(
        (state) =>
          state.setScreen
      );

    const resetCreator =
      useCharacterStore(
        (state) =>
          state.resetCreator
      );


    const finish =
      () => {
        resetCreator();

        setScreen(
          "overview"
        );
      };


    return (
      <div className="character-creator flex h-screen h-dvh items-center justify-center bg-zinc-950 p-4 text-white">
        <div className="character-creator-card flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-white/10 bg-white/15 p-4 sm:p-8">
          <Wizard
            wrapper={<div className="character-creator-step min-h-0 flex-1 overflow-y-auto" />}
            footer={
              <Navigation />
            }
          >
            <SpeciesStep />

            <ClassStep />

            <AppearanceStep />

            <NameStep
              onCreated={
                finish
              }
            />
          </Wizard>
        </div>
      </div>
    );
  };
