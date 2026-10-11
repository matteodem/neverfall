import { trackAchievements } from "../achievements";
import { Meteor } from "meteor/meteor";
import { randomUUID } from "node:crypto";
import { LootState } from "../colyseus/WorldState";
import { canCollectLoot, rollLoot } from "../../imports/game/inventory";
import { Characters } from "../../imports/api/characters/characters";

// Retain partial progress if a drop is restored after a persistence failure.
const pendingRewards = new WeakMap();

export const spawnLoot = (room, enemy, sessionId, guaranteeItem = false, lootTable) => {
  const player = room.state.players.get(sessionId);
  if (!enemy || !player) return;

  const id = randomUUID();
  const loot = new LootState({
    ownerId: player.userId,
    ownerCharacterId: guaranteeItem || room.getLootReceipt ? player.characterId : "",
    enemyType: enemy.type || "boar",
    rare: enemy.rare,
    x: enemy.x,
    y: enemy.y,
    z: enemy.z,
  });
  if (guaranteeItem || lootTable) {
    // Keep guaranteed/custom rolls on their pickup, including across save retries.
    pendingRewards.set(loot, {
      reward: rollLoot(Math.random, loot.enemyType, loot.rare, guaranteeItem, lootTable),
      characterId: player.characterId,
      itemsSaved: false,
      xpSaved: false,
    });
  }
  room.state.loot.set(id, loot);
};

export const hasClaimedLootReward = async (characterId, userId, receipt) => {
  const [character, user] = await Promise.all([
    Characters.findOneAsync({ _id: characterId, userId, lootRewardReceipts: receipt }),
    Meteor.users.findOneAsync({ _id: userId, "profile.lootGoldReceipts": receipt }),
  ]);
  return Boolean(character && user);
};

// Item/XP and gold receipts are committed with their rewards in their respective documents.
// A partial failure can resume without paying either part a second time.
const grantRecordedLoot = async (room, player, loot, reward, receipt) => {
  const character = await Characters.findOneAsync({ _id: player.characterId, userId: player.userId });
  if (!character) throw new Error("Loot character not found");
  let itemsGranted = false;
  if (!character.lootRewardReceipts?.includes(receipt)) {
    const updated = await room.awardXp(player.characterId, loot.xpReward || 0, true, {
      selector: { userId: player.userId, lootRewardReceipts: { $ne: receipt } },
      receipt,
      items: reward.items,
    });
    itemsGranted = updated !== false;
  }
  await Meteor.users.updateAsync({ _id: player.userId, "profile.lootGoldReceipts": { $ne: receipt } }, {
    $inc: { "profile.inventory.money": reward.money },
    $addToSet: { "profile.lootGoldReceipts": receipt },
  });
  if (!await hasClaimedLootReward(player.characterId, player.userId, receipt)) {
    throw new Error("Loot reward could not be saved");
  }
  return itemsGranted;
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
    const receipt = room.getLootReceipt?.(loot);
    if (receipt) {
      const itemsGranted = await grantRecordedLoot(room, player, loot, reward, receipt);
      if (itemsGranted && reward.items.length) await trackAchievements(characterId, "loot");
      pendingRewards.delete(loot);
      room.onLootCollected?.(player, loot);
      return;
    }
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
