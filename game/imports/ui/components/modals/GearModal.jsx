import React, { useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";

import { Characters } from "../../../api/characters/characters";
import {
  DEFAULT_EQUIPMENT,
  EQUIPMENT_ITEMS,
  EQUIPMENT_SLOTS,
  formatEquipmentStats,
} from "../../../game/equipment";
import { useEquipmentStore } from "../../stores/useEquipmentStore";
import { useMobileDevice } from "../../hooks/useMobileDevice";
import { HudModal } from "../HudModal";
import { formatClassBonus, getUnlockedClassBonuses } from "../../../game/classProgression";
import { InventoryDropTarget, InventoryMoveFeedback } from "./InventoryDropTarget";
import { useInventoryDragStore } from "../../stores/useInventoryDragStore";
import { FantasyButton, FantasyDivider, FantasyPanel, FantasySectionHeader } from "../fantasy/FantasyUI";

const EquipmentSlot = ({ slot, itemId }) => {
  const item = EQUIPMENT_ITEMS[itemId];
  const label = slot[0].toUpperCase() + slot.slice(1);
  const content = (
    <div className="fantasy-slot min-h-[68px]">
      <div className="text-[10px] font-semibold uppercase tracking-wide fantasy-muted">{label}</div>
      <div className="mt-1 text-xs font-semibold">{item?.name || (["weapon", "armor"].includes(slot) ? "Class default" : "Empty")}</div>
      {formatEquipmentStats(item).map((stat) => (
        <div key={stat} className="mt-0.5 text-[10px] fantasy-muted">{stat}</div>
      ))}
    </div>
  );

  if (!item) return content;

  return (
    <div className="dropdown dropdown-top focus-within:z-[100] w-full">
      <button type="button" className="block w-full text-left" aria-label={`${label}: ${item.name}. Equipment actions`}>{content}</button>
      <FantasyPanel as="ul" className="dropdown-content menu fantasy-section z-[100] w-48">
        <li>
          <div className="pointer-events-none block">
            <strong className="block text-xs">{item.name}</strong>
            {formatEquipmentStats(item).map((stat) => (
              <span key={stat} className="mt-1 block text-[11px] fantasy-muted">{stat}</span>
            ))}
          </div>
        </li>
        <li>
          <FantasyButton variant="secondary" className="btn-sm" onClick={() => useEquipmentStore.getState().requestChange("unequip", slot)}>
            Unequip item
          </FantasyButton>
        </li>
      </FantasyPanel>
    </div>
  );
};

export const GearModal = ({ embedded = false }) => {
  const { mobile } = useMobileDevice();
  const { equipment, bonuses, characterId } = useTracker(() => {
    const currentCharacterId = Meteor.user()?.profile?.currentCharacterId;
    const character = currentCharacterId ? Characters.findOne(currentCharacterId) : null;

    return {
      characterId: currentCharacterId,
      equipment: { ...DEFAULT_EQUIPMENT, ...(character?.equipment || {}) },
      bonuses: getUnlockedClassBonuses(character?.gameClass, character?.currentLevel),
    };
  });
  useEffect(() => () => {
    const state = useInventoryDragStore.getState();
    if (state.source?.characterId === characterId && state.source.type === "equipment") state.clear();
  }, [characterId]);

  return (
    <HudModal id="gear" title="Gear" embedded={embedded} scrollable={mobile}>
      <FantasyPanel as="section" className="fantasy-section">
        <FantasySectionHeader>Equipped</FantasySectionHeader>
        <InventoryMoveFeedback fantasy />
        <div className="grid grid-cols-2 gap-2">
          {EQUIPMENT_SLOTS.map((slot) => (
            <InventoryDropTarget key={slot} characterId={characterId} itemId={equipment[slot]}
              target={{ type: "equipment", slot }} mobile={mobile} fantasy>
              <EquipmentSlot slot={slot} itemId={equipment[slot]} />
            </InventoryDropTarget>
          ))}
        </div>
        <FantasyDivider />
        <div>
          <FantasySectionHeader>Class Bonuses</FantasySectionHeader>
          {bonuses.length ? bonuses.map((bonus) => (
            <div key={bonus.level} className="text-xs fantasy-muted">
              Level {bonus.level}: {formatClassBonus(bonus)}
            </div>
          )) : <p className="text-xs fantasy-muted">First bonus unlocks at level 5.</p>}
        </div>
      </FantasyPanel>
    </HudModal>
  );
};
