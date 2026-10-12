import React from "react";
import { getNpcQuestState } from "../../game/npcs/npcQuests";
import { getQuestObjectiveDisplay } from "../../game/questObjectiveDisplay";
import { ITEM_NAMES } from "../../game/inventory";
import { FantasyBadge, FantasyPanel, FantasySectionHeader } from "./fantasy/FantasyUI";

const STATE_LABELS = { available: "Available", active: "Active", completed: "Ready to turn in", rewarded: "Rewarded" };

export const NpcQuestCard = ({ quest, character, children, fantasy = false }) => {
  const state = getNpcQuestState(quest, character);
  const display = getQuestObjectiveDisplay(quest, character?.questProgress?.[quest.id] || 0);
  const Panel = fantasy ? FantasyPanel : "div";
  const Heading = fantasy ? FantasySectionHeader : "h4";
  return <Panel className={fantasy ? "npc-quest-card fantasy-section text-sm" : "npc-quest-card rounded-lg border border-base-300 p-3 text-sm"}>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Heading className={fantasy ? "npc-quest-title fantasy-heading-inline" : "npc-quest-title font-semibold"}>{quest.title}</Heading>
      {fantasy ? <FantasyBadge className="npc-quest-status" tone={state === "completed" || state === "rewarded" ? "success" : "neutral"}>{STATE_LABELS[state]}</FantasyBadge>
        : <span className="npc-quest-status badge badge-sm">{STATE_LABELS[state]}</span>}
    </div>
    <p className={fantasy ? "mt-2 fantasy-muted" : "mt-2 opacity-80"}>{quest.description}</p>
    <ul className="mt-2 space-y-1">
      {display.steps.map((step) => <li key={step.number}>
        {step.completed ? "✓ " : ""}{step.label}: {step.count} / {step.total}
      </li>)}
    </ul>
    <p className="mt-2">Rewards: {quest.rewards.xp || 0} XP{quest.rewards.gold ? ` · ${quest.rewards.gold} Gold` : ""}
      {(quest.rewards.items || []).map(({ itemId, quantity = 1 }) => ` · ${ITEM_NAMES[itemId] || itemId} ×${quantity}`).join("")}
    </p>
    {state === "completed" && <p className="mt-2 text-success">Return to the quest giver to collect your rewards.</p>}
    {children}
  </Panel>;
};
