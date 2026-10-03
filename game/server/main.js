import { initializeChat } from "./chat";
import { initializeGuilds } from "./guilds";
import { initializeInventories } from "./inventory/users";
import {
  Meteor,
} from "meteor/meteor";

import "./methods/colyseusAuth";
import "./methods/characters";
import "./methods/shop";
import "./methods/onboarding";

import "./publications/characters";

import {
  startColyseus,
} from "./colyseus";

Meteor.startup(
  async () => {
    await initializeInventories();
    await initializeChat();
    await initializeGuilds();
    await startColyseus();
  }
);
