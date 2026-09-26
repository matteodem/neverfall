import { getEquipmentStats } from "./equipment";
import { getClassConfig } from "./classConfig";

const HEALTH_PER_LEVEL =
  25;


const DAMAGE_PER_LEVEL =
  10;


const BASE_HEAL_AMOUNT =
  40;

const HEAL_PER_LEVEL =
  15;


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
  level,
  equipment,
  gameClass = "warrior"
) => {
  const classConfig = getClassConfig(gameClass);
  const normalizedLevel =
    normalizeLevel(
      level
    );


  const levelsGained =
    normalizedLevel -
    1;

  const equipmentStats = getEquipmentStats(equipment);


  return {
    maxHealth:
      classConfig.maxHealth +
      levelsGained *
        HEALTH_PER_LEVEL +
      equipmentStats.maxHealth,

    damage:
      classConfig.attackDamage +
      levelsGained *
        DAMAGE_PER_LEVEL +
      equipmentStats.attackDamage,

    healAmount:
      BASE_HEAL_AMOUNT +
      levelsGained *
        HEAL_PER_LEVEL,
  };
};
