import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../../api/characters/characters";
import { HudModal } from "../HudModal";
import { NPC_QUESTS, getNpcQuestState } from "../../../game/npcs/npcQuests";
import { NpcQuestCard } from "../NpcQuestCard";
import { FantasyButton, FantasySectionHeader } from "../fantasy/FantasyUI";

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
      <div className="fantasy-stack">
        <section>
          <FantasySectionHeader className="fantasy-heading-inline">Active Quests</FantasySectionHeader>
          {trackError && <p role="alert" className="mb-2 text-sm text-error">{trackError}</p>}
          <div className="fantasy-stack mt-2">{npcActive.map((quest) =>
            <NpcQuestCard key={quest.id} quest={quest} character={character} fantasy>
              <FantasyButton className="btn-sm mt-3"
                variant={character?.trackedQuestId === quest.id ? "secondary" : "primary"}
                aria-pressed={character?.trackedQuestId === quest.id}
                disabled={tracking}
                onClick={() => trackQuest(character?.trackedQuestId === quest.id ? null : quest.id)}>
                {character?.trackedQuestId === quest.id ? "Untrack Quest" : "Track Quest"}
              </FantasyButton>
            </NpcQuestCard>)}</div>
          {!npcActive.length && <p className="text-sm fantasy-muted">Speak with an NPC to accept quests.</p>}
        </section>
        {npcRewarded.length > 0 && <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className="toggle toggle-sm" checked={showRewarded}
            onChange={(event) => setShowRewarded(event.target.checked)} />
          Show rewarded quests
        </label>}
        {showRewarded && npcRewarded.length > 0 && <section>
          <FantasySectionHeader className="fantasy-heading-inline">Completed Quests</FantasySectionHeader>
          <div className="fantasy-stack mt-2">{npcRewarded.map((quest) =>
            <NpcQuestCard key={quest.id} quest={quest} character={character} fantasy />)}</div>
        </section>}
      </div>
    </HudModal>
  );
};
