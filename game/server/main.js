import { initializeInventories } from "./inventory/users";
import {
  Meteor,
} from "meteor/meteor";

import "./methods/colyseusAuth";
import "./methods/characters";

import "./publications/characters";

import {
  startColyseus,
} from "./colyseus";

Meteor.startup(
  async () => {
    await initializeInventories();
    await startColyseus();
  }
);