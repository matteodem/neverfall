import React from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../api/characters/characters";
import { NPC_QUESTS, getNpcQuestState } from "../../game/npcs/npcQuests";
import { useNpcStore } from "../stores/useNpcStore";
import { NpcQuestCard } from "./NpcQuestCard";

export const NpcQuestPanel = ({ npc }) => {
  const character = useTracker(() => {
    const id = Meteor.user()?.profile?.currentCharacterId;
    return id ? Characters.findOne(id) : null;
  });
  const pending = useNpcStore((state) => state.questPending);
  const error = useNpcStore((state) => state.questError);
  const request = useNpcStore((state) => state.requestQuestAction);
  const quests = NPC_QUESTS.filter((quest) => quest.giverNpcId === npc.id);

  return <div className="mt-4 space-y-3">
    {error && <p role="alert" className="text-sm text-error">{error}</p>}
    {quests.map((quest) => {
      const state = getNpcQuestState(quest, character);
      return <NpcQuestCard key={quest.id} quest={quest} character={character}>
        <p className="mt-2 text-xs opacity-70">{
          state === "available" ? "Could you help us?" : state === "active" ? "Come back when you have finished the objectives." :
            state === "completed" ? "You did it. Thank you!" : "Thanks again for your help."
        }</p>
        {(state === "available" || state === "completed") && <button type="button"
          disabled={pending || !character} className="btn btn-primary btn-sm mt-3"
          onClick={() => request(state === "available" ? "accept" : "complete", npc.id, quest.id)}>
          {state === "available" ? "Accept" : "Complete"}
        </button>}
      </NpcQuestCard>;
    })}
  </div>;
};
