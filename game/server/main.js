import { initializeChat } from "./chat";
import { initializeGuilds } from "./guilds";
import { initializeInventories } from "./inventory/users";
import { initializeGameSessions } from "./analytics/gameSessions";
import {
  Meteor,
} from "meteor/meteor";

import "./methods/colyseusAuth";
import "./methods/characters";
import "./methods/guestCharacters";
import "./methods/shop";
import "./methods/inventory";
import "./methods/crafting";
import "./methods/onboarding";
import "./methods/quests";
import "./methods/feedback";
import "./methods/analytics";
import "./methods/worldEditor";

import "./publications/characters";

import {
  startColyseus,
} from "./colyseus";

Meteor.startup(
  async () => {
    await initializeInventories();
    await initializeChat();
    await initializeGuilds();
    initializeGameSessions();
    await startColyseus();
  }
);
