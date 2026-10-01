import { Characters } from "../imports/api/characters/characters";
import { ACHIEVEMENTS } from "../imports/game/achievements";

export const trackAchievements = async (characterId, event, value) => {
  try {
    for (const definition of ACHIEVEMENTS) {
      if (definition.event !== event ||
        (definition.enemyType && definition.enemyType !== value) ||
        (definition.targetId && definition.targetId !== value)) continue;
      const path = `achievements.${definition.id}`;
      // Compare-and-set keeps concurrent kills from losing progress or unlocking twice.
      while (true) {
        const character = await Characters.findOneAsync(characterId);
        if (!character) break;
        const previous = character.achievements?.[definition.id];
        if (previous?.unlocked) break;
        const progress = Math.min(definition.target, event === "level"
          ? Math.max(previous?.progress || 0, value)
          : (previous?.progress || 0) + 1);
        if (progress === previous?.progress) break;
        const updated = await Characters.updateAsync(
          { _id: characterId, [path]: previous || { $exists: false } },
          { $set: { [path]: { progress, unlocked: progress >= definition.target } } }
        );
        if (updated) break;
      }
    }
  } catch (error) {
    console.error("[Achievements] Failed to save progress", error);
  }
};
