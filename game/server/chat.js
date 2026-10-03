import { Meteor } from "meteor/meteor";
import { ChatMessages, CHAT_RETENTION_MS } from "../imports/api/chat/messages";
import { Characters } from "../imports/api/characters/characters";
import { Guilds } from "../imports/api/guilds/guilds";

Meteor.publish("chat.mine", async function (characterId) {
  if (!this.userId || typeof characterId !== "string") return this.ready();
  const character = await Characters.findOneAsync({ _id: characterId, userId: this.userId });
  if (!character) return this.ready();
  const channels = [{ channel: { $ne: "guild" }, recipientIds: this.userId }];
  if (character.guildId) channels.push({ channel: "guild", guildId: character.guildId,
    recipientCharacterIds: characterId, recipientIds: this.userId });
  return ChatMessages.find({ $or: channels, createdAt: { $gt: new Date(Date.now() - CHAT_RETENTION_MS) } }, {
    fields: { channel: 1, roomId: 1, guildId: 1, senderName: 1, recipientName: 1, text: 1, createdAt: 1 },
    sort: { createdAt: -1 }, limit: 100,
  });
});

export const initializeChat = async () => {
  await ChatMessages.rawCollection().createIndex({ createdAt: 1 }, { expireAfterSeconds: CHAT_RETENTION_MS / 1000 });
  await ChatMessages.removeAsync({ createdAt: { $lte: new Date(Date.now() - CHAT_RETENTION_MS) } });
};

export const sendChat = async (room, client, input) => {
  const player = room.state.players.get(client.sessionId);
  if (!player || typeof input !== "string") return;
  const text = input.trim();
  if (player.inDungeon && !/^\/guild(?:\s|$)/i.test(text)) return;
  const error = (message) => client.send("chatError", message);
  if (!text || text.length > 500) return error("Messages must be between 1 and 500 characters.");
  const runtime = room.playerRuntime.get(client.sessionId);
  if (!runtime || Date.now() < (runtime.nextChatAt || 0)) return error("Please wait a moment before sending another message.");
  runtime.nextChatAt = Date.now() + 500;

  if (["/walk", "/idle", "/interact"].includes(text.toLowerCase())) {
    if (player.health > 0 && !player.mounted) {
      player.chatAnimation = text.slice(1).toLowerCase();
      runtime.chatAnimationSequence = (runtime.chatAnimationSequence || 0) + 1;
      const sequence = runtime.chatAnimationSequence;
      if (player.chatAnimation === "interact") room.clock.setTimeout(() => {
        if (runtime.chatAnimationSequence === sequence) player.chatAnimation = "";
      }, 2000);
    }
    return;
  }
  let channel = "room";
  let content = text;
  let recipientName;
  let recipientIds;
  let recipientCharacterIds;
  let guildId;
  if (/^\/party(?:\s|$)/i.test(text)) {
    const world = room.access?.world || room;
    const source = [...world.state.players.values()].find((member) => member.characterId === player.characterId);
    const members = [...world.state.players.values()].filter((member) => source?.groupId && member.groupId === source.groupId);
    if (members.length < 2) return error("You are not in a group, nobody can see your message");
    content = text.replace(/^\/party\s*/i, "");
    channel = "party";
    recipientIds = members.map((member) => member.userId);
  } else if (/^\/guild(?:\s|$)/i.test(text)) {
    const character = await Characters.findOneAsync({ _id: player.characterId, userId: player.userId });
    const guild = character?.guildId && await Guilds.findOneAsync({ _id: character.guildId, "members.characterId": character._id });
    if (!guild) return error("You are not in a guild.");
    content = text.replace(/^\/guild\s*/i, "");
    channel = "guild";
    guildId = guild._id;
    const members = await Characters.find({
      _id: { $in: guild.members.map((member) => member.characterId) }, guildId,
    }).fetchAsync();
    recipientCharacterIds = members.map((member) => member._id);
    recipientIds = members.map((member) => member.userId);
  } else if (/^\/whisper(?:\s|$)/i.test(text)) {
    const match = text.match(/^\/whisper\s+"([^"]+)"\s+(.+)$/i);
    if (!match) return error('Use /whisper "Character Name" message');
    const recipient = await Characters.findOneAsync({ nameLower: match[1].trim().toLowerCase() });
    if (!recipient) return error("That character could not be found.");
    content = match[2].trim();
    channel = "whisper";
    recipientName = recipient.name;
    recipientIds = [player.userId, recipient.userId];
  } else if (text.startsWith("/")) {
    return error('Commands: /guild message, /party message, /whisper "Name" message, /walk, /idle, /interact');
  }
  if (!content.trim()) return error("Write a message first.");
  if (!recipientIds) {
    recipientIds = [...room.state.players.values()].filter((member) => !member.inDungeon).map((member) => member.userId);
  }
  try {
    await ChatMessages.insertAsync({
      channel, roomId: room.roomId, senderName: player.name,
      ...(recipientName ? { recipientName } : {}),
      ...(guildId ? { guildId, recipientCharacterIds } : {}),
      text: content.trim(), recipientIds: [...new Set(recipientIds)], createdAt: new Date(),
    });
  } catch (saveError) {
    console.error("[Chat] Failed to save message", saveError);
    error("Could not send your message. Please try again.");
  }
};
