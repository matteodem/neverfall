import React, {
  useRef,
} from "react";

import {
  Meteor,
} from "meteor/meteor";

import startCase from "lodash.startcase";
import { useMobileDevice } from "./hooks/useMobileDevice";
import { MAX_CHARACTERS } from "../api/characters/characters";
import { CharacterAuthButton } from "./CharacterAccountFlow";
import { resolveAmirEquipment } from "../game/character/amir/equipmentAppearance";
import { FantasyBadge, FantasyButton, FantasyModalFrame, FantasyPanel, FantasySectionHeader } from "./components/fantasy/FantasyUI";

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
  const { mobile } = useMobileDevice();
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
    <div className={`fantasy-ui fantasy-character-overview relative flex h-screen overflow-hidden ${mobile ? "character-overview-mobile" : ""}`}>
      <FantasyPanel as="aside" className="character-sidebar z-10 flex w-80 flex-col p-5">
        <FantasySectionHeader as="h1" className="fantasy-heading-inline !mb-5 text-2xl">
          Characters
        </FantasySectionHeader>

        <div className="character-list space-y-3">
          {characters.map(
            (
              character
            ) => {
              const active =
                character._id ===
                currentCharacterId;

              return (
                <FantasyButton
                  variant={active ? "primary" : "secondary"}
                  aria-pressed={active}
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
                  className="fantasy-choice h-auto min-h-0 w-full cursor-pointer justify-start px-4 py-3 normal-case"
                >
                  <div className="w-full">
                    <div className="text-base font-bold">
                      {
                        character.name
                      }
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-1 text-xs font-normal fantasy-muted">
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

                      <FantasyBadge>Level {character.currentLevel}</FantasyBadge>
                    </div>
                  </div>
                </FantasyButton>
              );
            }
          )}
        </div>

        <div className="character-actions mt-6 space-y-2">
          <div
            className={
              canCreateCharacter
                ? ""
                : "cursor-not-allowed"
            }
          >
            <div className="mb-2 text-center text-xs fantasy-muted">
              {characters.length}
              {" / "}
              {MAX_CHARACTERS}
              {" characters"}
            </div>

            <FantasyButton
              variant="secondary"
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
              className="w-full"
            >
              Create Character
            </FantasyButton>
          </div>

          {selected && (
            <FantasyButton
              variant="danger"
              type="button"
              onClick={
                openDeleteModal
              }
              className="w-full"
            >
              Delete
            </FantasyButton>
          )}
        </div>
        <div className="mt-auto pt-4">
          <CharacterAuthButton />
        </div>
      </FantasyPanel>


      <main className="relative flex min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-1">
          {selected && (
            <CharacterPreview
              gameClass={selected.gameClass}
              appearance={
                resolveAmirEquipment(selected.appearance, selected.gameClass, selected.equipment)
              }
            />
          )}
        </div>


        {selected && (
          <FantasyPanel className="character-details fantasy-section pointer-events-none absolute bottom-28 left-1/2 -translate-x-1/2 text-center">
            <div className="text-2xl font-bold drop-shadow-lg">
              {
                selected.name
              }
            </div>

            <div className="mt-1 text-sm fantasy-muted">
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
          </FantasyPanel>
        )}


        {selected && (
          <div className="character-join absolute bottom-8 left-1/2 -translate-x-1/2">
            <FantasyButton
              type="button"
              onClick={
                joinWorld
              }
              className="btn-lg min-w-64 cursor-pointer text-lg"
            >
              Join World
            </FantasyButton>
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
        className="modal fantasy-dialog"
      >
        <FantasyModalFrame title="Delete character?" onClose={closeDeleteModal} className="modal-box">

          <p className="py-4">
            Are you sure you want to delete{" "}

            <span className="font-bold">
              {
                selected?.name
              }
            </span>

            ?
          </p>

          <p className="text-sm fantasy-muted">
            This action cannot be undone.
          </p>

          <div className="modal-action">
            <FantasyButton
              variant="secondary"
              type="button"
              onClick={
                closeDeleteModal
              }
              className="cursor-pointer"
            >
              Cancel
            </FantasyButton>

            <FantasyButton
              variant="danger"
              type="button"
              onClick={
                deleteCharacter
              }
              className="cursor-pointer"
            >
              Delete
            </FantasyButton>
          </div>
        </FantasyModalFrame>

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
