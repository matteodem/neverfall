import { Mongo } from "meteor/mongo";

// Editor-created overworld objects only; procedural scenery remains in code.
export const WorldObjects = new Mongo.Collection("worldObjects");
