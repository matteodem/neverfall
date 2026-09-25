import React from "react";

import {
  FOREST_SIZE,
} from "../../game/enemyConfig";

import {
  useMinimapStore,
} from "../stores/useMinimapStore";

const MINIMAP_SIZE =
  220;

/*
 * Make the minimap a bit larger than
 * the forest so wolves / giant still fit.
 */
const WORLD_RADIUS =
  FOREST_SIZE / 2 + 30;

const clamp = (
  value,
  min,
  max
) => {
  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );
};

const worldToPercent = ({
  x,
  z,
}) => {
  const normalizedX =
    (
      x +
      WORLD_RADIUS
    ) /
    (
      WORLD_RADIUS *
      2
    );

  /*
   * Positive Z should point north / up.
   */
  const normalizedY =
    (
      WORLD_RADIUS -
      z
    ) /
    (
      WORLD_RADIUS *
      2
    );

  return {
    left: `${
      clamp(
        normalizedX,
        0,
        1
      ) * 100
    }%`,

    top: `${
      clamp(
        normalizedY,
        0,
        1
      ) * 100
    }%`,
  };
};

const getEnemyColor = (
  type
) => {
  if (
    type === "wolf"
  ) {
    return "#f97316";
  }

  if (
    type ===
    "forestGiant"
  ) {
    return "#a855f7";
  }

  return "#ef4444";
};

const DotMarker = ({
  x,
  z,
  color,
  size = 8,
  className = "",
  outlined = true,
}) => {
  const position =
    worldToPercent({
      x,
      z,
    });

  return (
    <div
      className={[
        `absolute rounded-full ${outlined ? "border-2 border-white shadow-[0_0_5px_rgba(0,0,0,0.95)]" : ""} -translate-x-1/2 -translate-y-1/2`,
        className,
      ].join(" ")}
      style={{
        left:
          position.left,

        top:
          position.top,

        width: size,
        height: size,

        backgroundColor:
          color,
      }}
    />
  );
};

const LocalPlayerMarker = ({
  x,
  z,
  rotationY,
}) => {
  const position =
    worldToPercent({
      x,
      z,
    });

  return (
    <div
      className="absolute z-20 drop-shadow-[0_1px_3px_rgba(0,0,0,1)]"
      style={{
        left:
          position.left,

        top:
          position.top,

        transform:
          `translate(-50%, -50%) rotate(${rotationY}rad)`,
      }}
    >
      <div
        className="
          h-0
          w-0

          border-l-[7px]
          border-r-[7px]
          border-b-[14px]

          border-l-transparent
          border-r-transparent
          border-b-white

          drop-shadow-[0_0_6px_rgba(255,255,255,0.85)]
        "
      />
    </div>
  );
};

const Legend = () => {
  const ITEMS = [
    {
      label:
        "You",
      color:
        "#ffffff",
    },
    {
      label:
        "Players",
      color:
        "#22c55e",
    },
    {
      label:
        "Boars",
      color:
        "#ef4444",
    },
    {
      label:
        "Wolves",
      color:
        "#f97316",
    },
    {
      label:
        "Boss",
      color:
        "#a855f7",
    },
  ];

  return (
    <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] text-white/80">
      {ITEMS.map(
        (item) => (
          <div
            key={
              item.label
            }
            className="flex items-center gap-1"
          >
            <span
                className="h-2 w-2 rounded-full border border-white shadow"
              style={{
                backgroundColor:
                  item.color,
              }}
            />

            <span>
              {
                item.label
              }
            </span>
          </div>
        )
      )}
    </div>
  );
};

export const Minimap =
  () => {
    const localPlayer =
      useMinimapStore(
        (state) =>
          state.localPlayer
      );

    const remotePlayers =
      useMinimapStore(
        (state) =>
          Object.values(
            state.remotePlayers
          )
      );

    const enemies =
      useMinimapStore(
        (state) =>
          Object.values(
            state.enemies
          )
      );

    return (
      <div
        className="
          rounded-3xl
          border
          border-white/15
          bg-black/50
          p-3
          text-white
          backdrop-blur-sm
          shadow-2xl
        "
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold">
            Minimap
          </span>

          <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">
            N
          </span>
        </div>

        <div
          className="
            relative
            overflow-hidden
            rounded-full
            border-4
            border-white/15
            bg-slate-900/80
            shadow-inner
          "
          style={{
            width:
              MINIMAP_SIZE,
            height:
              MINIMAP_SIZE,
          }}
        >
          {/*
           * Background rings / grid
           */}
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.18),rgba(15,23,42,0.95)_70%)]" />

          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/10" />
          <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/10" />

          <div className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
          <div className="absolute left-1/2 top-1/2 h-[38%] w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />

          {/*
           * Camp / center marker
           */}
          <DotMarker
            x={0}
            z={0}
            color="#facc15"
            size={10}
            className="z-10 ring-2 ring-black/30"
          />

          {/*
           * Remote players
           */}
          {remotePlayers.map(
            (
              remote
            ) => (
              <DotMarker
                key={
                  remote.id
                }
                x={
                  remote.x
                }
                z={
                  remote.z
                }
                color="#22c55e"
                size={7}
                className="z-10"
              />
            )
          )}

          {/*
           * Enemies
           */}
          {enemies.map(
            (
              enemy
            ) => (
              <DotMarker
                key={
                  enemy.id
                }
                x={
                  enemy.x
                }
                z={
                  enemy.z
                }
                color={getEnemyColor(
                  enemy.type
                )}
                outlined={false}
                size={
                  enemy.type ===
                  "forestGiant"
                    ? 10
                    : 7
                }
                className="z-10"
              />
            )
          )}

          {/*
           * Local player
           */}
          <LocalPlayerMarker
            x={
              localPlayer.x
            }
            z={
              localPlayer.z
            }
            rotationY={
              localPlayer.rotationY
            }
          />
        </div>

        <Legend />
      </div>
    );
  };
