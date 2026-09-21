import React from "react";

import {
  Meteor,
} from "meteor/meteor";

import {
  CharacterPreview,
} from "./CharacterPreview";

import {
  useCharacterStore,
} from "./stores/useCharacterStore";

export const CharacterOverview = ({
  characters,
  currentCharacterId,
}) => {
  const setScreen =
    useCharacterStore(
      (state) =>
        state.setScreen
    );

  const selected =
    characters.find(
      (character) =>
        character._id ===
        currentCharacterId
    );

  const selectCharacter =
    async (
      characterId
    ) => {
      await Meteor.callAsync(
        "characters.select",
        characterId
      );
    };

  const deleteCharacter =
    async () => {
      if (!selected) {
        return;
      }

      await Meteor.callAsync(
        "characters.remove",
        selected._id
      );
    };

  const joinWorld =
    async () => {
      await Meteor.callAsync(
        "characters.joinCurrent"
      );
    };

  return (
    <div className="relative flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-sky-900 text-white">
      {/*
       * =================================================
       * CHARACTER LIST
       * =================================================
       */}

      <aside className="z-10 w-80 border-r border-white/10 bg-black/20 p-5 backdrop-blur-md">
        <h1 className="mb-5 text-2xl font-bold">
          Characters
        </h1>

        <div className="space-y-3">
          {characters.map(
            (
              character
            ) => {
              const active =
                character._id ===
                currentCharacterId;

              return (
                <button
                  key={
                    character._id
                  }
                  type="button"
                  onClick={
                    () =>
                      selectCharacter(
                        character._id
                      )
                  }
                  className={[
                    "btn h-auto min-h-0 w-full cursor-pointer justify-start px-4 py-3 text-left normal-case",
                    active
                      ? "btn-primary"
                      : "btn-ghost bg-black/20 hover:bg-white/10",
                  ].join(
                    " "
                  )}
                >
                  <div className="w-full">
                    <div className="text-base font-bold">
                      {
                        character.name
                      }
                    </div>

                    <div className="mt-1 text-xs font-normal opacity-70">
                      {
                        character.species
                      }

                      {" · "}

                      {
                        character.gameClass
                      }

                      {" · Level "}

                      {
                        character.currentLevel
                      }
                    </div>
                  </div>
                </button>
              );
            }
          )}
        </div>

        {/*
         * =================================================
         * SIDEBAR ACTIONS
         * =================================================
         */}

        <div className="mt-6 space-y-2">
          <button
            type="button"
            onClick={
              () =>
                setScreen(
                  "creator"
                )
            }
            className="btn btn-primary w-full"
          >
            Create Character
          </button>

          {selected && (
            <button
              type="button"
              onClick={
                deleteCharacter
              }
              className="btn btn-error btn-outline w-full"
            >
              Delete
            </button>
          )}
        </div>
      </aside>

      {/*
       * =================================================
       * CHARACTER PREVIEW
       * =================================================
       */}

      <main className="relative flex flex-1 flex-col">
        <div className="flex-1">
          {selected && (
            <CharacterPreview
              assetFile={
                selected.assetFile
              }
            />
          )}
        </div>

        {/*
         * =================================================
         * CHARACTER INFO
         * =================================================
         */}

        {selected && (
          <div className="pointer-events-none absolute bottom-28 left-1/2 -translate-x-1/2 text-center">
            <div className="text-2xl font-bold drop-shadow-lg">
              {selected.name}
            </div>

            <div className="mt-1 text-sm text-blue-100/70">
              {selected.species}
              {" · "}
              {selected.gameClass}
              {" · Level "}
              {selected.currentLevel}
            </div>
          </div>
        )}

        {/*
         * =================================================
         * JOIN WORLD
         * =================================================
         */}

        {selected && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <button
              type="button"
              onClick={
                joinWorld
              }
              className="btn btn-primary btn-lg min-w-64 text-lg shadow-xl"
            >
              Join World
            </button>
          </div>
        )}
      </main>
    </div>
  );
};