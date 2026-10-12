import { FantasyNotice, FantasySectionHeader } from "./fantasy/FantasyUI";
import React from "react";

import {
  useLevelUpStore,
} from "../stores/useLevelUpStore";


export const LevelUpOverlay =
  () => {
    const visible =
      useLevelUpStore(
        (
          state
        ) =>
          state.visible
      );


    const level =
      useLevelUpStore(
        (
          state
        ) =>
          state.level
      );


    return (
      <div className={`fantasy-toast-slot transition-opacity duration-500 ${visible ? "opacity-100" : "invisible absolute opacity-0"}`}
        aria-hidden={!visible}>
        <FantasyNotice tone="magic" className="w-full max-w-xs text-center">
          <FantasySectionHeader className="fantasy-hud-heading">Level Up!</FantasySectionHeader>
          <p className="mt-1 text-xl font-semibold">Level {level}</p>
        </FantasyNotice>
      </div>
    );
  };
