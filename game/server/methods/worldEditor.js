import { Meteor } from "meteor/meteor";
import { isAnalyticsAdmin } from "../config/adminAnalytics";
import { WorldObjects } from "../../imports/api/worldObjects/worldObjects";
import { validateWorldObject, validateWorldObjectId } from "./worldObjectValidation";

// Clients may read snapshots, but every write must use an authorized method.
WorldObjects.deny({ insert: () => true, update: () => true, remove: () => true });
const requireAdmin = (userId) => {
  if (!isAnalyticsAdmin(userId)) throw new Meteor.Error("not-authorized");
};

Meteor.methods({
  "worldEditor.authorize"() {
    requireAdmin(this.userId);
    return true;
  },
  async "worldObjects.list"() {
    // World scenery is public; use a snapshot instead of live editing subscriptions.
    return WorldObjects.find({}, { fields: { assetId: 1, position: 1, rotation: 1, scaling: 1 } }).fetchAsync();
  },
  async "worldObjects.create"(data) {
    requireAdmin(this.userId);
    const object = validateWorldObject(data);
    const _id = await WorldObjects.insertAsync(object);
    return { _id, ...object };
  },
  async "worldObjects.update"(id, data) {
    requireAdmin(this.userId);
    const _id = validateWorldObjectId(id);
    const object = validateWorldObject(data);
    if (!await WorldObjects.updateAsync({ _id }, { $set: object }))
      throw new Meteor.Error("world-object-not-found", "This world object no longer exists.");
    return { _id, ...object };
  },
  async "worldObjects.delete"(id) {
    requireAdmin(this.userId);
    const _id = validateWorldObjectId(id);
    if (!await WorldObjects.removeAsync({ _id }))
      throw new Meteor.Error("world-object-not-found", "This world object no longer exists.");
    return true;
  },
});
