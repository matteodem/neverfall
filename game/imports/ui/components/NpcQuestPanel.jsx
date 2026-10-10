import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../api/characters/characters";
import { getNpcQuests, getNpcQuestState, getQuestAcceptanceError } from "../../game/npcs/npcQuests";
import { useNpcStore } from "../stores/useNpcStore";
import { NpcQuestCard } from "./NpcQuestCard";

export const NpcQuestPanel = ({ npc }) => {
  const [showRewarded, setShowRewarded] = useState(false);
  const character = useTracker(() => {
    const id = Meteor.user()?.profile?.currentCharacterId;
    return id ? Characters.findOne(id) : null;
  });
  const pending = useNpcStore((state) => state.questPending);
  const error = useNpcStore((state) => state.questError);
  const request = useNpcStore((state) => state.requestQuestAction);
  const quests = getNpcQuests(npc).filter((quest) =>
    character && (character.currentLevel ?? 1) >= (quest.requiredLevel ?? 0));
  const hasRewarded = quests.some((quest) => getNpcQuestState(quest, character) === "rewarded");
  const visibleQuests = showRewarded ? quests : quests.filter((quest) => getNpcQuestState(quest, character) !== "rewarded");

  return <div className="mt-4 space-y-3">
    {hasRewarded && <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" className="toggle toggle-sm" checked={showRewarded}
        onChange={(event) => setShowRewarded(event.target.checked)} />
      Show rewarded quests
    </label>}
    {error && <p role="alert" className="text-sm text-error">{error}</p>}
    {visibleQuests.map((quest) => {
      const state = getNpcQuestState(quest, character);
      const acceptanceError = getQuestAcceptanceError({ character, quest, npc });
      const offer = state === "available" || (quest.repeatable && state === "rewarded");
      return <NpcQuestCard key={quest.id} quest={quest} character={character}>
        <p className="mt-2 text-xs opacity-70">{
          state === "available" ? "Could you help us?" : state === "active" ? "Come back when you have finished the objectives." :
            state === "completed" ? "You did it. Thank you!" : "Thanks again for your help."
        }</p>
        {offer && acceptanceError && <p className="mt-2 text-xs opacity-70">{acceptanceError}</p>}
        {(offer || state === "completed") && <button type="button"
          disabled={pending || !character || (offer && Boolean(acceptanceError))} className="btn btn-primary btn-sm mt-3"
          onClick={() => request(offer ? "accept" : "complete", npc.id, quest.id)}>
          {offer ? "Accept" : "Complete"}
        </button>}
      </NpcQuestCard>;
    })}
  </div>;
};
