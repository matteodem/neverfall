import { Meteor } from "meteor/meteor";
import { WorldObjects } from "../imports/api/worldObjects/worldObjects";
import bundledWorldObjects from "../imports/api/worldObjects/world-objects.json";
import { validateWorldObjectSnapshot } from "./methods/worldObjectValidation";

// This is the only environment/default selection. Return only the safe source name
// to clients, never process.env or private admin configuration.
export const WORLD_OBJECTS_SOURCE = process.env.WORLD_OBJECTS_SOURCE ??
  (Meteor.isDevelopment ? "mongodb" : "json");
if (!["mongodb", "json"].includes(WORLD_OBJECTS_SOURCE))
  throw new Error("WORLD_OBJECTS_SOURCE must be 'mongodb' or 'json'.");

// A static import makes this file a server bundle dependency, including on Render.
// Missing/malformed JSON fails the build; invalid records fail startup with this error.
export const readJsonWorldObjects = () => validateWorldObjectSnapshot(bundledWorldObjects);
let jsonObjects = null;
if (WORLD_OBJECTS_SOURCE === "json") {
  try {
    jsonObjects = readJsonWorldObjects();
  } catch {
    throw new Error("Invalid game/imports/api/worldObjects/world-objects.json: expected an array of objects with unique stable IDs and valid assetId, position, rotation and scaling.");
  }
}

export const readMongoWorldObjects = async () => validateWorldObjectSnapshot(await WorldObjects.find({}, {
  fields: { assetId: 1, position: 1, rotation: 1, scaling: 1 },
}).fetchAsync());

export const readWorldObjects = () => WORLD_OBJECTS_SOURCE === "json"
  ? jsonObjects : readMongoWorldObjects();
