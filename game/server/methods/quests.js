import { Meteor } from "meteor/meteor";
import { Characters } from "../../imports/api/characters/characters";
import { getTrackedQuest } from "../../imports/game/npcs/npcQuests";
import { withQuestUpdate } from "../quests";

Meteor.methods({
  async "quests.track"(characterId, questId) {
    if (!this.userId) throw new Meteor.Error("not-authorized");
    if (typeof characterId !== "string" || (questId !== null && typeof questId !== "string")) {
      throw new Meteor.Error("invalid-quest");
    }
    await withQuestUpdate(characterId, async () => {
      const character = await Characters.findOneAsync({ _id: characterId, userId: this.userId });
      if (!character) throw new Meteor.Error("character-not-found");
      if (questId !== null && !getTrackedQuest({ ...character, trackedQuestId: questId })) {
        throw new Meteor.Error("invalid-quest", "Only active or ready-to-turn-in quests can be tracked.");
      }
      await Characters.updateAsync({ _id: characterId, userId: this.userId }, {
        $set: { trackedQuestId: questId },
      });
    });
  },
});
