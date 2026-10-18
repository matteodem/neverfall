import { Meteor } from "meteor/meteor";
import { WorldObjects } from "../imports/api/worldObjects/worldObjects";
import { validateWorldObjectSnapshot } from "./methods/worldObjectValidation";

// This is the only environment/default selection. Return only the safe source name
// to clients, never process.env or private admin configuration.
export const WORLD_OBJECTS_SOURCE = process.env.WORLD_OBJECTS_SOURCE ??
  (Meteor.isDevelopment ? "mongodb" : "json");
if (!["mongodb", "json"].includes(WORLD_OBJECTS_SOURCE))
  throw new Error("WORLD_OBJECTS_SOURCE must be 'mongodb' or 'json'.");

// Meteor bundles private/world as server-only assets, including on Render.
export const readJsonWorldObjects = async () => {
  try {
    const text = await Assets.getTextAsync("world/world-objects.json");
    return validateWorldObjectSnapshot(JSON.parse(text));
  } catch {
    throw new Meteor.Error("invalid-world-objects-json", "Could not load or validate game/private/world/world-objects.json. Expected an array of objects with unique stable IDs and valid assetId, position, rotation and scaling.");
  }
};

let jsonObjects = null;
export const invalidateWorldObjectsJsonCache = () => { jsonObjects = null; };
const readJsonObjects = () => jsonObjects ||= readJsonWorldObjects().catch((error) => {
  jsonObjects = null;
  throw error;
});

export const readMongoWorldObjects = async () => validateWorldObjectSnapshot(await WorldObjects.find({}, {
  fields: { assetId: 1, position: 1, rotation: 1, scaling: 1 },
}).fetchAsync());

export const readWorldObjects = () => WORLD_OBJECTS_SOURCE === "json"
  ? readJsonObjects() : readMongoWorldObjects();
