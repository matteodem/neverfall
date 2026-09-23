import React from "react";

import {
  useCombatStore,
} from "../stores/useCombatStore";


export const CombatBorder =
  () => {
    const isInCombat =
      useCombatStore(
        (
          state
        ) =>
          state.isInCombat
      );


    return (
      <div
        className={`
          pointer-events-none
          fixed
          inset-0
          z-[9999]

          border-[18px]
          border-red-600/70

          transition-opacity
          duration-300
          ease-out

          ${
            isInCombat
              ? "opacity-100"
              : "opacity-0"
          }
        `}
        style={{
          boxShadow:
            "inset 0 0 35px rgba(220,38,38,0.85), inset 0 0 90px rgba(220,38,38,0.55), inset 0 0 160px rgba(127,29,29,0.35)",
        }}
      />
    );
  };