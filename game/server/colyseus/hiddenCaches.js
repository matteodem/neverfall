import { Characters } from "../../imports/api/characters/characters";
import { HIDDEN_CACHES, HIDDEN_CACHE_REWARDS, isNearHiddenCache } from "../../imports/game/hiddenCaches";
import { ITEM_NAMES, stackItems } from "../../imports/game/inventory";

export const claimHiddenCache = async (room, client, cacheId) => {
  if (typeof cacheId !== "string") return;
  const cache = HIDDEN_CACHES.find((entry) => entry.id === cacheId);
  // Ownership and position come from the authenticated room session, never payload IDs.
  const player = room.state.players.get(client.sessionId);
  if (!cache || !player || player.health <= 0 || player.inDungeon || !isNearHiddenCache(player, cache)) return;
  const items = HIDDEN_CACHE_REWARDS[cache.rewardTier];
  try {
    // One atomic write pays and records the claim, including concurrent/replayed requests.
    const updated = await Characters.updateAsync({
      _id: player.characterId,
      userId: player.userId,
      lootedCacheIds: { $ne: cache.id },
    }, {
      $addToSet: { lootedCacheIds: cache.id },
      $push: { "inventory.items": { $each: items } },
    });
    if (!updated) return;
    room.recordActivity(client.sessionId);
    const reward = stackItems(items).map(({ id, count }) => `${count} × ${ITEM_NAMES[id]}`).join(" · ");
    client.send("hiddenCacheReward", `Hidden Cache · ${reward}`);
  } catch (error) {
    console.error("[Hidden Caches] Could not save reward", error);
    client.send("hiddenCacheError", "Could not open cache. Please try again.");
  }
};
