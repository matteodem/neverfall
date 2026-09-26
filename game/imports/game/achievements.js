import { MAX_LEVEL } from "./xp";

export const ACHIEVEMENTS = [
  { id: "firstBlood", name: "First Blood", description: "Defeat 1 enemy.", event: "kill", target: 1 },
  { id: "boarSlayer", name: "Boar Slayer", description: "Defeat 100 boars.", event: "kill", enemyType: "boar", target: 100 },
  { id: "wolfHunter", name: "Wolf Hunter", description: "Defeat 100 wolves.", event: "kill", enemyType: "wolf", target: 100 },
  { id: "gettingStronger", name: "Getting Stronger", description: "Reach level 5.", event: "level", target: 5 },
  { id: "legendOfNeverfall", name: "Legend of Neverfall", description: "Reach the maximum character level.", event: "level", target: MAX_LEVEL },
  { id: "treasureHunter", name: "Treasure Hunter", description: "Collect your first loot item.", event: "loot", target: 1 },
  { id: "equipped", name: "Equipped", description: "Equip your first item.", event: "equip", target: 1 },
  { id: "mounted", name: "Mounted", description: "Use a mount for the first time.", event: "mount", target: 1 },
  { id: "bossKiller", name: "Boss Killer", description: "Defeat the Forest Giant.", event: "kill", enemyType: "forestGiant", target: 1 },
];
