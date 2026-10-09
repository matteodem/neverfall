import { trackAchievements } from "../achievements";
import { Meteor } from "meteor/meteor";
import { randomUUID } from "node:crypto";
import { LootState } from "../colyseus/WorldState";
import { canCollectLoot, rollLoot } from "../../imports/game/inventory";
import { Characters } from "../../imports/api/characters/characters";

// Retain partial progress if a drop is restored after a persistence failure.
const pendingRewards = new WeakMap();

export const spawnLoot = (room, enemy, sessionId, guaranteeItem = false) => {
  const player = room.state.players.get(sessionId);
  if (!enemy || !player) return;

  const id = randomUUID();
  const loot = new LootState({
    ownerId: player.userId,
    ownerCharacterId: guaranteeItem ? player.characterId : "",
    enemyType: enemy.type || "boar",
    rare: enemy.rare,
    x: enemy.x,
    y: enemy.y,
    z: enemy.z,
  });
  if (guaranteeItem) {
    // Keep the first kill's reward on its pickup, including across save retries.
    pendingRewards.set(loot, {
      reward: rollLoot(Math.random, loot.enemyType, loot.rare, true),
      characterId: player.characterId,
      itemsSaved: false,
      xpSaved: false,
    });
  }
  room.state.loot.set(id, loot);
};

export const collectLoot = async (room, client, id) => {
  if (typeof id !== "string") return;
  const player = room.state.players.get(client.sessionId);
  const loot = room.state.loot.get(id);
  if (!canCollectLoot(player, loot)) return;

  // Claim synchronously before writing so repeated requests cannot pay twice.
  room.state.loot.delete(id);
  const pending = pendingRewards.get(loot) || {
    reward: room.getLootReward
      ? room.getLootReward(loot)
      : rollLoot(Math.random, loot.enemyType, loot.rare),
    characterId: player.characterId,
    itemsSaved: false,
    xpSaved: false,
  };
  pendingRewards.set(loot, pending);
  const { reward, characterId } = pending;
  try {
    if (reward.items.length && !pending.itemsSaved) {
      const updated = await Characters.updateAsync(
        { _id: characterId, userId: player.userId },
        { $push: { "inventory.items": { $each: reward.items } } }
      );
      if (!updated) throw new Error("Loot character not found");
      pending.itemsSaved = true;
      await trackAchievements(characterId, "loot");
    }
    if (loot.xpReward > 0 && !pending.xpSaved) {
      await room.awardXp(characterId, loot.xpReward);
      pending.xpSaved = true;
    }
    const updated = await Meteor.users.updateAsync(player.userId, {
      $inc: { "profile.inventory.money": reward.money },
    });
    if (!updated) throw new Error("Loot user not found");
    pendingRewards.delete(loot);
    room.onLootCollected?.(player, loot);
  } catch (error) {
    room.state.loot.set(id, loot);
    console.error("[Loot] Failed to save inventory", error);
  }
};
