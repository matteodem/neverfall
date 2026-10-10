import { Meteor } from "meteor/meteor";
import { Characters } from "../imports/api/characters/characters";
import { NPC_DEFINITIONS, NPC_INTERACTION_RANGE } from "../imports/game/npcs/npcDefinitions";
import { NPC_QUESTS, getNpcQuestState, getQuestAcceptanceError } from "../imports/game/npcs/npcQuests";
import { recordQuestEvent, withQuestUpdate } from "./quests";
import { rememberMerchantInteraction } from "./merchantInteractions";
import { trackAchievements } from "./achievements";
import { rollRandomRingId } from "../imports/game/inventory";

const getNearbyNpc = (room, client, npcId) => {
  const player = room.state.players.get(client.sessionId);
  const npc = NPC_DEFINITIONS.find((entry) => entry.id === npcId);
  if (!room.campSafeZoneEnabled || !player || player.health <= 0 || player.inDungeon || !npc ||
    Math.hypot(player.x - npc.position.x, player.y - npc.position.y, player.z - npc.position.z) >
      (npc.interactionRange ?? NPC_INTERACTION_RANGE)) {
    throw new Error("Move closer to the NPC to talk.");
  }
  return { player, npc };
};

export const handleNpcQuest = async (room, client, request) => {
  const { action, npcId, questId, requestId } = request || {};
  try {
    if (!["interact", "accept", "complete"].includes(action)) throw new Error("Unknown quest action.");
    const { player, npc } = getNearbyNpc(room, client, npcId);
    room.recordActivity(client.sessionId);
    if (action === "interact") {
      await recordQuestEvent(room, player.characterId, "InteractNpc", npcId);
      getNearbyNpc(room, client, npcId);
      rememberMerchantInteraction(room, client, npc);
    } else {
      const quest = NPC_QUESTS.find((entry) => entry.id === questId && npc.offeredQuestIds?.includes(entry.id));
      if (!quest) throw new Error("This NPC does not offer that quest.");
      await withQuestUpdate(player.characterId, async () => {
        getNearbyNpc(room, client, npcId);
        const character = await Characters.findOneAsync({ _id: player.characterId, userId: player.userId });
        if (!character) throw new Error("Character unavailable.");
        const state = getNpcQuestState(quest, character);
        if (action === "accept") {
          const error = getQuestAcceptanceError({ character, quest, npc });
          if (error) throw new Error(error);
          await Characters.updateAsync({ _id: character._id,
            [`questStates.${quest.id}`]: character.questStates?.[quest.id] ?? { $exists: false } }, {
            $set: { [`questStates.${quest.id}`]: "active", [`questProgress.${quest.id}`]: 0, trackedQuestId: quest.id },
          });
          // Shared location targets may have been visited for a different quest.
          const runtime = room.playerRuntime.get(client.sessionId);
          runtime?.reachedQuestLocations?.clear();
          runtime?.questLocationRetryAt?.clear();
          return;
        }
        if (state === "rewarded") return;
        if (state !== "completed" || (character.questProgress?.[quest.id] || 0) < quest.objective.amount) {
          throw new Error("Complete the objectives before collecting rewards.");
        }
        // Money and its receipt change atomically. If XP persistence fails, retrying
        // turn-in cannot pay gold twice; the quest stays completed until XP commits.
        const rewardCount = character.questRewardCounts?.[quest.id] || 0;
        if (quest.rewards.gold) {
          const receipt = `${character._id}:${quest.id}${quest.repeatable ? `:${rewardCount}` : ""}`;
          await Meteor.users.updateAsync({
            _id: character.userId, "profile.npcQuestGoldRewards": { $ne: receipt },
          }, {
            $inc: { "profile.inventory.money": quest.rewards.gold * 10000 },
            $addToSet: { "profile.npcQuestGoldRewards": receipt },
          });
        }
        // Reward state, XP, and any item reward are committed together.
        const ringId = quest.rewards.randomRing ? rollRandomRingId() : null;
        const awarded = await room.awardXp(character._id, quest.rewards.xp || 0, true, {
          selector: { [`questStates.${quest.id}`]: "completed" },
          fields: { [`questStates.${quest.id}`]: "rewarded", [`questRewardCounts.${quest.id}`]: rewardCount + 1,
            ...(character.trackedQuestId === quest.id ? { trackedQuestId: null } : {}) },
          ...(ringId ? { items: [{ id: ringId }] } : {}),
        });
        if (awarded === false) throw new Error("Quest changed. Please reopen the dialogue and try again.");
        await trackAchievements(character._id, "quest");
      });
    }
    client.send("npcQuestResult", { requestId });
  } catch (error) {
    console.error("[NPC Quests] Action failed", error);
    client.send("npcQuestResult", { requestId, error: error.message || "Could not update quest. Please try again." });
  }
};
