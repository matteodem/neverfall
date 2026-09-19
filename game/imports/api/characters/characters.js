import { Meteor } from "meteor/meteor";
import {
  Mongo,
} from "meteor/mongo";

/**
 * Data looks like following: 
 * 
{
  _id: "abc123",

  userId: "meteorUserId",

  name: "guest-XYZ",

  species: "human",

  gameClass: "warrior",

  currentLevel: 1,
  currentXp: 0,

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