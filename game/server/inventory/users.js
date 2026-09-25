import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";

Accounts.onCreateUser((options, user) => {
  user.profile = {
    ...options.profile,
    inventory: { money: 0, items: [] },
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
  for (const [field, value] of [["money", 0], ["items", []]]) {
    const path = `profile.inventory.${field}`;
    await Meteor.users.updateAsync(
      { [path]: { $exists: false } },
      { $set: { [path]: value } },
      { multi: true }
    );
  }
};
