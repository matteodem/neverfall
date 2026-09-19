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

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <Game
        setPlayerHealth={setPlayerHealth}
      />

      <Hud
        playerHealth={playerHealth}
      />
    </div>
  );
};