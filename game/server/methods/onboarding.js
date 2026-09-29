import { Meteor } from "meteor/meteor";
import { Characters } from "../../imports/api/characters/characters";

Meteor.methods({
  async "onboarding.complete"() {
    if (!this.userId) throw new Meteor.Error("not-authorized");
    await Meteor.users.updateAsync(this.userId, {
      $set: { "profile.onboardingCompleted": true },
    });
  },
  async "adventureGuide.openMap"() {
    if (!this.userId) throw new Meteor.Error("not-authorized");
    const user = await Meteor.users.findOneAsync(this.userId);
    const characterId = user?.profile?.currentCharacterId;
    if (!characterId) return;
    await Characters.updateAsync({ _id: characterId, userId: this.userId }, {
      $set: { "adventureGuide.openedMap": true },
    });
  },
});
