const onlinePlayers = new Map();

export const registerGuildPlayer = (player) => {
  let players = onlinePlayers.get(player.characterId);
  if (!players) {
    players = new Set();
    onlinePlayers.set(player.characterId, players);
  }
  players.add(player);
};

export const unregisterGuildPlayer = (player) => {
  if (!player) return;
  const players = onlinePlayers.get(player.characterId);
  players?.delete(player);
  if (players?.size === 0) onlinePlayers.delete(player.characterId);
};

export const setOnlineGuildTags = (characterIds, tag) => {
  for (const characterId of characterIds) {
    for (const player of onlinePlayers.get(characterId) || []) player.guildTag = tag;
  }
};
