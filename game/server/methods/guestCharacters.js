import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import { Characters, MAX_CHARACTERS } from "../../imports/api/characters/characters";
import { withCharacterSlots } from "../characterSlots";

const transfers = new Map();
const TRANSFER_LIFETIME = 15 * 60 * 1000;

Meteor.onConnection((connection) => {
  connection.onClose(() => transfers.delete(connection.id));
});

Accounts.onLogin(async ({ user, connection }) => {
  const transfer = transfers.get(connection?.id);
  if (!transfer || transfer.expiresAt <= Date.now() || transfer.destinationId ||
    user._id === transfer.sourceId || user.profile?.guest) return;
  // Bind to the first successful non-guest login on the source connection.
  transfer.destinationId = user._id;
  await Meteor.users.updateAsync(user._id, { $set: { "profile.isPlaying": false } });
});

const requireTransfer = async (invocation, token) => {
  const transfer = transfers.get(invocation.connection?.id);
  const destination = invocation.userId && await Meteor.users.findOneAsync(invocation.userId);
  if (typeof token !== "string" || !transfer || transfer.token !== token ||
    transfer.expiresAt <= Date.now() || !destination || destination.profile?.guest ||
    transfer.destinationId !== destination._id) {
    throw new Meteor.Error("guest-transfer-expired", "This guest transfer has expired. Your guest characters have not been deleted.");
  }
  return transfer;
};

Meteor.methods({
  async "characters.prepareGuestTransfer"() {
    const source = this.userId && await Meteor.users.findOneAsync(this.userId);
    if (!this.connection || source?.profile?.guest !== true || source.profile.isPlaying) {
      throw new Meteor.Error("not-authorized", "Guest characters can only be transferred from the character screen.");
    }
    const transfer = {
      token: Random.secret(), sourceId: source._id, destinationId: null,
      expiresAt: Date.now() + TRANSFER_LIFETIME,
    };
    transfers.set(this.connection.id, transfer);
    Meteor.setTimeout(() => {
      if (transfers.get(this.connection.id) === transfer) transfers.delete(this.connection.id);
    }, TRANSFER_LIFETIME);
    return { token: transfer.token, count: await Characters.find({ userId: source._id }).countAsync() };
  },

  async "characters.transferGuestCharacters"(token) {
    const transfer = await requireTransfer(this, token);
    return withCharacterSlots([transfer.sourceId, this.userId], async () => {
      await requireTransfer(this, token);
      if (transfer.completed) return { transferred: transfer.completed.length };
      const source = await Meteor.users.findOneAsync(transfer.sourceId);
      const destination = await Meteor.users.findOneAsync(this.userId);
      if (source?.profile?.guest !== true || source.profile.isPlaying || destination.profile?.isPlaying) {
        throw new Meteor.Error("guest-transfer-unavailable", "Return to the character screen before transferring characters.");
      }
      const sourceQuery = { userId: source._id };
      if (transfer.characterIds) sourceQuery._id = { $in: transfer.characterIds };
      const characters = await Characters.find(sourceQuery, { sort: { lastPlayedAt: -1, _id: 1 } }).fetchAsync();
      const count = await Characters.find({ userId: this.userId }).countAsync();
      if (count + characters.length > MAX_CHARACTERS) {
        throw new Meteor.Error("character-limit-reached", `Transfer would exceed the ${MAX_CHARACTERS} character limit. Free enough slots or keep the accounts separate.`);
      }
      // Retain the chosen IDs across retries if a later profile update fails.
      transfer.characterIds ||= characters.map((character) => character._id);
      transfer.selectedCharacterId ||= source.profile?.currentCharacterId;
      const sourceSelection = source.profile?.currentCharacterId;
      // Clear the source reference before moving documents, including on interrupted retries.
      if (sourceSelection && (transfer.characterIds.includes(sourceSelection) ||
        !await Characters.findOneAsync({ _id: sourceSelection, userId: source._id }))) {
        await Meteor.users.updateAsync({ _id: source._id, "profile.currentCharacterId": sourceSelection },
          { $set: { "profile.currentCharacterId": "", "profile.isPlaying": false } });
      }
      await Characters.updateAsync({ userId: source._id, _id: { $in: transfer.characterIds } },
        { $set: { userId: this.userId } }, { multi: true });
      const destinationSelection = destination.profile?.currentCharacterId;
      if (!destinationSelection || !await Characters.findOneAsync({ _id: destinationSelection, userId: this.userId })) {
        const preferred = transfer.selectedCharacterId && await Characters.findOneAsync({
          _id: transfer.selectedCharacterId, userId: this.userId,
        });
        const next = preferred || await Characters.findOneAsync({ userId: this.userId, _id: { $in: transfer.characterIds } },
          { sort: { lastPlayedAt: -1, _id: 1 } });
        await Meteor.users.updateAsync({ _id: this.userId, "profile.currentCharacterId": destinationSelection ?? { $exists: false } },
          { $set: { "profile.currentCharacterId": next?._id || "" } });
      }
      transfer.completed = transfer.characterIds;
      return { transferred: transfer.completed.length };
    });
  },

  async "characters.discardGuestTransfer"(token) {
    if (!transfers.has(this.connection?.id)) return { discarded: true };
    await requireTransfer(this, token);
    transfers.delete(this.connection.id);
    return { discarded: true };
  },
});
