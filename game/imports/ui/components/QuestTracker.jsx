import React from "react";

import {
  HUNT_QUESTS,
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
};

export const QuestTracker =
  () => {
    const area = useQuestStore((state) => state.area);
    const kills = useQuestStore((state) => state[KILL_FIELDS[area]] ?? 0);
    const quest = HUNT_QUESTS[area];
    if (!quest) return null;

    return (
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
    );
  };
