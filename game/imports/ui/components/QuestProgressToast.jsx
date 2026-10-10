import React, { useEffect, useRef, useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../api/characters/characters";
import { QUESTS } from "../../game/quests";
import { getNpcQuestState } from "../../game/npcs/npcQuests";
import { getQuestObjectiveDisplay } from "../../game/questObjectiveDisplay";

export const QuestProgressToast = () => {
  const character = useTracker(() => {
    const id = Meteor.user()?.profile?.currentCharacterId;
    return id ? Characters.findOne(id) : null;
  });
  // Keep the previous published document only to detect changes, never count kills locally.
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
      const oldProgress = before.questProgress?.[quest.id] || 0;
      const progress = character.questProgress?.[quest.id] || 0;
      if (progress <= oldProgress) return [];
      const oldDisplay = getQuestObjectiveDisplay(quest, oldProgress);
      const display = getQuestObjectiveDisplay(quest, progress);
      return (quest.objectives || [quest.objective]).flatMap((objective, index) =>
        objective.type === "Kill" && display.steps[index].count > oldDisplay.steps[index].count
          ? [{ questId: quest.id, stepIndex: index }] : []);
    });
    // Replace the current batch instead of queuing a toast for every kill.
    if (changed.length) setNotice({ characterId: character._id, entries: changed });
  }, [character]);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = setTimeout(() => setNotice(null), 2500);
    return () => clearTimeout(timeout);
  }, [notice]);

  if (!notice || notice.characterId !== character?._id) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[12dvh] z-[10001] flex justify-center px-4"
      role="status" aria-live="polite" aria-atomic="true">
      <div className="w-full max-w-sm rounded-xl border border-yellow-300/60 bg-black/60 px-4 py-3 text-center text-sm text-white shadow-[0_0_60px_rgba(250,204,21,0.45)] backdrop-blur-sm">
        {notice.entries.slice(0, 3).map(({ questId, stepIndex }) => {
          const quest = QUESTS.find((entry) => entry.id === questId);
          const step = getQuestObjectiveDisplay(quest, character.questProgress?.[questId] || 0).steps[stepIndex];
          return <p key={`${questId}:${stepIndex}`}>
            <span className="font-bold tracking-wide text-yellow-300">{quest.title}:</span> Killed {step.count} / {step.total}
          </p>;
        })}
        {notice.entries.length > 3 && <p className="text-xs opacity-70">+{notice.entries.length - 3} other objectives progressed</p>}
      </div>
    </div>
  );
};
