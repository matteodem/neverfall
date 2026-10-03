import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import { Characters } from "../imports/api/characters/characters";
import { Guilds } from "../imports/api/guilds/guilds";
import { setOnlineGuildTags } from "./colyseus/onlineGuildTags";

const currentCharacter = async (userId) => {
  if (!userId) throw new Meteor.Error("not-authorized");
  const user = await Meteor.users.findOneAsync(userId);
  const characterId = user?.profile?.currentCharacterId;
  if (!characterId) throw new Meteor.Error("character-not-selected", "Select a character first.");
  const character = await Characters.findOneAsync({ _id: characterId, userId });
  if (!character) throw new Meteor.Error("character-not-selected", "Select a character first.");
  return character;
};

const leaderGuild = async (character) => {
  const guild = await Guilds.findOneAsync({ _id: character.guildId, leaderCharacterId: character._id });
  if (!guild) throw new Meteor.Error("guild-not-leader", "Only the guild leader can do that.");
  return guild;
};

const disbandGuild = async (guildId, leaderCharacterId) => {
  const guild = await Guilds.findOneAsync({ _id: guildId, leaderCharacterId });
  const removed = await Guilds.removeAsync({ _id: guildId, leaderCharacterId });
  if (!removed) return false;
  await Characters.updateAsync({ guildId }, { $unset: { guildId: "" } }, { multi: true });
  await Characters.updateAsync({ "guildInvite.guildId": guildId }, { $unset: { guildInvite: "" } }, { multi: true });
  setOnlineGuildTags(guild?.members.map((member) => member.characterId) || [], "");
  return true;
};

export const removeGuildCharacter = async (character) => {
  if (!character.guildId) return;
  const guild = await Guilds.findOneAsync(character.guildId);
  if (guild?.leaderCharacterId === character._id) await disbandGuild(guild._id, character._id);
  else if (guild) {
    await Guilds.updateAsync(guild._id, { $pull: { members: { characterId: character._id } } });
    setOnlineGuildTags([character._id], "");
  }
};

export const initializeGuilds = async () => {
  await Guilds.rawCollection().createIndex({ nameLower: 1 }, { unique: true });
  await Guilds.rawCollection().createIndex({ tagLower: 1 }, { unique: true });
};

Meteor.publish("guilds.mine", async function (characterId) {
  if (!this.userId || typeof characterId !== "string") return this.ready();
  const character = await Characters.findOneAsync({ _id: characterId, userId: this.userId });
  if (!character) return this.ready();
  return Guilds.find({ "members.characterId": characterId });
});

Meteor.methods({
  async "guilds.create"({ name, tag } = {}) {
    const character = await currentCharacter(this.userId);
    if (character.guildId) throw new Meteor.Error("already-in-guild", "Leave your guild first.");
    const cleanName = typeof name === "string" ? name.trim().replace(/\s+/g, " ") : "";
    const cleanTag = typeof tag === "string" ? tag.trim().toUpperCase() : "";
    if (cleanName.length < 3 || cleanName.length > 24) throw new Meteor.Error("invalid-guild-name", "Guild name must be 3–24 characters.");
    if (!/^[A-Z0-9]{2,5}$/.test(cleanTag)) throw new Meteor.Error("invalid-guild-tag", "Guild tag must be 2–5 letters or numbers.");
    const guildId = Random.id();
    try {
      await Guilds.insertAsync({ _id: guildId, name: cleanName, nameLower: cleanName.toLowerCase(),
        tag: cleanTag, tagLower: cleanTag.toLowerCase(), leaderCharacterId: character._id,
        members: [{ characterId: character._id, name: character.name, role: "leader" }], createdAt: new Date() });
    } catch (error) {
      if (error.code === 11000) throw new Meteor.Error("guild-name-taken", "That guild name or tag is already taken.");
      throw error;
    }
    let joined;
    try {
      joined = await Characters.updateAsync({ _id: character._id, userId: this.userId, guildId: { $exists: false } },
        { $set: { guildId }, $unset: { guildInvite: "" } });
    } catch (error) {
      await Guilds.removeAsync(guildId);
      throw error;
    }
    if (!joined) {
      await Guilds.removeAsync(guildId);
      throw new Meteor.Error("already-in-guild", "You are already in a guild.");
    }
    setOnlineGuildTags([character._id], cleanTag);
  },

  async "guilds.invite"({ name } = {}) {
    const leader = await currentCharacter(this.userId);
    const guild = await leaderGuild(leader);
    const targetName = typeof name === "string" ? name.trim().toLowerCase() : "";
    const target = targetName && await Characters.findOneAsync({ nameLower: targetName });
    if (!target || target._id === leader._id) throw new Meteor.Error("guild-target-not-found", "Enter another character's name.");
    if (target.guildId) throw new Meteor.Error("already-in-guild", "That character is already in a guild.");
    const invited = await Characters.updateAsync({ _id: target._id, guildId: { $exists: false } },
      { $set: { guildInvite: { guildId: guild._id, guildName: guild.name, tag: guild.tag, inviterName: leader.name } } });
    if (!invited) throw new Meteor.Error("already-in-guild", "That character is already in a guild.");
  },

  async "guilds.accept"() {
    const character = await currentCharacter(this.userId);
    if (character.guildId) throw new Meteor.Error("already-in-guild", "Leave your guild first.");
    const guildId = character.guildInvite?.guildId;
    if (!guildId) throw new Meteor.Error("guild-invite-missing", "You have no guild invitation.");
    const member = { characterId: character._id, name: character.name, role: "member" };
    const added = await Guilds.updateAsync({ _id: guildId, "members.characterId": { $ne: character._id } },
      { $push: { members: member } });
    if (!added) {
      await Characters.updateAsync(character._id, { $unset: { guildInvite: "" } });
      throw new Meteor.Error("guild-unavailable", "This guild is no longer available.");
    }
    let joined;
    try {
      joined = await Characters.updateAsync({ _id: character._id, userId: this.userId,
        guildId: { $exists: false }, "guildInvite.guildId": guildId },
      { $set: { guildId }, $unset: { guildInvite: "" } });
    } catch (error) {
      await Guilds.updateAsync(guildId, { $pull: { members: { characterId: character._id } } });
      throw error;
    }
    if (!joined) {
      await Guilds.updateAsync(guildId, { $pull: { members: { characterId: character._id } } });
      throw new Meteor.Error("guild-invite-missing", "This invitation is no longer available.");
    }
    const guild = await Guilds.findOneAsync(guildId);
    if (!guild) {
      await Characters.updateAsync({ _id: character._id, guildId }, { $unset: { guildId: "" } });
      throw new Meteor.Error("guild-unavailable", "This guild is no longer available.");
    }
    setOnlineGuildTags([character._id], guild.tag);
  },

  async "guilds.decline"() {
    const character = await currentCharacter(this.userId);
    await Characters.updateAsync(character._id, { $unset: { guildInvite: "" } });
  },

  async "guilds.leave"() {
    const character = await currentCharacter(this.userId);
    if (!character.guildId) throw new Meteor.Error("guild-not-member", "You are not in a guild.");
    const guild = await Guilds.findOneAsync(character.guildId);
    if (guild?.leaderCharacterId === character._id) throw new Meteor.Error("guild-leader-must-disband", "Disband the guild before leaving.");
    if (guild) await Guilds.updateAsync(guild._id, { $pull: { members: { characterId: character._id } } });
    await Characters.updateAsync({ _id: character._id, guildId: character.guildId }, { $unset: { guildId: "" } });
    setOnlineGuildTags([character._id], "");
  },

  async "guilds.kick"({ characterId } = {}) {
    const leader = await currentCharacter(this.userId);
    const guild = await leaderGuild(leader);
    if (typeof characterId !== "string" || characterId === leader._id ||
      !guild.members.some((member) => member.characterId === characterId && member.role === "member")) {
      throw new Meteor.Error("guild-invalid-member", "Only normal members can be kicked.");
    }
    await Guilds.updateAsync({ _id: guild._id, leaderCharacterId: leader._id },
      { $pull: { members: { characterId } } });
    await Characters.updateAsync({ _id: characterId, guildId: guild._id }, { $unset: { guildId: "" } });
    setOnlineGuildTags([characterId], "");
  },

  async "guilds.disband"() {
    const leader = await currentCharacter(this.userId);
    const guild = await leaderGuild(leader);
    await disbandGuild(guild._id, leader._id);
  },
});
