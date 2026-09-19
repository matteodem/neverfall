import React, { useState } from "react";
import { Game } from "./Game";
import { Hud } from "./Hud";

export const App = () => {
  const [
    enemyHp,
    setEnemyHp,
  ] = useState(100);

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
        enemyHp={enemyHp}
        setEnemyHp={setEnemyHp}
        setPlayerHealth={setPlayerHealth}
      />

      <Hud
        enemyHp={enemyHp}
        playerHealth={playerHealth}
      />
    </div>
  );
};