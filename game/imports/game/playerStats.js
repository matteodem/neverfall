import { getEquipmentStats } from "./equipment";
import { getClassConfig } from "./classConfig";
import { getClassProgressionStats } from "./classProgression";
import { getSpecies } from "./species";

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
  gameClass = "warrior",
  species = "human"
) => {
  const classConfig = getClassConfig(gameClass);
  const speciesConfig = getSpecies(species);
  const normalizedLevel =
    normalizeLevel(
      level
    );


  const levelsGained =
    normalizedLevel -
    1;

  const equipmentStats = getEquipmentStats(equipment);
  const progression = getClassProgressionStats(gameClass, normalizedLevel);


  return {
    xpGainMultiplier: 1 + equipmentStats.xpGain,
    movementSpeedMultiplier: (1 + equipmentStats.movementSpeed + progression.movementSpeed) * speciesConfig.movementSpeedMultiplier,
    aoeDamageMultiplier: 1 + progression.aoeDamage,
    maxHealth:
      classConfig.maxHealth +
      levelsGained *
        HEALTH_PER_LEVEL +
      equipmentStats.maxHealth + progression.maxHealth,

    damage:
      (classConfig.attackDamage +
      levelsGained *
        DAMAGE_PER_LEVEL +
      equipmentStats.attackDamage) * (1 + progression.damage) * speciesConfig.damageMultiplier,

    healAmount:
      BASE_HEAL_AMOUNT +
      levelsGained *
        HEAL_PER_LEVEL,
  };
};
