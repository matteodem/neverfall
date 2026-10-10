import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../../api/characters/characters";
import { HudModal } from "../HudModal";
import { NPC_QUESTS, getNpcQuestState } from "../../../game/npcs/npcQuests";
import { NpcQuestCard } from "../NpcQuestCard";

export const QuestsModal = ({ embedded = false }) => {
  const [showRewarded, setShowRewarded] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [trackError, setTrackError] = useState("");
  const character = useTracker(() => {
    const id = Meteor.user()?.profile?.currentCharacterId;
    return id ? Characters.findOne(id) : null;
  });
  const npcActive = NPC_QUESTS.filter((quest) => ["active", "completed"].includes(getNpcQuestState(quest, character)));
  const npcRewarded = NPC_QUESTS.filter((quest) => getNpcQuestState(quest, character) === "rewarded");
  const trackQuest = async (questId) => {
    setTracking(true);
    setTrackError("");
    try {
      await Meteor.callAsync("quests.track", character._id, questId);
    } catch (error) {
      setTrackError(error.reason || error.message || "Could not update tracked quest.");
    } finally {
      setTracking(false);
    }
  };
  return (
    <HudModal id="quests" title="Quests" embedded={embedded} className="quest-modal" maxHeight="calc(var(--game-height, 100vh) * 0.5)">
      <section>
        <h4 className="mb-2 font-bold">Active Quests</h4>
        {trackError && <p role="alert" className="mb-2 text-sm text-error">{trackError}</p>}
        <div className="mb-2 space-y-2">{npcActive.map((quest) =>
          <NpcQuestCard key={quest.id} quest={quest} character={character}>
            <button type="button" className="btn btn-sm mt-3"
              aria-pressed={character?.trackedQuestId === quest.id}
              disabled={tracking}
              onClick={() => trackQuest(character?.trackedQuestId === quest.id ? null : quest.id)}>
              {character?.trackedQuestId === quest.id ? "Untrack Quest" : "Track Quest"}
            </button>
          </NpcQuestCard>)}</div>
        {!npcActive.length && <p className="text-sm opacity-70">Speak with an NPC to accept quests.</p>}
      </section>
      {npcRewarded.length > 0 && <label className="mt-5 flex cursor-pointer items-center gap-2 text-sm">
        <input type="checkbox" className="toggle toggle-sm" checked={showRewarded}
          onChange={(event) => setShowRewarded(event.target.checked)} />
        Show rewarded quests
      </label>}
      {showRewarded && npcRewarded.length > 0 && <section className="mt-5">
        <h4 className="mb-2 font-bold">Completed Quests</h4>
        <div className="mb-2 space-y-2">{npcRewarded.map((quest) =>
          <NpcQuestCard key={quest.id} quest={quest} character={character} />)}</div>
      </section>}
    </HudModal>
  );
};
