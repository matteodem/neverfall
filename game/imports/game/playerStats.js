const BASE_MAX_HEALTH =
  100;

const HEALTH_PER_LEVEL =
  25;


const BASE_DAMAGE =
  25;

const DAMAGE_PER_LEVEL =
  10;


const BASE_HEAL_AMOUNT =
  40;

const HEAL_PER_LEVEL =
  20;


const normalizeLevel = (
  level
) => {
  if (
    !Number.isFinite(
      level
    )
  ) {
    return 1;
  }


  return Math.max(
    1,
    Math.floor(
      level
    )
  );
};


export const getPlayerStats = (
  level
) => {
  const normalizedLevel =
    normalizeLevel(
      level
    );


  const levelsGained =
    normalizedLevel -
    1;


  return {
    maxHealth:
      BASE_MAX_HEALTH +
      levelsGained *
        HEALTH_PER_LEVEL,

    damage:
      BASE_DAMAGE +
      levelsGained *
        DAMAGE_PER_LEVEL,

    healAmount:
      BASE_HEAL_AMOUNT +
      levelsGained *
        HEAL_PER_LEVEL,
  };
};