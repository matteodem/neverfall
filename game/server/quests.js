import { Meteor } from "meteor/meteor";
import { Characters } from "../imports/api/characters/characters";
import { QUESTS } from "../imports/game/quests";
import { getNpcQuestState } from "../imports/game/npcs/npcQuests";
import { ITEM_NAMES, rollRandomRingId } from "../imports/game/inventory";
import { trackAchievements } from "./achievements";
import { spawnLoot } from "./inventory/loot";

const pending = new Map();

export const withQuestUpdate = (characterId, action) => {
  const previous = pending.get(characterId) || Promise.resolve();
  const work = previous.catch(() => {}).then(action);
  pending.set(characterId, work);
  return work.finally(() => {
    if (pending.get(characterId) === work) pending.delete(characterId);
  });
};

export const recordQuestEvent = (room, characterId, type, target, { spawnId } = {}) => {
  const matches = QUESTS.filter((quest) =>
    ((quest.objective.type === type && quest.objective.target === target) ||
      quest.objectives?.some((objective) => objective.type === type && objective.target === target)));
  if (!matches.length) return Promise.resolve();

  // Serialize updates for a character, including events from separate rooms.
  return withQuestUpdate(characterId, async () => {
    const character = await Characters.findOneAsync(characterId);
    if (!character) return;
    let advanced = false;

    for (const quest of matches) {
      if (getNpcQuestState(quest, character) !== "active") {
        // Previously visited locations must remain retryable for newly accepted quests.
        continue;
      }
      const amount = quest.objective.amount;
      const progress = character.questProgress?.[quest.id] || 0;
      if (!quest.repeatable && progress >= amount) {
        advanced = true;
        continue;
      }
      const steps = quest.objectives?.flatMap((step) => Array(step.amount || 1).fill(step));
      const objective = steps?.[progress] || quest.objective;
      if (objective.type !== type || objective.target !== target ||
        (objective.spawnId && objective.spawnId !== spawnId)) {
        if (type === "ReachLocation" && steps?.slice(0, progress).some((step) =>
          step.type === type && step.target === target)) advanced = true;
        continue;
      }

      const completed = progress + 1 >= amount;
      const autoRepeat = quest.repeatable && !quest.turnInRequired;
      const next = completed && autoRepeat ? 0 : Math.min(progress + 1, amount);
      const update = { [`questProgress.${quest.id}`]: next };
      update[`questStates.${quest.id}`] = completed && !autoRepeat
        ? quest.turnInRequired ? "completed" : "rewarded" : "active";
      const ringId = completed && !quest.turnInRequired && quest.rewards?.randomRing ? rollRandomRingId() : null;
      await Characters.updateAsync(characterId, {
        $set: update,
        ...(ringId ? { $push: { "inventory.items": { id: ringId } } } : {}),
      });
      character.questProgress ||= {};
      character.questProgress[quest.id] = next;
      advanced = true;

      // Preserve each quest's configured turn-in or automatic reward flow.
      if (quest.turnInRequired) continue;

      if (!completed) continue;
      await trackAchievements(characterId, "quest");
      for (const client of room.clients) {
        if (room.state.players.get(client.sessionId)?.characterId === characterId) {
          client.send("questCompleted", { title: quest.title,
            rewards: { ...quest.rewards, ...(ringId ? { item: ITEM_NAMES[ringId] } : {}) } });
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
    return advanced;
  });
};
