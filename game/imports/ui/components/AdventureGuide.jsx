import React from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../api/characters/characters";
import { getAdventureGuideObjective } from "../../game/adventureGuide";

export const AdventureGuide = () => {
  const character = useTracker(() => {
    const id = Meteor.user()?.profile?.currentCharacterId;
    return id ? Characters.findOne(id) : null;
  });
  if (!character) return null;
  const objective = getAdventureGuideObjective(character);

  return (
    <div id="onboarding-adventure-guide" className="w-64 rounded-lg border border-white/10 bg-black/60 p-4 text-white shadow-lg" role="status">
      <div className="text-xs font-semibold uppercase text-yellow-300">Adventure Guide</div>
      <div className="mt-1 font-bold">{objective.title}</div>
      {objective?.progress && <div className="mt-1 text-sm text-white/70">{objective.progress}</div>}
      {objective?.hint && <div className="mt-1 text-xs text-white/60">{objective.hint}</div>}
    </div>
  );
};
