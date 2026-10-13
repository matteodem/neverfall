import { FantasyBadge, FantasyHudCard, FantasySectionHeader } from "./fantasy/FantasyUI";
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
    <FantasyHudCard className="fantasy-tracker pointer-events-none w-64 max-w-[calc(100vw-2rem)]">
      <FantasySectionHeader className="fantasy-hud-heading">Quest</FantasySectionHeader>
      <div className="mt-1 text-sm font-bold">{quest.title}</div>
      {finished ? <>
        <FantasyBadge tone="success" className="mt-1">✓ Finished</FantasyBadge>
        <p className="text-xs fantasy-muted">Return to {giver?.name || "Quest-Giver"}</p>
      </> : current && <>
        <p className="mt-1 text-xs fantasy-muted">
          {current.label}{current.total > 1 ? `: ${current.count} / ${current.total}` : ""}
        </p>
        {display.steps.length > 1 && <p className="text-xs fantasy-muted">Step {current.number} / {display.steps.length}</p>}
      </>}
    </FantasyHudCard>
  );
};
