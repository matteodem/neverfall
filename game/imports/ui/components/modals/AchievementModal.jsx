import React, { useEffect, useRef, useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../../api/characters/characters";
import { ACHIEVEMENTS } from "../../../game/achievements";
import { getUnlockedPlayerTitles } from "../../../game/playerTitles";
import { HudModal } from "../HudModal";

const useAchievementCharacter = () => useTracker(() => {
  const characterId = Meteor.user()?.profile?.currentCharacterId;
  return characterId ? Characters.findOne(characterId) : null;
});

export const AchievementModal = ({ embedded = false }) => {
  const character = useAchievementCharacter();
  const [savingTitle, setSavingTitle] = useState(false);
  const [titleError, setTitleError] = useState("");
  const unlockedTitles = getUnlockedPlayerTitles(character?.achievements);
  const selectedTitle = unlockedTitles.some((title) => title.id === character?.selectedTitle)
    ? character.selectedTitle : "";
  const selectTitle = async (event) => {
    const value = event.target.value || null;
    setSavingTitle(true);
    setTitleError("");
    try {
      await Meteor.callAsync("characters.setTitle", character._id, value);
    } catch (error) {
      setTitleError(error.reason || error.message || "Could not update player title.");
    } finally {
      setSavingTitle(false);
    }
  };
  const sortedAchievements = [...ACHIEVEMENTS].sort((a, b) =>
    Number(Boolean(character?.achievements?.[a.id]?.unlocked)) -
    Number(Boolean(character?.achievements?.[b.id]?.unlocked))
  );
  return (
    <HudModal id="achievements" title="Achievements" embedded={embedded} maxHeight={750}>
      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block font-semibold">Player Title</span>
          <select className="select select-bordered w-full" value={selectedTitle}
            disabled={!character || savingTitle} onChange={selectTitle}>
            <option value="">None</option>
            {unlockedTitles.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
          </select>
        </label>
        {titleError && <p role="alert" className="text-sm text-error">{titleError}</p>}
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
