import React from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../../api/characters/characters";
import { HUNT_QUESTS, QUESTS } from "../../../game/quests";
import { useQuestStore } from "../../stores/useQuestStore";
import { HudModal } from "../HudModal";

const storyQuests = QUESTS.filter((quest) => !quest.repeatable);

const QuestList = ({ quests, progress }) => (
  <div className="space-y-2">
    {quests.map((quest) => {
      const count = Math.min(progress[quest.id] || 0, quest.objective.amount);
      return (
        <div key={quest.id} className={`rounded-lg border p-3 text-sm ${quest.nearby ? "border-blue-600 bg-blue-600 text-white" : "border-base-300"}`}>
          <div className="font-semibold">{quest.title}{quest.nearby ? " · Nearby" : ""}</div>
          <div className="opacity-70">{quest.description}</div>
          <div className={`mt-1 text-xs ${quest.nearby ? "text-white" : "text-primary"}`}>
            {count >= quest.objective.amount && !quest.repeatable ? "Completed" : `${count} / ${quest.objective.amount}`}
            {quest.repeatable ? " · Repeatable" : ""}
          </div>
        </div>
      );
    })}
  </div>
);

export const QuestsModal = ({ embedded = false }) => {
  const area = useQuestStore((state) => state.area);
  const progress = useTracker(() => {
    const id = Meteor.user()?.profile?.currentCharacterId;
    return id ? Characters.findOne(id)?.questProgress || {} : {};
  });
  const active = storyQuests.filter((quest) => (progress[quest.id] || 0) < quest.objective.amount);
  const completed = storyQuests.filter((quest) => (progress[quest.id] || 0) >= quest.objective.amount);
  const hunts = Object.entries(HUNT_QUESTS).sort(([a], [b]) => (a === area ? -1 : b === area ? 1 : 0))
    .map(([type, quest]) => ({ ...quest, objective: { amount: quest.target }, nearby: type === area }));

  return (
    <HudModal id="quests" title="Quests" embedded={embedded} maxHeight="calc(var(--game-height, 100vh) * 0.5)">
      <section>
        <h4 className="mb-2 font-bold">Active Quests</h4>
        <QuestList quests={active} progress={progress} />
      </section>
      <section className="mt-5">
        <h4 className="mb-2 font-bold">Hunts (Repeatable)</h4>
        <QuestList quests={hunts} progress={progress} />
      </section>
      {completed.length > 0 && <section className="mt-5">
        <h4 className="mb-2 font-bold">Completed Quests</h4>
        <QuestList quests={completed} progress={progress} />
      </section>}
    </HudModal>
  );
};
