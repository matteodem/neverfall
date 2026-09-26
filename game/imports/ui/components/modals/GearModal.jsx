import React from "react";
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
import { HudModal } from "../HudModal";

const EquipmentSlot = ({ slot, itemId }) => {
  const item = EQUIPMENT_ITEMS[itemId];
  const label = slot[0].toUpperCase() + slot.slice(1);
  const content = (
    <div className="min-h-[68px] rounded-md border border-gray-300 bg-gray-50 p-2">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-xs font-semibold text-gray-800">{item?.name || "Empty"}</div>
      {formatEquipmentStats(item).map((stat) => (
        <div key={stat} className="mt-0.5 text-[10px] text-gray-600">{stat}</div>
      ))}
    </div>
  );

  if (!item) return content;

  return (
    <div className="dropdown dropdown-top focus-within:z-[100] w-full">
      <button type="button" className="block w-full text-left">{content}</button>
      <ul className="dropdown-content menu z-[100] w-44 rounded-box border border-gray-200 bg-white p-2 text-gray-900 shadow-xl">
        <li>
          <div className="pointer-events-none block">
            <strong className="block text-xs">{item.name}</strong>
            {formatEquipmentStats(item).map((stat) => (
              <span key={stat} className="mt-1 block text-[11px] text-gray-600">{stat}</span>
            ))}
          </div>
        </li>
        <li>
          <button type="button" onClick={() => useEquipmentStore.getState().requestChange("unequip", slot)}>
            Unequip item
          </button>
        </li>
      </ul>
    </div>
  );
};

export const GearModal = () => {
  const equipment = useTracker(() => {
    const currentCharacterId = Meteor.user()?.profile?.currentCharacterId;
    const character = currentCharacterId ? Characters.findOne(currentCharacterId) : null;

    return {
      ...DEFAULT_EQUIPMENT,
      ...(character?.equipment || {}),
    };
  });

  return (
    <HudModal id="gear" title="Gear" scrollable={false}>
      <section className="rounded-xl border border-gray-200 bg-white p-4 text-gray-900 shadow-2xl">
        <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-600">Equipped</h4>
        <div className="grid grid-cols-2 gap-2">
          {EQUIPMENT_SLOTS.map((slot) => (
            <EquipmentSlot key={slot} slot={slot} itemId={equipment[slot]} />
          ))}
        </div>
      </section>
    </HudModal>
  );
};
