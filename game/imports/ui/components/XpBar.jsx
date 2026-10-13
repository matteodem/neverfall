import { FantasyHudCard, FantasyMeter } from "./fantasy/FantasyUI";
import React from "react";

import {
  getMaxXp,
  MAX_LEVEL,
} from "../../game/xp";

import {
  usePlayerProgressStore,
} from "../stores/usePlayerProgressStore";

export const XpBar = () => {
  const currentLevel =
    usePlayerProgressStore(
      (state) =>
        state.currentLevel
    );

  const currentXp =
    usePlayerProgressStore(
      (state) =>
        state.currentXp
    );

  const maxXp =
    getMaxXp(
      currentLevel
    );

  const isMaxLevel =
    currentLevel >=
    MAX_LEVEL;

  const percentage =
    isMaxLevel
      ? 100
      : Math.max(
          0,
          Math.min(
            100,
            (
              currentXp /
              maxXp
            ) *
              100
          )
        );

  return (
    <FantasyHudCard className="fantasy-resource w-72">
      <div className="mb-1 flex justify-between gap-2 text-xs">
        <span>
          Level{" "}
          {currentLevel}
        </span>

        <span>
          {isMaxLevel
            ? `Max Level`
            : `${currentXp} / ${maxXp} XP`}
        </span>
      </div>

      <FantasyMeter value={isMaxLevel ? 1 : currentXp} max={isMaxLevel ? 1 : maxXp} percentage={percentage}
        label="Experience" tone="magic" className="h-3" />
    </FantasyHudCard>
  );
};
