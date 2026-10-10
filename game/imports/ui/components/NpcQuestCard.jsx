import React from "react";
import { getNpcQuestState } from "../../game/npcs/npcQuests";
import { getQuestObjectiveDisplay } from "../../game/questObjectiveDisplay";

const STATE_LABELS = { available: "Available", active: "Active", completed: "Ready to turn in", rewarded: "Rewarded" };

export const NpcQuestCard = ({ quest, character, children }) => {
  const state = getNpcQuestState(quest, character);
  const display = getQuestObjectiveDisplay(quest, character?.questProgress?.[quest.id] || 0);
  return <div className="rounded-lg border border-base-300 p-3 text-sm">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h4 className="font-semibold">{quest.title}</h4>
      <span className="badge badge-sm">{STATE_LABELS[state]}</span>
    </div>
    <p className="mt-2 opacity-80">{quest.description}</p>
    <ul className="mt-2 space-y-1">
      {display.steps.map((step) => <li key={step.number}>
        {step.completed ? "✓ " : ""}{step.label}: {step.count} / {step.total}
      </li>)}
    </ul>
    <p className="mt-2">Rewards: {quest.rewards.xp || 0} XP{quest.rewards.gold ? ` · ${quest.rewards.gold} Gold` : ""}</p>
    {state === "completed" && <p className="mt-2 text-success">Return to the quest giver to collect your rewards.</p>}
    {children}
  </div>;
};
