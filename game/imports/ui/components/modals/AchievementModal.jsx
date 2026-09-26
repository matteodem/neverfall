import React, { useEffect, useRef, useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../../api/characters/characters";
import { ACHIEVEMENTS } from "../../../game/achievements";
import { HudModal } from "../HudModal";

const useAchievementCharacter = () => useTracker(() => {
  const characterId = Meteor.user()?.profile?.currentCharacterId;
  return characterId ? Characters.findOne(characterId) : null;
});

export const AchievementModal = () => {
  const character = useAchievementCharacter();
  const sortedAchievements = [...ACHIEVEMENTS].sort((a, b) =>
    Number(Boolean(character?.achievements?.[b.id]?.unlocked)) -
    Number(Boolean(character?.achievements?.[a.id]?.unlocked))
  );
  return (
    <HudModal id="achievements" title="Achievements" maxHeight={750}>
      <div className="space-y-3">
        {sortedAchievements.map(({ id, name, description, target }) => {
          const achievement = character?.achievements?.[id];
          const progress = achievement?.progress || 0;
          return (
            <section key={id} className="rounded-box border border-base-300 p-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold">{name}</h4>
                <span className={`badge badge-sm ${achievement?.unlocked ? "badge-success" : "badge-ghost"}`}>
                  {achievement?.unlocked ? "Unlocked" : "Locked"}
                </span>
              </div>
              <p className="mt-1 text-sm">{description}</p>
              <p className="mt-1 text-sm font-semibold">{progress} / {target}</p>
            </section>
          );
        })}
      </div>
    </HudModal>
  );
};

export const AchievementToast = () => {
  const character = useAchievementCharacter();
  const previous = useRef(null);
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    if (!character) {
      previous.current = null;
      setQueue([]);
      return;
    }
    const unlocked = ACHIEVEMENTS.filter(({ id }) => character.achievements?.[id]?.unlocked);
    const snapshot = { characterId: character._id, ids: new Set(unlocked.map(({ id }) => id)) };
    if (previous.current?.characterId === character._id) {
      const newlyUnlocked = unlocked.filter(({ id }) => !previous.current.ids.has(id));
      if (newlyUnlocked.length) setQueue((items) => [...items, ...newlyUnlocked]);
    } else {
      // Published unlocks on login/character selection are the baseline, not new toasts.
      setQueue([]);
    }
    previous.current = snapshot;
  }, [character]);

  const current = queue[0];
  useEffect(() => {
    if (!current) return undefined;
    const timeout = setTimeout(() => setQueue((items) => items.slice(1)), 4000);
    return () => clearTimeout(timeout);
  }, [current]);

  if (!current) return null;
  return (
    <div className="pointer-events-none fixed bottom-[210px] left-1/2 z-[10001] -translate-x-1/2" role="status">
      <div className="rounded-box border border-success bg-base-100 px-5 py-3 text-base-content shadow-lg">
        <p className="text-sm font-bold text-success">Achievement Unlocked</p>
        <p>{current.name}</p>
      </div>
    </div>
  );
};
