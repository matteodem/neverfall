import React from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../../api/characters/characters";
import { HUNT_QUESTS } from "../../../game/quests";
import { useQuestStore } from "../../stores/useQuestStore";
import { HudModal } from "../HudModal";
import { QuestList } from "./QuestsModal";

export const HuntsModal = ({ embedded = false }) => {
  const area = useQuestStore((state) => state.area);
  const progress = useTracker(() => {
    const id = Meteor.user()?.profile?.currentCharacterId;
    return id ? Characters.findOne(id)?.questProgress || {} : {};
  });
  const hunts = Object.entries(HUNT_QUESTS).sort(([a], [b]) => (a === area ? -1 : b === area ? 1 : 0))
    .map(([type, quest]) => ({ ...quest, objective: { amount: quest.target }, nearby: type === area }));

  return (
    <HudModal id="hunts" title="Hunts" embedded={embedded} maxHeight="calc(var(--game-height, 100vh) * 0.5)">
      <QuestList quests={hunts} progress={progress} />
    </HudModal>
  );
};
