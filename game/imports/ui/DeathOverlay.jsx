import React, {
  useEffect,
  useState,
} from "react";

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
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75">
      <div className="text-center text-white">
        <div className="text-5xl font-bold">
          You died
        </div>

        <div className="mt-3 text-lg text-gray-300">
          Respawning in{" "}
          {secondsLeft.toFixed(1)}s
        </div>
      </div>
    </div>
  );
};