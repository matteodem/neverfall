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
      if (isFirstStep) {
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

const GenderStep = () => {
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

  return (
    <Screen title="Gender">
      <div className="flex gap-4">
        <button
          type="button"
          disabled
          className="btn btn-disabled cursor-not-allowed px-8 py-5"
        >
          Male
        </button>

        <button
          type="button"
          onClick={
            () =>
              setCreatorField(
                "gender",
                "female"
              )
          }
          className={[
            "btn cursor-pointer px-8 py-5",
            creator.gender ===
            "female"
              ? "btn-primary"
              : "btn-outline",
          ].join(
            " "
          )}
        >
          Female
        </button>
      </div>
    </Screen>
  );
};

const AppearanceStep =
  () => {
    return (
      <Screen title="Appearance">
        <div className="rounded border border-white/10 bg-white/5 px-8 py-6 text-white/50">
          Work In Progress
        </div>
      </Screen>
    );
  };

const SpeciesStep =
  () => {
    return (
      <Screen title="Species">
        <button
          type="button"
          className="btn btn-primary cursor-pointer px-8 py-5"
        >
          Human
        </button>
      </Screen>
    );
  };

const ClassStep = () => {
  return (
    <Screen title="Class">
      <div className="grid grid-cols-3 gap-4">
        <button
          type="button"
          className="btn btn-primary cursor-pointer px-8 py-5"
        >
          Warrior
        </button>

        <button
          type="button"
          disabled
          className="btn btn-disabled cursor-not-allowed px-8 py-5"
        >
          Ranger
        </button>

        <button
          type="button"
          disabled
          className="btn btn-disabled cursor-not-allowed px-8 py-5"
        >
          Elementalist
        </button>
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

            gender:
              creator.gender,

            species:
              creator.species,

            gameClass:
              creator.gameClass,
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
    <Screen title="Name">
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
        <div className="w-full max-w-4xl rounded-xl border border-white/10 bg-white/5 p-8">
          <Wizard
            footer={
              <Navigation />
            }
          >
            <GenderStep />

            <AppearanceStep />

            <SpeciesStep />

            <ClassStep />

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