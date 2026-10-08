import {
  Mongo,
} from "meteor/mongo";

export const MAX_CHARACTERS = 5;

/**
 * Data looks like following: 
 * 
{
  _id: "abc123",

  userId: "meteorUserId",

  name: "guest-XYZ",
  nameLower: "guest-xyz",

  species: "human",

  gameClass: "warrior",

  currentLevel: 1,
  currentXp: 0,

  inventory: { items: [] },

  lootedCacheIds: [],

  selectedTitle: null,

  assetFile:
    "/models/player.glb",

  lastPlayedAt:
    new Date()
}
 */

export const Characters =
  new Mongo.Collection(
    "characters"
  );
