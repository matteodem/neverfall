import React, { useState } from "react";
import { Game } from "./Game";
import { Hud } from "./Hud";

export const App = () => {
  const [enemyHp, setEnemyHp] = useState(100);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <Game
        enemyHp={enemyHp}
        setEnemyHp={setEnemyHp}
      />

      <Hud enemyHp={enemyHp} />
    </div>
  );
};