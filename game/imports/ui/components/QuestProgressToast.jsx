import { FantasyNotice } from "./fantasy/FantasyUI";
import React, { useEffect, useRef, useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../api/characters/characters";
import { QUESTS } from "../../game/quests";
import { getNpcQuestState } from "../../game/npcs/npcQuests";
import { NPC_DEFINITIONS } from "../../game/npcs/npcDefinitions";
import { getQuestObjectiveDisplay } from "../../game/questObjectiveDisplay";

export const QuestProgressToast = () => {
  const character = useTracker(() => {
    const id = Meteor.user()?.profile?.currentCharacterId;
    return id ? Characters.findOne(id) : null;
  });
  // Compare published documents for transitions; never track quest progress locally.
  const previous = useRef(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const before = previous.current;
    previous.current = character;
    if (!character || before?._id !== character._id) {
      // Login, reconnect, and character selection establish a baseline.
      setNotice(null);
      return;
    }

    const changed = QUESTS.flatMap((quest) => {
      if (getNpcQuestState(quest, before) !== "active") return [];
      const state = getNpcQuestState(quest, character);
      if (state === "completed" || (!quest.turnInRequired && state === "rewarded")) {
        return [{ questId: quest.id, finished: true }];
      }
      const oldProgress = before.questProgress?.[quest.id] || 0;
      const progress = character.questProgress?.[quest.id] || 0;
      if (progress <= oldProgress) return [];
      const oldDisplay = getQuestObjectiveDisplay(quest, oldProgress);
      const display = getQuestObjectiveDisplay(quest, progress);
      return (quest.objectives || [quest.objective]).flatMap((objective, index) =>
        objective.type === "Kill" && display.steps[index].count > oldDisplay.steps[index].count
          ? [{ questId: quest.id, stepIndex: index }] : []);
    });
    // Replace the current batch instead of queuing a toast for every update.
    if (changed.length) setNotice({ characterId: character._id, entries: changed });
  }, [character]);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = setTimeout(() => setNotice(null), 2500);
    return () => clearTimeout(timeout);
  }, [notice]);

  if (!notice || notice.characterId !== character?._id) return null;
  return (
    <div className="fantasy-toast-slot"
      role="status" aria-live="polite" aria-atomic="true">
      <FantasyNotice tone="reward" className="w-full max-w-sm text-center text-sm">
        {notice.entries.slice(0, 3).map(({ questId, stepIndex, finished }) => {
          const quest = QUESTS.find((entry) => entry.id === questId);
          if (finished) {
            const giver = NPC_DEFINITIONS.find((npc) => npc.offeredQuestIds?.includes(questId));
            return <div key={questId}>
              <p><span className="font-bold fantasy-accent">{quest.title}:</span> Finished</p>
              {quest.turnInRequired && <p className="mt-1 text-xs fantasy-muted">
                Return to {giver?.name || "Quest-Giver"} to Earn Rewards
              </p>}
            </div>;
          }
          const step = getQuestObjectiveDisplay(quest, character.questProgress?.[questId] || 0).steps[stepIndex];
          return <p key={`${questId}:${stepIndex}`}>
            <span className="font-bold fantasy-accent">{quest.title}:</span> Killed {step.count} / {step.total}
          </p>;
        })}
        {notice.entries.length > 3 && <p className="text-xs opacity-70">+{notice.entries.length - 3} other quests updated</p>}
      </FantasyNotice>
    </div>
  );
};
