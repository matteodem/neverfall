import React, {
  useEffect,
  useState,
} from "react";

import {
  bootstrapPlayer,
} from "../auth/bootstrapPlayer";

import { Game } from "./Game";
import { Hud } from "./Hud";
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
    character,
    setCharacter,
  ] = useState(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(
    true
  );

  useEffect(
    () => {
      let cancelled =
        false;

      const bootstrap =
        async () => {
          try {
            const character =
              await bootstrapPlayer();

            if (cancelled) {
              return;
            }

            setCharacter(
              character
            );
          } catch (
            error
          ) {
            console.error(
              "[Bootstrap]",
              error
            );
          } finally {
            if (!cancelled) {
              setLoading(
                false
              );
            }
          }
        };

      bootstrap();

      return () => {
        cancelled =
          true;
      };
    },
    []
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        Initializing...
      </div>
    );
  }

  if (!character) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-red-400">
        Failed to load character.
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <Game
        character={
          character
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