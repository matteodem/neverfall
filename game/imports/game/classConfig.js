import { WARRIOR_SKILLS } from "./config";

const projectileAttack = (name, icon, type, radius) => ({
  ...WARRIOR_SKILLS.Digit1,
  cooldown: 1000,
  name,
  icon,
  projectile: { type, speed: 18, lifetime: 1500, radius },
});

export const CLASS_CONFIG = {
  warrior: {
    name: "Warrior",
    model: "knight/Knight.glb",
    skinMeshes: ["Knight_Head"],
    maxHealth: 100,
    attackDamage: 25,
    swordVisible: true,
    skills: {
      ...WARRIOR_SKILLS,
      Digit1: { ...WARRIOR_SKILLS.Digit1, name: "Basic Attack", icon: "sword" },
    },
  },
  ranger: {
    name: "Ranger",
    model: "ranger/Ranger.glb",
    skinMeshes: ["Ranger_Head"],
    maxHealth: 85,
    attackDamage: 30,
    swordVisible: false,
    skills: { Digit1: projectileAttack("Arrow Shot", "arrow", "arrow", 0.6) },
  },
  mage: {
    name: "Mage",
    model: "mage/Mage.glb",
    skinMeshes: ["Mage_Head"],
    maxHealth: 70,
    attackDamage: 35,
    swordVisible: false,
    skills: { Digit1: projectileAttack("Fireball", "fireball", "fireball", 0.8) },
  },
};

export const isValidGameClass = (gameClass) =>
  typeof gameClass === "string" && Object.prototype.hasOwnProperty.call(CLASS_CONFIG, gameClass);

export const getClassConfig = (gameClass) =>
  CLASS_CONFIG[isValidGameClass(gameClass) ? gameClass : "warrior"];
