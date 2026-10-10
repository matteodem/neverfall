import React from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../../api/characters/characters";
import { NPC_QUESTS, getNpcQuestState } from "../../../game/npcs/npcQuests";
import { useQuestStore } from "../../stores/useQuestStore";
import { HudModal } from "../HudModal";
import { QuestList } from "./QuestsModal";

export const HuntsModal = ({ embedded = false }) => {
  const area = useQuestStore((state) => state.area);
  const character = useTracker(() => {
    const id = Meteor.user()?.profile?.currentCharacterId;
    return id ? Characters.findOne(id) : null;
  });
  const hunts = NPC_QUESTS.filter((quest) => quest.repeatable && getNpcQuestState(quest, character) === "active")
    .sort((a, b) => (a.objective.target === area ? -1 : b.objective.target === area ? 1 : 0))
    .map((quest) => ({ ...quest, nearby: quest.objective.target === area }));

  return (
    <HudModal id="hunts" title="Hunts" embedded={embedded} maxHeight="calc(var(--game-height, 100vh) * 0.5)">
      <QuestList quests={hunts} progress={character?.questProgress || {}} />
      {!hunts.length && <p className="text-sm opacity-70">Speak with an NPC to accept hunts.</p>}
    </HudModal>
  );
};
