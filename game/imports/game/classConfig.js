import { WARRIOR_SKILLS } from "./config";

// All classes share the current skill kit until their own abilities are added.
export const CLASS_CONFIG = {
  warrior: {
    name: "Warrior",
    model: "knight/Knight.glb",
    skinMeshes: ["Knight_Head"],
    maxHealth: 100,
    attackDamage: 25,
    skills: WARRIOR_SKILLS,
  },
  ranger: {
    name: "Ranger",
    model: "ranger/Ranger.glb",
    skinMeshes: ["Ranger_Head"],
    maxHealth: 85,
    attackDamage: 30,
    skills: WARRIOR_SKILLS,
  },
  mage: {
    name: "Mage",
    model: "mage/Mage.glb",
    skinMeshes: ["Mage_Head"],
    maxHealth: 70,
    attackDamage: 35,
    skills: WARRIOR_SKILLS,
  },
};

export const isValidGameClass = (gameClass) =>
  typeof gameClass === "string" && Object.prototype.hasOwnProperty.call(CLASS_CONFIG, gameClass);

export const getClassConfig = (gameClass) =>
  CLASS_CONFIG[isValidGameClass(gameClass) ? gameClass : "warrior"];
