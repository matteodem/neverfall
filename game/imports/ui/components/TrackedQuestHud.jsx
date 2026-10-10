import React from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../api/characters/characters";
import { getTrackedQuest, getNpcQuestState } from "../../game/npcs/npcQuests";
import { NPC_DEFINITIONS } from "../../game/npcs/npcDefinitions";
import { getQuestObjectiveDisplay } from "../../game/questObjectiveDisplay";

export const TrackedQuestHud = () => {
  const character = useTracker(() => {
    const id = Meteor.user()?.profile?.currentCharacterId;
    return id ? Characters.findOne(id) : null;
  });
  const quest = getTrackedQuest(character);
  if (!quest) return null;
  const finished = getNpcQuestState(quest, character) === "completed";
  const giver = NPC_DEFINITIONS.find((npc) => npc.offeredQuestIds?.includes(quest.id));
  const display = getQuestObjectiveDisplay(quest, character.questProgress?.[quest.id] || 0);
  const current = display.current;
  return (
    <div className="pointer-events-none w-64 max-w-[calc(100vw-2rem)] rounded-lg border border-white/10 bg-black/60 p-3 text-white shadow-lg">
      <div className="text-xs font-semibold uppercase text-yellow-300">Quest</div>
      <div className="mt-1 text-sm font-bold">{quest.title}</div>
      {finished ? <>
        <p className="mt-1 text-sm text-green-300">✓ Finished</p>
        <p className="text-xs text-white/80">Return to {giver?.name || "Quest-Giver"}</p>
      </> : current && <>
        <p className="mt-1 text-xs text-white/80">
          {current.label}{current.total > 1 ? `: ${current.count} / ${current.total}` : ""}
        </p>
        {display.steps.length > 1 && <p className="text-xs text-white/60">Step {current.number} / {display.steps.length}</p>}
      </>}
    </div>
  );
};
