import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { initializeCharacterInventories } from "./characters";

Accounts.onCreateUser((options, user) => {
  user.profile = {
    ...options.profile,
    inventory: { money: 0 },
  };
  return user;
});

// Accounts normally lets clients edit profile, including nested fields.
Meteor.users.deny({
  update: (_userId, _user, fields) => fields.some(
    (field) => field === "profile" || field.startsWith("profile.")
  ),
});

export const initializeInventories = async () => {
  await Meteor.users.updateAsync(
    { "profile.inventory.money": { $exists: false } },
    { $set: { "profile.inventory.money": 0 } },
    { multi: true }
  );
  await initializeCharacterInventories();
};
