import {
  Meteor,
} from "meteor/meteor";

import {
  ensureGuestUser,
} from "./guest";

export const bootstrapPlayer =
  async () => {
    await ensureGuestUser();

    const character =
      await Meteor.callAsync(
        "characters.ensureCurrent"
      );

    return character;
  };