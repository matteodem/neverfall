export const MAX_LEVEL =
  20;

const BASE_XP =
  100;

const XP_EXPONENT =
  1.5;

export const getMaxXp = (
  level
) => {
  const normalizedLevel =
    Math.max(
      1,
      Math.floor(
        Number(level) || 1
      )
    );

  if (
    normalizedLevel >=
    MAX_LEVEL
  ) {
    return 0;
  }

  return Math.round(
    BASE_XP *
    Math.pow(
      normalizedLevel,
      XP_EXPONENT
    )
  );
};

export const addXpToProgress = ({
  currentLevel,
  currentXp,
  gainedXp,
}) => {
  let level =
    Math.max(
      1,
      currentLevel || 1
    );

  let xp =
    Math.max(
      0,
      currentXp || 0
    ) +
    Math.max(
      0,
      gainedXp || 0
    );

  while (
    level < MAX_LEVEL
  ) {
    const maxXp =
      getMaxXp(
        level
      );

    if (
      xp <
      maxXp
    ) {
      break;
    }

    xp -=
      maxXp;

    level +=
      1;
  }

  if (
    level >= MAX_LEVEL
  ) {
    level =
      MAX_LEVEL;

    xp = 0;
  }

  return {
    currentLevel:
      level,

    currentXp:
      xp,
  };
};