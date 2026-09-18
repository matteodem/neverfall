import {
  Meteor,
} from "meteor/meteor";

import {
  startColyseus,
} from "./colyseus";

Meteor.startup(
  async () => {
    await startColyseus();
  }
);