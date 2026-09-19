import React, { useState } from "react";
import { Game } from "./Game";
import { Hud } from "./Hud";

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

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <Game
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
    </div>
  );
};