import { FOREST_SIZE } from "./enemyConfig";

/*
 * Make the minimap a bit larger than
 * the forest so wolves / giant still fit.
 */
export const WORLD_RADIUS =
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

export const worldToPercent = ({
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

