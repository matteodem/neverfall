import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import { CLASS_CONFIG } from "../game/classConfig";
import { SPECIES } from "../game/species";
import { createAmirStartingAppearance, normalizeAmirAppearance } from "../game/character/amir/appearance";
import { AmirAppearanceControls } from "./components/AmirAppearanceControls";
import { FantasyBadge, FantasyButton, FantasyPanel, FantasySectionHeader } from "./components/fantasy/FantasyUI";

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
      <FantasySectionHeader as="h2" className="mb-8 text-center text-3xl">
        {title}
      </FantasySectionHeader>

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
      <FantasyButton
        variant="secondary"
        onClick={
          handleBack
        }
        className="cursor-pointer"
      >
        Back
      </FantasyButton>

      {!isLastStep && (
        <FantasyButton
          onClick={
            nextStep
          }
          className="cursor-pointer"
        >
          Next
        </FantasyButton>
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
      <FantasySectionHeader as="h2" className="mb-4 text-center text-3xl">Character Appearance</FantasySectionHeader>
      <div className="character-creator-appearance-grid grid min-w-0 grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(260px,320px)]">
        <FantasyPanel className="character-creator-preview overflow-hidden">
          <CharacterPreview appearance={developmentPreview ? normalizeAmirAppearance(creator) : createAmirStartingAppearance(creator, creator.gameClass)}
            gameClass={creator.gameClass} previewAllEquipment={developmentPreview} />
        </FantasyPanel>
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
            <FantasyButton
              key={id}
              variant="secondary"
              onClick={() => setCreatorSpecies(id, config)}
              aria-pressed={species === id}
              className="fantasy-choice min-h-16 w-full cursor-pointer flex-col items-center justify-center text-center sm:min-h-20"
            >
              <span className="font-bold">{config.name}</span>
              <span className="fantasy-muted text-sm">{config.passive}</span>
              {species === id && <FantasyBadge tone="success">Selected</FantasyBadge>}
            </FantasyButton>
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
            <FantasyButton
              key={id}
              variant="secondary"
              onClick={() => setCreatorField("gameClass", id)}
              aria-pressed={gameClass === id}
              className="fantasy-choice w-full cursor-pointer justify-center px-4 py-5 sm:px-8"
            >
              {config.name}
              {gameClass === id && <FantasyBadge tone="success">Selected</FantasyBadge>}
            </FantasyButton>
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
            aria-label="Character name"
            className="input fantasy-input w-full pr-12"
          />

          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {checking && (
              <span className="fantasy-muted">
                …
              </span>
            )}

            {!checking &&
              available ===
                true && (
                <span className="font-bold fantasy-creator-success">
                  ✓
                </span>
              )}

            {!checking &&
              available ===
                false && (
                <span className="font-bold fantasy-danger">
                  ✕
                </span>
              )}
          </div>
        </div>

        <div className="mt-2 min-h-5 text-sm" role="status">
          {available ===
            true && (
            <span className="fantasy-creator-success">
              Name available
            </span>
          )}

          {available ===
            false && (
            <span className="fantasy-danger">
              Name already taken
            </span>
          )}
        </div>

        <FantasyButton
          variant="primary"
          disabled={
            !available ||
            creating
          }
          onClick={
            create
          }
          className="character-creator-create mt-8 w-full cursor-pointer text-lg disabled:cursor-not-allowed"
        >
          {creating
            ? "Creating..."
            : "Create"}
        </FantasyButton>
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
      <div className="fantasy-ui fantasy-character-creator character-creator flex h-screen h-dvh items-center justify-center p-4">
        <FantasyPanel className="character-creator-card flex max-h-full w-full max-w-6xl flex-col overflow-hidden p-4 sm:p-6">
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
        </FantasyPanel>
      </div>
    );
  };
