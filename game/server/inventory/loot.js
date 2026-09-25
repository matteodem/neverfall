import { Meteor } from "meteor/meteor";
import { randomUUID } from "node:crypto";
import { LootState } from "../colyseus/WorldState";
import { canCollectLoot, rollLoot } from "../../imports/game/inventory";

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
  const reward = rollLoot(Math.random, loot.enemyType);
  const modifier = { $inc: { "profile.inventory.money": reward.money } };
  if (reward.items.length) {
    modifier.$push = { "profile.inventory.items": { $each: reward.items } };
  }
  try {
    const updated = await Meteor.users.updateAsync(player.userId, modifier);
    if (!updated) room.state.loot.set(id, loot);
  } catch (error) {
    room.state.loot.set(id, loot);
    console.error("[Loot] Failed to save inventory", error);
  }
};
