import React, {
  useEffect,
  useState,
} from "react";

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


const HEADS = [
  "head1",
  "head2",
  "head3",
  "head4",
  "head5",
];


const GENDERS = [
  "female",
  "male",
];


const Screen = ({
  title,
  children,
}) => {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center">
      <h2 className="mb-8 text-3xl font-bold">
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
    <div className="flex justify-between">
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
        creator.gender,

      skinTone:
        creator.skinTone,

      bodyType:
        creator.bodyType,

      head:
        creator.head,
    };


    return (
      <div className="mb-12">
        <h2 className="mb-8 text-center text-3xl font-bold">
          Character Appearance
        </h2>

        <div className="grid min-h-[440px] grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          {/*
           * ==========================================
           * APPEARANCE SETTINGS
           * ==========================================
           */}

          <div className="space-y-8">
            {/*
             * GENDER
             */}

            <div>
              <h3 className="mb-3 font-bold">
                Gender
              </h3>

              <div className="flex gap-2">
                {GENDERS.map(
                  (
                    gender
                  ) => (
                    <button
                      key={
                        gender
                      }
                      type="button"
                      onClick={
                        () =>
                          setCreatorField(
                            "gender",
                            gender
                          )
                      }
                      className={[
                        "btn cursor-pointer capitalize",

                        creator.gender ===
                        gender
                          ? "btn-primary"
                          : "btn-outline text-white hover:text-black",
                      ].join(
                        " "
                      )}
                    >
                      {gender}
                    </button>
                  )
                )}
              </div>
            </div>


            {/*
             * SKIN TONE
             */}

            <div>
              <h3 className="mb-3 font-bold">
                Skin Tone
              </h3>

              <div className="flex flex-wrap gap-3">
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
                      onClick={
                        () =>
                          setCreatorField(
                            "skinTone",
                            skin.id
                          )
                      }
                      className={[
                        "h-10 w-10 cursor-pointer rounded-full border-4",

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
             * BODY TYPE
             */}

            <div>
              <h3 className="mb-3 font-bold">
                Body Type
              </h3>

              <div className="flex flex-wrap gap-2">
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
                        "btn cursor-pointer capitalize",

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
             * HEAD
             */}

            <div>
              <h3 className="mb-3 font-bold">
                Head
              </h3>

              <div className="flex flex-wrap gap-2">
                {HEADS.map(
                  (
                    head
                  ) => (
                    <button
                      key={
                        head
                      }
                      type="button"
                      onClick={
                        () =>
                          setCreatorField(
                            "head",
                            head
                          )
                      }
                      className={[
                        "btn cursor-pointer",

                        creator.head ===
                        head
                          ? "btn-primary"
                          : "btn-outline text-white hover:text-black",
                      ].join(
                        " "
                      )}
                    >
                      {head}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>


          {/*
           * ==========================================
           * CHARACTER PREVIEW
           * ==========================================
           */}

          <div className="flex items-center justify-center">
            <div className="h-[380px] w-[280px] overflow-hidden rounded-xl border border-white/10 bg-black/20">
              <CharacterPreview
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
    return (
      <Screen
        title="Class"
      >
        <div className="grid grid-cols-3 gap-4">
          <div>
            <button
              type="button"
              className="btn btn-primary cursor-pointer px-8 py-5 w-full"
            >
              Warrior
            </button>
          </div>

          <div className="cursor-not-allowed">
            <button
              type="button"
              disabled
              className="btn pointer-events-none px-8 py-5 w-full"
            >
              Ranger
            </button>
          </div>

          <div className="cursor-not-allowed">
            <button
              type="button"
              disabled
              className="btn pointer-events-none px-8 py-5 w-full"
            >
              Elementalist
            </button>
          </div>
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

      if (!name) {
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
        !creator.gender
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
              gender:
                creator.gender,

              skinTone:
                creator.skinTone,

              bodyType:
                creator.bodyType,

              head:
                creator.head,
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
      <div className="w-96">
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
            !creator.gender ||
            creating
          }
          onClick={
            create
          }
          className="btn btn-success mt-8 w-full cursor-pointer text-lg disabled:cursor-not-allowed"
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
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="w-full max-w-5xl rounded-xl border border-white/10 bg-white/15 p-8">
          <Wizard
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