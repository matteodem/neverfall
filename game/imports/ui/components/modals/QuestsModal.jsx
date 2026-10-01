import React from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../../api/characters/characters";
import { QUESTS } from "../../../game/quests";
import { HudModal } from "../HudModal";

const storyQuests = QUESTS.filter((quest) => !quest.repeatable);

export const QuestList = ({ quests, progress }) => (
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
  const progress = useTracker(() => {
    const id = Meteor.user()?.profile?.currentCharacterId;
    return id ? Characters.findOne(id)?.questProgress || {} : {};
  });
  const active = storyQuests.filter((quest) => (progress[quest.id] || 0) < quest.objective.amount);
  const completed = storyQuests.filter((quest) => (progress[quest.id] || 0) >= quest.objective.amount);
  return (
    <HudModal id="quests" title="Quests" embedded={embedded} maxHeight="calc(var(--game-height, 100vh) * 0.5)">
      <section>
        <h4 className="mb-2 font-bold">Active Quests</h4>
        <QuestList quests={active} progress={progress} />
      </section>
      {completed.length > 0 && <section className="mt-5">
        <h4 className="mb-2 font-bold">Completed Quests</h4>
        <QuestList quests={completed} progress={progress} />
      </section>}
    </HudModal>
  );
};
