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
      <div
        className={`
          pointer-events-none
          fixed
          inset-0
          z-[11000]

          flex
          items-center
          justify-center

          transition-opacity
          duration-500

          ${
            visible
              ? "opacity-100"
              : "opacity-0"
          }
        `}
      >
        <div
          className="
            rounded-xl
            border
            border-yellow-300/60

            bg-black/60

            px-12
            py-8

            text-center

            shadow-[0_0_60px_rgba(250,204,21,0.45)]

            backdrop-blur-sm
          "
        >
          <div
            className="
              text-5xl
              font-bold
              tracking-wide
              text-yellow-300
            "
          >
            LEVEL UP!
          </div>

          <div
            className="
              mt-3
              text-2xl
              font-semibold
              text-white
            "
          >
            Level {level}
          </div>
        </div>
      </div>
    );
  };