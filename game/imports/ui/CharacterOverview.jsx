import React, {
  useRef,
} from "react";

import {
  Meteor,
} from "meteor/meteor";

import startCase from "lodash.startcase";

import {
  CharacterPreview,
} from "./CharacterPreview";

import {
  useCharacterStore,
} from "./stores/useCharacterStore";

const MAX_CHARACTERS =
  5;

export const CharacterOverview = ({
  characters,
  currentCharacterId,
}) => {
  const canCreateCharacter =
    characters.length <
    MAX_CHARACTERS;

  const deleteModalRef =
    useRef(
      null
    );


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


  const openDeleteModal =
    () => {
      if (!selected) {
        return;
      }

      deleteModalRef.current
        ?.showModal();
    };


  const closeDeleteModal =
    () => {
      deleteModalRef.current
        ?.close();
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

      closeDeleteModal();
    };


  const joinWorld =
    async () => {
      await Meteor.callAsync(
        "characters.joinCurrent"
      );
    };


  return (
    <div className="relative flex h-screen overflow-hidden bg-gradient-to-br from-zinc-800 via-slate-700 to-slate-500 text-white">
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
                      : "btn-outline text-white hover:text-black",
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
                        startCase(
                          character.species
                        )
                      }

                      {" · "}

                      {
                        startCase(
                          character.gameClass
                        )
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

        <div className="mt-6 space-y-2">
          <div
            className={
              canCreateCharacter
                ? ""
                : "cursor-not-allowed"
            }
          >
            <div className="mb-2 text-center text-xs text-white/50">
              {characters.length}
              {" / "}
              {MAX_CHARACTERS}
              {" characters"}
            </div>

            <button
              type="button"
              disabled={
                !canCreateCharacter
              }
              onClick={
                () =>
                  setScreen(
                    "creator"
                  )
              }
              className={[
                "btn btn-secondary w-full",

                canCreateCharacter
                  ? "cursor-pointer"
                  : "pointer-events-none opacity-50 btn-outline text-white hover:text-black",
              ].join(
                " "
              )}
            >
              Create Character
            </button>
          </div>

          {selected && (
            <button
              type="button"
              onClick={
                openDeleteModal
              }
              className="btn btn-error btn-outline w-full cursor-pointer"
            >
              Delete
            </button>
          )}
        </div>
      </aside>


      <main className="relative flex flex-1 flex-col">
        <div className="flex-1">
          {selected && (
            <CharacterPreview
              gameClass={selected.gameClass}
              appearance={
                selected.appearance
              }
            />
          )}
        </div>


        {selected && (
          <div className="pointer-events-none absolute bottom-28 left-1/2 -translate-x-1/2 text-center">
            <div className="text-2xl font-bold drop-shadow-lg">
              {
                selected.name
              }
            </div>

            <div className="mt-1 text-sm text-blue-100/70">
              {
                startCase(
                  selected.species
                )
              }

              {" · "}

              {
                startCase(
                  selected.gameClass
                )
              }

              {" · Level "}

              {
                selected.currentLevel
              }
            </div>
          </div>
        )}


        {selected && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <button
              type="button"
              onClick={
                joinWorld
              }
              className="btn btn-primary btn-lg min-w-64 cursor-pointer text-lg shadow-xl"
            >
              Join World
            </button>
          </div>
        )}
      </main>


      {/*
       * DELETE CONFIRMATION MODAL
       */}

      <dialog
        ref={
          deleteModalRef
        }
        className="modal"
      >
        <div className="modal-box text-black">
          <h3 className="text-lg font-bold">
            Delete character?
          </h3>

          <p className="py-4">
            Are you sure you want to delete{" "}

            <span className="font-bold">
              {
                selected?.name
              }
            </span>

            ?
          </p>

          <p className="text-sm opacity-60">
            This action cannot be undone.
          </p>

          <div className="modal-action">
            <button
              type="button"
              onClick={
                closeDeleteModal
              }
              className="btn cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={
                deleteCharacter
              }
              className="btn btn-error cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>

        <form
          method="dialog"
          className="modal-backdrop"
        >
          <button>
            close
          </button>
        </form>
      </dialog>
    </div>
  );
};
