import { WORLD_SIZE } from "./worldConfig";

// Map coordinates cover the full world, independently of active chunks.
export const WORLD_RADIUS =
  WORLD_SIZE / 2 + 30;
export const DUNGEON_MAP_RADIUS = 130;

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

export const worldToPercent = ({
  x,
  z,
}, radius = WORLD_RADIUS) => {
  const normalizedX =
    (
      x +
      radius
    ) /
    (
      radius *
      2
    );

  /*
   * Positive Z should point north / up.
   */
  const normalizedY =
    (
      radius -
      z
    ) /
    (
      radius *
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
