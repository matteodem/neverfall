import { WARRIOR_SKILLS } from "./config";

const projectileAttack = (name, icon, type, radius) => ({
  ...WARRIOR_SKILLS.Digit1,
  cooldown: 500,
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
      Digit2: { ...WARRIOR_SKILLS.Digit2, name: "Heavy Strike", icon: "heavyStrike" },
      Digit3: { ...WARRIOR_SKILLS.Digit3, name: "Cleave", icon: "cleave" },
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
    skills: {
      Digit1: projectileAttack("Arrow Shot", "arrow", "arrow", 0.6),
      Digit2: { ...projectileAttack("Strong Arrow", "strongArrow", "arrow", 0.6), damageMultiplier: 2, cooldown: 4000, requiresUnmounted: true },
      Digit3: { ...projectileAttack("Multi Shot", "multiShot", "arrow", 0.6), damageMultiplier: 0.9, cooldown: 6000, projectiles: 3, spreadAngle: 12, requiresUnmounted: true },
    },
  },
  mage: {
    name: "Mage",
    model: "mage/Mage.glb",
    skinMeshes: ["Mage_Head"],
    maxHealth: 70,
    attackDamage: 35,
    swordVisible: false,
    skills: {
      Digit1: projectileAttack("Fireball", "fireball", "fireball", 0.8),
      Digit2: {
        ...projectileAttack("Fireball Burst", "fireballBurst", "fireball", 1),
        damageMultiplier: 2, cooldown: 4000, requiresUnmounted: true,
        projectile: { type: "fireball", speed: 18, lifetime: 1500, radius: 1, scale: 1.5 },
      },
      Digit3: { name: "Fire Nova", icon: "fireNova", damageMultiplier: 1.25, cooldown: 7000, aoe: true, range: 3, effect: "fireNova", requiresUnmounted: true },
    },
  },
};

export const isValidGameClass = (gameClass) =>
  typeof gameClass === "string" && Object.prototype.hasOwnProperty.call(CLASS_CONFIG, gameClass);

export const getClassConfig = (gameClass) =>
  CLASS_CONFIG[isValidGameClass(gameClass) ? gameClass : "warrior"];
