import { useMobileDevice } from "./hooks/useMobileDevice";
import { useHudStore } from "./stores/useHudStore";
import { PortraitOverlay } from "./components/PortraitOverlay";
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
import { OnboardingAutoStart, OnboardingTour } from "./OnboardingTour";
import { CharacterAccountFlow, useCharacterAccountFlow } from "./CharacterAccountFlow";


export const App = () => (
  <OnboardingTour>
    <CharacterAccountFlow>
      <AppContent />
    </CharacterAccountFlow>
    <PortraitOverlay />
  </OnboardingTour>
);

const AppContent = () => {
  const { authBusy } = useCharacterAccountFlow();
  const { mobile, portrait } = useMobileDevice();
  const uiVisible = useHudStore((state) => state.uiVisible);
  const [
    playerHealth,
    setPlayerHealth,
  ] = useState({
    health:
      100,

    maxHealth:
      100,
  });


  const [
    healCooldownUntil,
    setHealCooldownUntil,
  ] = useState(
    0
  );

  const [mounted, setMounted] = useState(false);
  const [inCombat, setInCombat] = useState(false);
  const [potionBuffs, setPotionBuffs] = useState({ speedPotionUntil: 0, powerPotionUntil: 0 });


  const [
    authReady,
    setAuthReady,
  ] = useState(
    false
  );


  /*
   * =====================================================
   * PLAYER PROGRESS
   * =====================================================
   */

  const currentLevel =
    usePlayerProgressStore(
      (
        state
      ) =>
        state.currentLevel
    );


  const setProgress =
    usePlayerProgressStore(
      (
        state
      ) =>
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
          { userId: Meteor.userId() },
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


  /*
   * Keep Zustand progress
   * synchronized with the
   * current character.
   */
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
    authBusy ||
    !authReady ||
    !user ||
    charactersLoading()
  ) {
    return (
      <div
        className="
          flex
          h-screen

          items-center
          justify-center

          bg-black
          text-white
        "
      >
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
      />
    );
  }


  /*
   * =====================================================
   * INVALID PLAYING STATE
   * =====================================================
   *
   * Prevent Game from mounting
   * without a valid character.
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
      />
    );
  }


  /*
   * =====================================================
   * GAME
   * =====================================================
   */

  return (
    <div
      className={`relative h-screen w-screen overflow-hidden bg-black ${mobile ? "mobile-game" : ""} ${mobile && portrait ? "mobile-portrait" : ""}`}
    >
      <Game
        character={
          currentCharacter
        }
        setPlayerHealth={
          setPlayerHealth
        }
        setHealCooldownUntil={
          setHealCooldownUntil
        }
        setMountedState={setMounted}
        setInCombatState={setInCombat}
        setPotionBuffs={setPotionBuffs}
      />


      <div className={uiVisible ? "" : "hidden"}>
        <Hud
          showInitialObjectives={Boolean(currentCharacter && !currentCharacter.adventureGuide?.openedMap)}
          gameClass={currentCharacter?.gameClass}
          species={currentCharacter?.species}
          talents={currentCharacter?.talents}
          currentLevel={
            currentLevel
          }
          equipment={currentCharacter?.equipment}
          playerHealth={
            playerHealth
          }
          potionBuffs={potionBuffs}
          healCooldownUntil={
            healCooldownUntil
          }
          mounted={mounted}
          inCombat={inCombat}
        />
      </div>


      <LoadingScreen />
      <OnboardingAutoStart completed={user.profile?.onboardingCompleted === true} />
    </div>
  );
};
