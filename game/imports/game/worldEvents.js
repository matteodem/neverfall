export const WORLD_EVENTS = [
  {
    id: "wolf-invasion",
    name: "Wolf Invasion",
    announcement: "World Event: Wolves are attacking the camp!",
    center: { x: 0, z: 20 },
    participationRadius: 65,
    spawnRadius: 28,
    initialDelay: 120000,
    duration: 600000,
    cooldown: 600000,
    waveDelay: 10000,
    scaling: { healthPerExtraPlayer: 0.75, damagePerExtraPlayer: 0.15 },
    waves: [
      { type: "wolf", level: 3, count: 3 },
      { type: "wolf", level: 4, count: 5 },
      { type: "wolf", level: 5, count: 5 },
    ],
    boss: { type: "alphaWolf", level: 5, count: 1 },
    rewards: { xp: 500, money: 10000, lootType: "wolf" },
  },
];
