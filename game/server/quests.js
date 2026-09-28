import { Meteor } from "meteor/meteor";
import { Characters } from "../imports/api/characters/characters";
import { QUESTS } from "../imports/game/quests";
import { spawnLoot } from "./inventory/loot";

const pending = new Map();

export const recordQuestEvent = (room, characterId, type, target) => {
  const matches = QUESTS.filter((quest) =>
    quest.objective.type === type && quest.objective.target === target);
  if (!matches.length) return Promise.resolve();

  // Serialize updates for a character, including events from separate rooms.
  const previous = pending.get(characterId) || Promise.resolve();
  const work = previous.catch(() => {}).then(async () => {
    const character = await Characters.findOneAsync(characterId);
    if (!character) return;

    for (const quest of matches) {
      const amount = quest.objective.amount;
      const progress = character.questProgress?.[quest.id] || 0;
      if (!quest.repeatable && progress >= amount) continue;

      const completed = progress + 1 >= amount;
      const next = completed && quest.repeatable ? 0 : Math.min(progress + 1, amount);
      await Characters.updateAsync(characterId, {
        $set: { [`questProgress.${quest.id}`]: next },
      });
      character.questProgress ||= {};
      character.questProgress[quest.id] = next;

      if (quest.progressField) {
        for (const player of room.state.players.values()) {
          if (player.characterId === characterId) player[quest.progressField] = next;
        }
      }

      if (!completed) continue;
      for (const client of room.clients) {
        if (room.state.players.get(client.sessionId)?.characterId === characterId) {
          client.send("questCompleted", { title: quest.title, rewards: quest.rewards });
        }
      }
      if (quest.rewards?.xp) await room.awardXp(characterId, quest.rewards.xp);
      if (quest.rewards?.gold) {
        await Meteor.users.updateAsync(character.userId, {
          $inc: { "profile.inventory.money": quest.rewards.gold * 10000 },
        });
      }
      if (quest.rewards?.lootType) {
        for (const [sessionId, player] of room.state.players) {
          if (player.characterId === characterId) {
            spawnLoot(room, { type: quest.rewards.lootType, x: player.x, y: player.y, z: player.z }, sessionId);
            break;
          }
        }
      }
    }
  });
  pending.set(characterId, work);
  return work.finally(() => {
    if (pending.get(characterId) === work) pending.delete(characterId);
  });
};
