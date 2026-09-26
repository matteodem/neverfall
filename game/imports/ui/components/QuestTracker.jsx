import React from "react";

import {
  HUNT_QUESTS,
} from "../../game/quests";

import {
  useQuestStore,
} from "../stores/useQuestStore";


export const QuestTracker =
  () => {
    const area = useQuestStore((state) => state.area);
    const kills = useQuestStore((state) => area === "forestGiant" ? state.giantKills : area === "wolf" ? state.wolfKills : state.boarKills);
    const quest = HUNT_QUESTS[area];

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