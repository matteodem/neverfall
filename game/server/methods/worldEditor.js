import { Meteor } from "meteor/meteor";
import { isAnalyticsAdmin } from "../config/adminAnalytics";

// Reuse the existing server-only admin allowlist. Step 1 stores no world data.
Meteor.methods({
  "worldEditor.authorize"() {
    if (!isAnalyticsAdmin(this.userId)) throw new Meteor.Error("not-authorized");
    return true;
  },
});
