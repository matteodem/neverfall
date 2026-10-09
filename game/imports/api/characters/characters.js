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

  appearance: {
    head: "head-01", hair: "hair-51", skinTone: "medium", bodyType: "medium", gender: "female",
    outfit: { torso: "torso-01", arms: "arms-01", hands: "hands-01", legs: "legs-01", feet: "feet-01" },
    equipment: { hat: null, glasses: null, mask: null, leftHand: null, rightHand: null, back: null }
  },

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
