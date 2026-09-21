import {
  Meteor,
} from "meteor/meteor";

import {
  Characters,
} from "../../imports/api/characters/characters";

Meteor.publish(
  "characters.mine",
  function () {
    if (!this.userId) {
      return this.ready();
    }

    return Characters.find({
      userId:
        this.userId,
    });
  }
);