import React from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../api/characters/characters";
import { getDevice } from "../hooks/useMobileDevice";

import {
  HUNT_QUESTS,
  QUESTS,
} from "../../game/quests";

import {
  useQuestStore,
} from "../stores/useQuestStore";

const KILL_FIELDS = {
  boar: "boarKills",
  wolf: "wolfKills",
  forestGiant: "giantKills",
  goat: "goatKills",
  rat: "ratKills",
  bee: "beeKills",
  seal: "sealKills",
};

const STORY_QUESTS = QUESTS.filter((quest) => !quest.repeatable);

export const QuestTracker =
  () => {
    const [questLogOpen, setQuestLogOpen] = React.useState(() => !getDevice().mobile);
    const area = useQuestStore((state) => state.area);
    const kills = useQuestStore((state) => state[KILL_FIELDS[area]] ?? 0);
    const quest = HUNT_QUESTS[area];
    const progress = useTracker(() => {
      const id = Meteor.user()?.profile?.currentCharacterId;
      return id ? Characters.findOne(id)?.questProgress || {} : {};
    }, []);
    const isCompleted = (entry) => (progress[entry.id] || 0) >= entry.objective.amount;
    const orderedQuests = [
      ...STORY_QUESTS.filter((entry) => !isCompleted(entry)),
      ...STORY_QUESTS.filter(isCompleted),
    ];

    return (
      <>
      {quest && (
      <div className="w-64 rounded-lg border border-white/10 bg-black/50 p-4 text-white shadow-lg">
        <div className="font-bold">
          {
            quest.title
          }
        </div>

        <div className="mt-1 text-sm text-white/70">
          {quest.description}
        </div>

        <div className="mt-2 font-semibold">
          {kills}
          {" / "}
          {
            quest.target
          }
        </div>

        <div className="mt-1 text-xs text-yellow-300">
          Reward:{" "}
          {
            quest.rewardXp
          }{" "}
          XP
        </div>

        <div className="mt-1 text-xs text-white/40">
          Repeatable
        </div>
      </div>
      )}
      <details id="onboarding-quests" open={questLogOpen}
        onToggle={(event) => setQuestLogOpen(event.currentTarget.open)}
        className="w-64 rounded-lg border border-white/10 bg-black/50 p-3 text-white shadow-lg">
        <summary className="cursor-pointer font-bold">Quest Log</summary>
        <div className="quest-log-list mt-2 max-h-60 space-y-2 overflow-y-auto text-sm">
          {orderedQuests.map((entry) => {
            const amount = entry.objective.amount;
            const count = Math.min(progress[entry.id] || 0, amount);
            return (
              <div key={entry.id} className="border-t border-white/10 pt-2">
                <div className="font-semibold">{entry.title}</div>
                <div className="text-white/70">{entry.description}</div>
                <div className="text-yellow-300">
                  {count >= amount ? "Completed" : `${count} / ${amount}`}
                </div>
              </div>
            );
          })}
        </div>
      </details>
      </>
    );
  };
