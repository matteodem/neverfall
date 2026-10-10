import React from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../../api/characters/characters";
import { QUESTS } from "../../../game/quests";
import { getQuestObjectiveDisplay } from "../../../game/questObjectiveDisplay";
import { HudModal } from "../HudModal";
import { NPC_QUESTS, getNpcQuestState } from "../../../game/npcs/npcQuests";
import { NpcQuestCard } from "../NpcQuestCard";

const storyQuests = QUESTS.filter((quest) => !quest.repeatable && !quest.giverNpcId);

export const QuestList = ({ quests, progress }) => (
  <div className="space-y-2">
    {quests.map((quest) => {
      const display = getQuestObjectiveDisplay(quest, progress[quest.id] || 0);
      return (
        <div key={quest.id} className={`rounded-lg border p-3 text-sm ${quest.nearby ? "border-blue-600 bg-blue-600 text-white" : "border-base-300"}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-semibold">{quest.title}{quest.nearby ? " · Nearby" : ""}</div>
            <span className={`rounded px-2 py-1 text-xs font-semibold ${quest.nearby ? "bg-white/20" : "bg-base-200"}`}>
              {display.completed ? "✓ Completed" : `${display.count} / ${display.total}`}
            </span>
          </div>
          {display.current && <div className="mt-2">
            {quest.objectives && <div className="text-xs opacity-70">Next · Step {display.current.number} / {display.steps.length}</div>}
            <div className="font-medium">{display.current.label}</div>
            {quest.objectives && display.current.total > 1 && <div className="text-xs font-semibold">
              {display.current.count} / {display.current.total}
            </div>}
          </div>}
          <details className="mt-2 text-xs">
            <summary className="cursor-pointer py-1 font-semibold">Details{quest.repeatable ? " · Repeatable" : ""}</summary>
            {(quest.objectives || display.completed) && <p className="mt-1 opacity-70">{quest.description}</p>}
            {quest.recommendedLevel && <div className="mt-1 opacity-70">Recommended Level {quest.recommendedLevel}</div>}
            {quest.objectives && <ol className="mt-2 list-decimal space-y-1 pl-5">
              {display.steps.map((step) => <li key={step.number}
                className={step.completed ? "opacity-60" : step.number === display.current?.number ? "font-semibold" : "opacity-70"}>
                {step.label}{step.completed ? " ✓" : step.total > 1 ? ` (${step.count} / ${step.total})` : ""}
              </li>)}
            </ol>}
            {quest.objectives && <div className="mt-2 opacity-70">
              Rewards: {quest.rewards.xp} XP{quest.rewards.gold ? ` · ${quest.rewards.gold} Gold` : ""}
            </div>}
          </details>
        </div>
      );
    })}
  </div>
);

export const QuestsModal = ({ embedded = false }) => {
  const character = useTracker(() => {
    const id = Meteor.user()?.profile?.currentCharacterId;
    return id ? Characters.findOne(id) : null;
  });
  const progress = character?.questProgress || {};
  const npcActive = NPC_QUESTS.filter((quest) => ["active", "completed"].includes(getNpcQuestState(quest, character)));
  const npcRewarded = NPC_QUESTS.filter((quest) => getNpcQuestState(quest, character) === "rewarded");
  const active = storyQuests.filter((quest) => (progress[quest.id] || 0) < quest.objective.amount);
  const completed = storyQuests.filter((quest) => (progress[quest.id] || 0) >= quest.objective.amount);
  return (
    <HudModal id="quests" title="Quests" embedded={embedded} maxHeight="calc(var(--game-height, 100vh) * 0.5)">
      <section>
        <h4 className="mb-2 font-bold">Active Quests</h4>
        <div className="mb-2 space-y-2">{npcActive.map((quest) =>
          <NpcQuestCard key={quest.id} quest={quest} character={character} />)}</div>
        <QuestList quests={active} progress={progress} />
      </section>
      {(completed.length > 0 || npcRewarded.length > 0) && <section className="mt-5">
        <h4 className="mb-2 font-bold">Completed Quests</h4>
        <div className="mb-2 space-y-2">{npcRewarded.map((quest) =>
          <NpcQuestCard key={quest.id} quest={quest} character={character} />)}</div>
        <QuestList quests={completed} progress={progress} />
      </section>}
    </HudModal>
  );
};
