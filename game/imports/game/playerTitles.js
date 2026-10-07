export const PLAYER_TITLES = [
  { id: "treasure-hunter", label: "Treasure Hunter", achievementId: "treasureHunter" },
  { id: "wolf-hunter", label: "Wolf Hunter", achievementId: "wolfHunter" },
  { id: "tower-climber", label: "Tower Climber", achievementId: "towerSummit" },
  { id: "dungeon-delver", label: "Dungeon Delver", achievementId: "dungeonDelver" },
  { id: "snowy-explorer", label: "Snowy Explorer", achievementId: "snowyExplorer" },
];

export const getPlayerTitle = (id) => PLAYER_TITLES.find((title) => title.id === id);

export const getUnlockedPlayerTitles = (achievements) => PLAYER_TITLES.filter(
  (title) => achievements?.[title.achievementId]?.unlocked === true
);
