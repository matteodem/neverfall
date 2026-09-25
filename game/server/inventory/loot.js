import { Meteor } from "meteor/meteor";
import { randomUUID } from "node:crypto";
import { LootState } from "../colyseus/WorldState";
import { canCollectLoot, rollLoot } from "../../imports/game/inventory";
import { Characters } from "../../imports/api/characters/characters";

// Retain partial progress if a drop is restored after a persistence failure.
const pendingRewards = new WeakMap();

export const spawnLoot = (room, enemy, sessionId) => {
  const player = room.state.players.get(sessionId);
  if (!enemy || !player) return;

  const id = randomUUID();
  room.state.loot.set(id, new LootState({
    ownerId: player.userId,
    enemyType: enemy.type || "boar",
    x: enemy.x,
    y: enemy.y,
    z: enemy.z,
  }));
};

export const collectLoot = async (room, client, id) => {
  if (typeof id !== "string") return;
  const player = room.state.players.get(client.sessionId);
  const loot = room.state.loot.get(id);
  if (!canCollectLoot(player, loot)) return;

  // Claim synchronously before writing so repeated requests cannot pay twice.
  room.state.loot.delete(id);
  const pending = pendingRewards.get(loot) || {
    reward: rollLoot(Math.random, loot.enemyType),
    characterId: player.characterId,
    itemsSaved: false,
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
    }
    const updated = await Meteor.users.updateAsync(player.userId, {
      $inc: { "profile.inventory.money": reward.money },
    });
    if (!updated) throw new Error("Loot user not found");
    pendingRewards.delete(loot);
  } catch (error) {
    room.state.loot.set(id, loot);
    console.error("[Loot] Failed to save inventory", error);
  }
};
