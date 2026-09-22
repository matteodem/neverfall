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
    <div className="w-72 rounded bg-black/70 p-2 text-white">
      <div className="mb-1 flex justify-between text-xs">
        <span>
          Level{" "}
          {currentLevel}
        </span>

        <span>
          {isMaxLevel
            ? `MAX LEVEL`
            : `${currentXp} / ${maxXp} XP`}
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded bg-gray-700">
        <div
          className="h-full bg-blue-500 transition-[width] duration-300 ease-out"
          style={{
            width:
              `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
};