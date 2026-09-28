import { Meteor } from "meteor/meteor";

Meteor.methods({
  async "onboarding.complete"() {
    if (!this.userId) throw new Meteor.Error("not-authorized");
    await Meteor.users.updateAsync(this.userId, {
      $set: { "profile.onboardingCompleted": true },
    });
  },
});
