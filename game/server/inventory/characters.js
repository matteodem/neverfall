import { Meteor } from "meteor/meteor";
import { Characters } from "../../imports/api/characters/characters";

export const migrateUserItems = async (userId) => {
  const user = await Meteor.users.findOneAsync(userId);
  const items = user?.profile?.inventory?.items;
  if (!Array.isArray(items)) return;

  if (items.length) {
    // The marker makes a restart between copying and removing items safe.
    const migrated = await Characters.findOneAsync({
      userId,
      "inventory.legacyItemsMigrated": true,
    });
    if (!migrated) {
      const selected = user.profile.currentCharacterId;
      const character = (selected && await Characters.findOneAsync({ _id: selected, userId })) ||
        await Characters.findOneAsync({ userId }, { sort: { lastPlayedAt: -1, _id: 1 } });
      // Keep legacy items until the user has a character to receive them.
      if (!character) return;

      const updated = await Characters.updateAsync(
        { _id: character._id, userId, "inventory.legacyItemsMigrated": { $ne: true } },
        {
          $push: { "inventory.items": { $each: items } },
          $set: { "inventory.legacyItemsMigrated": true },
        }
      );
      if (!updated) return;
    }
  }

  await Meteor.users.updateAsync(userId, { $unset: { "profile.inventory.items": "" } });
};

export const initializeCharacterInventories = async () => {
  await Characters.updateAsync(
    { "inventory.items": { $exists: false } },
    { $set: { "inventory.items": [] } },
    { multi: true }
  );
  const users = await Meteor.users.find(
    { "profile.inventory.items": { $exists: true } },
    { fields: { _id: 1 } }
  ).fetchAsync();
  for (const user of users) await migrateUserItems(user._id);
};
