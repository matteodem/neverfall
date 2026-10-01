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

    const error =
      useLoadingStore(
        (state) => state.error
      );
    const mode = useLoadingStore((state) => state.mode);

    if (!visible) {
      return null;
    }

    return (
      <div className="absolute inset-0 z-[30000] flex items-center justify-center bg-black">
        <div className="w-80">
          <div className="mb-3 text-center text-sm text-white">
            {error || (mode === "destination" ? "Loading destination..." : "Loading Game...")}
          </div>

          {error ? (
            <button
              type="button"
              className="btn btn-sm btn-outline mt-4 w-full text-white"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          ) : mode === "destination" ? (
            <div className="flex justify-center"><span className="loading loading-spinner text-white" /></div>
          ) : (
            <>

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
            </>
          )}
        </div>
      </div>
    );
  };
