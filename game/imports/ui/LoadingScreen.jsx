import React from "react";

import {
  useLoadingStore,
} from "./stores/useLoadingStore";

export const LoadingScreen =
  () => {
    const visible =
      useLoadingStore(
        (state) =>
          state.visible
      );

    const progress =
      useLoadingStore(
        (state) =>
          state.progress
      );

    if (!visible) {
      return null;
    }

    return (
      <div className="absolute inset-0 z-[10001] flex items-center justify-center bg-black">
        <div className="w-80">
          <div className="mb-3 text-center text-sm text-white">
            Loading Game...
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full bg-white transition-[width] duration-700 ease-out"
              style={{
                width:
                  `${progress}%`,
              }}
            />
          </div>

          <div className="mt-2 text-center text-xs text-white/60">
            {Math.round(
              progress
            )}
            %
          </div>
        </div>
      </div>
    );
  };