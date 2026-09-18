import {
  Meteor,
} from "meteor/meteor";

import "./methods/colyseusAuth";

import {
  startColyseus,
} from "./colyseus";

Meteor.startup(
  async () => {
    await startColyseus();
  }
);