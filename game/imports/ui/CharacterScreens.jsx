import React from "react";

import {
  CharacterCreator,
} from "./CharacterCreator";

import {
  CharacterOverview,
} from "./CharacterOverview";

import {
  useCharacterStore,
} from "./stores/useCharacterStore";


export const CharacterScreens = ({
  characters,
  currentCharacterId,
  hasCharacters,
}) => {
  const screen =
    useCharacterStore(
      (state) =>
        state.screen
    );

  if (!hasCharacters) {
    return (
      <CharacterCreator />
    );
  }

  if (
    screen ===
    "creator"
  ) {
    return (
      <CharacterCreator />
    );
  }

  return (
    <CharacterOverview
      characters={
        characters
      }
      currentCharacterId={
        currentCharacterId
      }
    />
  );
};