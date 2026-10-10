import { Meteor } from "meteor/meteor";
import { NPC_DEFINITIONS, NPC_INTERACTION_RANGE } from "../imports/game/npcs/npcDefinitions";
import { getMerchantShop } from "../imports/game/shop";

// Only validated realtime NPC interactions grant access to Meteor shop methods.
const interactions = new Map();

export const rememberMerchantInteraction = (room, client, npc) => {
  const player = room.state.players.get(client.sessionId);
  if (npc.npcType === "merchant") {
    interactions.set(player.characterId, { room, sessionId: client.sessionId, npcId: npc.id });
  } else {
    interactions.delete(player.characterId);
  }
};

export const clearMerchantInteraction = (characterId, sessionId) => {
  if (interactions.get(characterId)?.sessionId === sessionId) interactions.delete(characterId);
};

export const requireMerchantInteraction = (userId, characterId, context, action) => {
  const npc = NPC_DEFINITIONS.find((entry) => entry.id === context?.npcId);
  const shop = getMerchantShop(npc, action);
  if (!shop || shop.id !== context?.shopId) {
    throw new Meteor.Error("invalid-merchant", "This merchant does not offer that shop or action.");
  }
  const interaction = interactions.get(characterId);
  const player = interaction?.room.state.players.get(interaction.sessionId);
  if (interaction?.npcId !== npc.id || !interaction.room.campSafeZoneEnabled ||
    !player || player.userId !== userId || player.characterId !== characterId ||
    player.health <= 0 || player.inDungeon ||
    Math.hypot(player.x - npc.position.x, player.y - npc.position.y, player.z - npc.position.z) >
      (npc.interactionRange ?? NPC_INTERACTION_RANGE)) {
    throw new Meteor.Error("merchant-unavailable", "Talk to this merchant nearby before buying or selling.");
  }
  return shop;
};
