import { getClassConfig } from "./classConfig";

export const SKILL_CODES = ["Digit1", "Digit2", "Digit3", "Digit4"];
export const HEAL_SKILL = { id: "heal", name: "Heal", icon: "healthCapsule", cooldown: 10000, heal: true };

const CLASS_SKILL_IDS = {
  warrior: ["basicAttack", "heavyStrike", "cleave"],
  ranger: ["arrowShot", "strongArrow", "multiShot"],
  mage: ["fireball", "fireballBurst", "fireNova"],
};

export const getClassSkills = (gameClass) => {
  const config = getClassConfig(gameClass);
  const ids = CLASS_SKILL_IDS[gameClass] || CLASS_SKILL_IDS.warrior;
  const existing = ids.map((id, index) => ({ ...config.skills[SKILL_CODES[index]], id }));
  const extras = gameClass === "ranger" ? [
    { ...config.skills.Digit1, id: "poisonArrow", name: "Poison Arrow", cooldown: 6000, hitStatus: "poison" },
    { id: "haste", name: "Haste", icon: "locationArrow", cooldown: 10000, selfStatus: "speedUp", buff: true },
  ] : gameClass === "mage" ? [
    { ...config.skills.Digit1, id: "frostBolt", name: "Frost Bolt", cooldown: 5000, hitStatus: "slow" },
    { id: "arcaneHaste", name: "Arcane Haste", icon: "locationArrow", cooldown: 10000, selfStatus: "speedUp", buff: true },
  ] : [
    { id: "battleCry", name: "Battle Cry", icon: "sword", cooldown: 10000, selfStatus: "damageUp", buff: true },
    { ...config.skills.Digit3, id: "whirlwind", name: "Whirlwind", damageMultiplier: 1.5, range: 4, cooldown: 8000, hitStatus: undefined },
  ];
  return [...existing, HEAL_SKILL, ...extras];
};

export const getDefaultSkills = (gameClass) => [...(CLASS_SKILL_IDS[gameClass] || CLASS_SKILL_IDS.warrior), "heal"];

export const isValidSkillLoadout = (gameClass, skills) =>
  Array.isArray(skills) && skills.length === 4 && new Set(skills).size === 4 &&
  skills.every((id) => typeof id === "string" && getClassSkills(gameClass).some((skill) => skill.id === id));

export const getEquippedSkills = (gameClass, skills) =>
  isValidSkillLoadout(gameClass, skills) ? [...skills] : getDefaultSkills(gameClass);

export const getPlayerSkills = (player) => getEquippedSkills(player.gameClass,
  SKILL_CODES.map((code, index) => player[`skill${index + 1}`]));

export const getEquippedSkill = (gameClass, code, skills) => {
  const id = getEquippedSkills(gameClass, skills)[SKILL_CODES.indexOf(code)];
  return getClassSkills(gameClass).find((skill) => skill.id === id) || null;
};
