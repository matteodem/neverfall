import { Meteor } from "meteor/meteor";
import { isAnalyticsAdmin } from "../config/adminAnalytics";
import { WorldObjects } from "../../imports/api/worldObjects/worldObjects";
import { validateWorldObject, validateWorldObjectId } from "./worldObjectValidation";
import { WORLD_OBJECTS_SOURCE, readMongoWorldObjects, readWorldObjects } from "../worldObjectsSource";

// Clients may read snapshots, but every write must use an authorized method.
WorldObjects.deny({ insert: () => true, update: () => true, remove: () => true });
const requireAdmin = (userId) => {
  if (!isAnalyticsAdmin(userId)) throw new Meteor.Error("not-authorized");
};
const requireWriteAdmin = (userId) => {
  requireAdmin(userId);
  if (WORLD_OBJECTS_SOURCE === "json")
    throw new Meteor.Error("world-objects-read-only", "World Objects are read-only in JSON mode.");
};

Meteor.methods({
  "worldEditor.authorize"() {
    requireAdmin(this.userId);
    return true;
  },
  async "worldObjects.list"() {
    // World scenery is public; use a snapshot instead of live editing subscriptions.
    return { source: WORLD_OBJECTS_SOURCE, readOnly: WORLD_OBJECTS_SOURCE === "json", objects: await readWorldObjects() };
  },
  async "worldObjects.export"() {
    requireAdmin(this.userId);
    return `${JSON.stringify(await readMongoWorldObjects(), null, 2)}\n`;
  },
  async "worldObjects.create"(data) {
    requireWriteAdmin(this.userId);
    const object = validateWorldObject(data);
    const _id = await WorldObjects.insertAsync(object);
    return { _id, ...object };
  },
  async "worldObjects.update"(id, data) {
    requireWriteAdmin(this.userId);
    const _id = validateWorldObjectId(id);
    const object = validateWorldObject(data);
    if (!await WorldObjects.updateAsync({ _id }, { $set: object }))
      throw new Meteor.Error("world-object-not-found", "This world object no longer exists.");
    return { _id, ...object };
  },
  async "worldObjects.delete"(id) {
    requireWriteAdmin(this.userId);
    const _id = validateWorldObjectId(id);
    if (!await WorldObjects.removeAsync({ _id }))
      throw new Meteor.Error("world-object-not-found", "This world object no longer exists.");
    return true;
  },
});
