import React from "react";
import { FantasyButton, FantasyMeter, FantasyPanel, FantasySectionHeader } from "./components/fantasy/FantasyUI";

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
      <div className="fantasy-ui fantasy-loading-screen absolute inset-0 z-[30000] flex items-center justify-center p-4">
        <FantasyPanel className="fantasy-loading-card fantasy-section fantasy-stack">
          <FantasySectionHeader as="p" className={`fantasy-heading-inline text-center ${error ? "fantasy-danger" : ""}`}>
            {error || (mode === "destination" ? "Loading destination..." : "Loading Game...")}
          </FantasySectionHeader>

          {error ? (
            <FantasyButton
              variant="secondary"
              className="w-full"
              onClick={() => window.location.reload()}
            >
              Try again
            </FantasyButton>
          ) : mode === "destination" ? (
            <div className="flex justify-center"><span className="loading loading-spinner fantasy-accent" /></div>
          ) : (
            <>
              <FantasyMeter className="fantasy-loading-meter" value={progress} max={100}
                percentage={progress} label="Game loading progress" tone="magic" />
              <div className="fantasy-muted text-center text-xs">
                {Math.round(progress)}%
              </div>
            </>
          )}
        </FantasyPanel>
      </div>
    );
  };
