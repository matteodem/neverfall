import React from "react";

import {
  BOAR_HUNT_QUEST,
} from "../../game/quests";

import {
  useQuestStore,
} from "../stores/useQuestStore";


export const QuestTracker =
  () => {
    const boarKills =
      useQuestStore(
        (
          state
        ) =>
          state.boarKills
      );


    return (
      <div className="w-64 rounded-lg border border-white/10 bg-black/50 p-4 text-white shadow-lg">
        <div className="font-bold">
          {
            BOAR_HUNT_QUEST.title
          }
        </div>

        <div className="mt-1 text-sm text-white/70">
          Kill Boars
        </div>

        <div className="mt-2 font-semibold">
          {boarKills}
          {" / "}
          {
            BOAR_HUNT_QUEST.target
          }
        </div>

        <div className="mt-1 text-xs text-yellow-300">
          Reward:{" "}
          {
            BOAR_HUNT_QUEST.rewardXp
          }{" "}
          XP
        </div>

        <div className="mt-1 text-xs text-white/40">
          Repeatable
        </div>
      </div>
    );
  };