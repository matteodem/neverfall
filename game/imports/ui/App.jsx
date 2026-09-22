import {
  Meteor,
} from "meteor/meteor";

import React, {
  useEffect,
  useState,
} from "react";

import {
  useSubscribe,
  useTracker,
} from "meteor/react-meteor-data";

import {
  ensureGuestUser,
} from "../auth/guest";

import {
  usePlayerProgressStore,
} from "./stores/usePlayerProgressStore";

import {
  CharacterScreens,
} from "./CharacterScreens";

import {
  Characters,
} from "../api/characters/characters";

import {
  Game,
} from "./Game";

import {
  Hud,
} from "./Hud";

import {
  LoadingScreen,
} from "./LoadingScreen";

export const App = () => {
  const [
    playerHealth,
    setPlayerHealth,
  ] = useState({
    health: 100,
    maxHealth: 100,
  });

  const [
    healCooldownUntil,
    setHealCooldownUntil,
  ] = useState(
    0
  );

  const [
    authReady,
    setAuthReady,
  ] = useState(
    false
  );

  const setProgress =
    usePlayerProgressStore(
      (state) =>
        state.setProgress
    );

  /*
   * =====================================================
   * GUEST AUTH
   * =====================================================
   */

  useEffect(
    () => {
      let cancelled =
        false;

      const initialize =
        async () => {
          try {
            await ensureGuestUser();

            if (
              cancelled
            ) {
              return;
            }

            setAuthReady(
              true
            );
          } catch (
            error
          ) {
            console.error(
              "[Auth]",
              error
            );
          }
        };

      initialize();

      return () => {
        cancelled =
          true;
      };
    },
    []
  );

  /*
   * =====================================================
   * CHARACTER SUBSCRIPTION
   * =====================================================
   */

  const charactersLoading =
    useSubscribe(
      "characters.mine"
    );

  const user =
    useTracker(
      () =>
        Meteor.user(),
      []
    );

  const characters =
    useTracker(
      () =>
        Characters.find(
          {},
          {
            sort: {
              lastPlayedAt:
                -1,
            },
          }
        ).fetch(),
      []
    );

  /*
   * =====================================================
   * CURRENT CHARACTER
   * =====================================================
   */

  const currentCharacterId =
    user?.profile
      ?.currentCharacterId ||
    "";

  const currentCharacter =
    characters.find(
      (
        character
      ) =>
        character._id ===
        currentCharacterId
    );

  useEffect(
    () => {
      if (
        !currentCharacter
      ) {
        return;
      }

      setProgress({
        currentLevel:
          currentCharacter.currentLevel ??
          1,

        currentXp:
          currentCharacter.currentXp ??
          0,
      });
    },
    [
      currentCharacter
        ?.currentLevel,

      currentCharacter
        ?.currentXp,

      setProgress,
    ]
  );

  /*
   * =====================================================
   * INITIAL LOADING
   * =====================================================
   */

  if (
    !authReady ||
    !user ||
    charactersLoading()
  ) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        Initializing...
      </div>
    );
  }

  /*
   * =====================================================
   * CHARACTER SCREENS
   * =====================================================
   *
   * Not currently playing:
   *
   * 0 characters
   * → Character Creator
   *
   * 1+ characters
   * → Character Overview
   */

  if (
    !user.profile
      ?.isPlaying
  ) {
    return (
      <CharacterScreens
        characters={
          characters
        }

        currentCharacterId={
          currentCharacterId
        }

        hasCharacters={
          characters.length >
          0
        }

        appearance={
          user?.profile
            ?.appearance
        }
      />
    );
  }

  /*
   * =====================================================
   * INVALID PLAYING STATE
   * =====================================================
   *
   * This should normally not happen,
   * but prevents mounting Game without
   * a valid character.
   */

  if (
    !currentCharacter
  ) {
    return (
      <CharacterScreens
        characters={
          characters
        }

        currentCharacterId={
          currentCharacterId
        }

        hasCharacters={
          characters.length >
          0
        }

        appearance={
          user?.profile
            ?.appearance
        }
      />
    );
  }

  /*
   * =====================================================
   * GAME
   * =====================================================
   */

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <Game
        character={
          currentCharacter
        }

        appearance={
          user.profile
            ?.appearance
        }

        setPlayerHealth={
          setPlayerHealth
        }

        setHealCooldownUntil={
          setHealCooldownUntil
        }
      />

      <Hud
        playerHealth={
          playerHealth
        }

        healCooldownUntil={
          healCooldownUntil
        }
      />

      <LoadingScreen />
    </div>
  );
};