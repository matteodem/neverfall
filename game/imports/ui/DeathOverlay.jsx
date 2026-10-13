import React, {
  useEffect,
  useState,
} from "react";
import { FantasyBadge, FantasyPanel, FantasySectionHeader } from "./components/fantasy/FantasyUI";

const RESPAWN_SECONDS = 2;

export const DeathOverlay = () => {
  const [
    secondsLeft,
    setSecondsLeft,
  ] = useState(
    RESPAWN_SECONDS
  );

  useEffect(() => {
    const startedAt =
      Date.now();

    const interval =
      setInterval(
        () => {
          const elapsed =
            (
              Date.now() -
              startedAt
            ) /
            1000;

          const remaining =
            Math.max(
              0,
              RESPAWN_SECONDS -
                elapsed
            );

          setSecondsLeft(
            remaining
          );
        },
        50
      );

    return () => {
      clearInterval(
        interval
      );
    };
  }, []);

  return (
    <div className="fantasy-death-backdrop absolute inset-0 z-[10010] flex items-center justify-center p-3">
      <FantasyPanel className="fantasy-death-panel max-w-full p-6 text-center">
        <FantasySectionHeader as="h2" className="mt-0 text-3xl">
          You died
        </FantasySectionHeader>

        <div className="fantasy-muted mt-3 text-lg">
          Respawning in{" "}
          <FantasyBadge tone="warning">{secondsLeft.toFixed(1)}s</FantasyBadge>
        </div>
      </FantasyPanel>
    </div>
  );
};
