import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../api/characters/characters";
import { getNpcQuests, getNpcQuestState, getQuestAcceptanceError, isQuestAvailable } from "../../game/npcs/npcQuests";
import { useNpcStore } from "../stores/useNpcStore";
import { NpcQuestCard } from "./NpcQuestCard";
import { FantasyButton, FantasySectionHeader } from "./fantasy/FantasyUI";

export const NpcQuestPanel = ({ npc, fantasy = false }) => {
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

  const Action = fantasy ? FantasyButton : "button";
  return <div className={fantasy ? "fantasy-stack" : "mt-4 space-y-3"}>
    {fantasy && visibleQuests.length > 0 && <FantasySectionHeader as="h3" className="fantasy-heading-inline">Quests</FantasySectionHeader>}
    {hasRewarded && <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" className="toggle toggle-sm" checked={showRewarded}
        onChange={(event) => setShowRewarded(event.target.checked)} />
      Show rewarded quests
    </label>}
    {error && <p role="alert" className={fantasy ? "text-sm fantasy-danger" : "text-sm text-error"}>{error}</p>}
    {visibleQuests.map((quest) => {
      const state = getNpcQuestState(quest, character);
      const acceptanceError = getQuestAcceptanceError({ character, quest, npc });
      const offer = isQuestAvailable(quest, character);
      return <NpcQuestCard key={quest.id} quest={quest} character={character} fantasy={fantasy}>
        <p className={fantasy ? "mt-2 text-xs fantasy-muted" : "mt-2 text-xs opacity-70"}>{
          state === "available" ? "Could you help us?" : state === "active" ? "Come back when you have finished the objectives." :
            state === "completed" ? "You did it. Thank you!" : "Thanks again for your help."
        }</p>
        {offer && acceptanceError && <p className={fantasy ? "mt-2 text-xs fantasy-danger" : "mt-2 text-xs opacity-70"}>{acceptanceError}</p>}
        {(offer || state === "completed") && <Action type="button"
          disabled={pending || !character || (offer && Boolean(acceptanceError))}
          className={fantasy ? "btn-sm mt-3" : "btn btn-primary btn-sm mt-3"}
          onClick={() => request(offer ? "accept" : "complete", npc.id, quest.id)}>
          {offer ? "Accept" : "Complete"}
        </Action>}
      </NpcQuestCard>;
    })}
  </div>;
};
