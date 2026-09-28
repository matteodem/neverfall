import React, {
  useEffect,
  useState,
} from "react";
import { CLASS_CONFIG } from "../game/classConfig";

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


const SKIN_TONES = [
  {
    id: "light",
    color: "#F1C7A5",
  },

  {
    id: "fair",
    color: "#E5B08A",
  },

  {
    id: "medium",
    color: "#C68662",
  },

  {
    id: "tan",
    color: "#A96F4C",
  },

  {
    id: "brown",
    color: "#7B4F35",
  },

  {
    id: "dark",
    color: "#4A2D22",
  },
];


const BODY_TYPES = [
  "slim",
  "medium",
  "large",
];


/*
 * Gender and head customization
 * are intentionally disabled
 * for the current KayKit character.
 *
 * We still persist defaults when
 * creating the character so the
 * existing data model remains
 * backwards compatible.
 */

const DEFAULT_GENDER =
  "male";

const DEFAULT_HEAD =
  "head1";


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


const AppearanceStep =
  () => {
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


    const appearance = {
      gender:
        DEFAULT_GENDER,

      skinTone:
        creator.skinTone,

      bodyType:
        creator.bodyType,

      head:
        DEFAULT_HEAD,
    };


    return (
      <div className="character-creator-appearance mb-12">
        <h2 className="mb-8 text-center text-3xl font-bold">
          Character Appearance
        </h2>

        <div className="character-creator-appearance-grid grid min-h-[440px] grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">

          {/*
           * ==========================================
           * APPEARANCE SETTINGS
           * ==========================================
           */}

          <div className="character-creator-settings flex flex-col gap-8">

            {/*
             * ==========================================
             * GENDER
             * ==========================================
             *
             * Disabled for now.
             *
             * KayKit Knight currently has no separate
             * male/female model variants wired into
             * the character creator.
             */}


            {/*
             * ==========================================
             * SKIN TONE
             * ==========================================
             */}

            <div>
              <h3 className="mb-3 font-bold">
                Skin Tone
              </h3>

              <div className="character-creator-skin-tones flex flex-wrap gap-3">
                {SKIN_TONES.map(
                  (
                    skin
                  ) => (
                    <button
                      key={
                        skin.id
                      }
                      type="button"
                      title={
                        skin.id
                      }
                      aria-label={
                        `Skin tone ${skin.id}`
                      }
                      onClick={
                        () =>
                          setCreatorField(
                            "skinTone",
                            skin.id
                          )
                      }
                      className={[
                        "character-creator-skin-tone h-10 w-10 cursor-pointer rounded-full border-4 transition",

                        creator.skinTone ===
                        skin.id
                          ? "border-primary"
                          : "border-white/20",
                      ].join(
                        " "
                      )}
                      style={{
                        backgroundColor:
                          skin.color,
                      }}
                    />
                  )
                )}
              </div>
            </div>


            {/*
             * ==========================================
             * BODY TYPE
             * ==========================================
             */}

            <div>
              <h3 className="mb-3 font-bold">
                Body Type
              </h3>

              <div className="character-creator-body-types flex flex-wrap gap-2">
                {BODY_TYPES.map(
                  (
                    bodyType
                  ) => (
                    <button
                      key={
                        bodyType
                      }
                      type="button"
                      onClick={
                        () =>
                          setCreatorField(
                            "bodyType",
                            bodyType
                          )
                      }
                      className={[
                        "character-creator-body-type btn cursor-pointer capitalize",

                        creator.bodyType ===
                        bodyType
                          ? "btn-primary"
                          : "btn-outline text-white hover:text-black",
                      ].join(
                        " "
                      )}
                    >
                      {bodyType}
                    </button>
                  )
                )}
              </div>
            </div>


            {/*
             * ==========================================
             * HEAD
             * ==========================================
             *
             * Disabled for now.
             *
             * The current KayKit Knight only exposes
             * one head mesh, so the old five-head
             * selector does not currently make sense.
             */}
          </div>


          {/*
           * ==========================================
           * CHARACTER PREVIEW
           * ==========================================
           */}

          <div className="flex items-center justify-center">
            <div className="character-creator-preview h-[280px] w-full max-w-[280px] overflow-hidden rounded-xl border border-white/10 bg-black/20 sm:h-[380px]">
              <CharacterPreview
                gameClass={creator.gameClass}
                appearance={
                  appearance
                }
              />
            </div>
          </div>
        </div>
      </div>
    );
  };


const SpeciesStep =
  () => {
    return (
      <Screen
        title="Species"
      >
        <button
          type="button"
          className="btn btn-primary cursor-pointer px-8 py-5"
        >
          Human
        </button>
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

            appearance: {
              /*
               * Gender/head stay in the
               * document for compatibility,
               * but aren't customizable yet.
               */

              gender:
                DEFAULT_GENDER,

              skinTone:
                creator.skinTone,

              bodyType:
                creator.bodyType,

              head:
                DEFAULT_HEAD,
            },
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
