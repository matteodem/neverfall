import React from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { ITEM_NAMES, splitMoney, stackItems } from "../../../game/inventory";
import { Characters } from "../../../api/characters/characters";

import {
  HudModal,
} from "../HudModal";

export const InventoryModal = () => {
  const { balance, characterItems } = useTracker(() => {
    const user = Meteor.user();
    const characterId = user?.profile?.currentCharacterId;
    const character = characterId && Characters.findOne({ _id: characterId, userId: user._id });
    return {
      balance: user?.profile?.inventory?.money,
      characterItems: character?.inventory?.items,
    };
  });
  const money = splitMoney(balance);
  const items = stackItems(characterItems);
  return (
    <HudModal
      id="inventory"
      title="Inventory"
    >
      <p className="mb-4">
        {money.gold} gold · {money.silver} silver · {money.bronze} bronze
      </p>
      {items.length ? (
        <ul className="space-y-2">
          {items.map(({ id, count }) => (
            <li key={id} className="flex justify-between gap-4 rounded bg-white/10 px-3 py-2">
              <span>{ITEM_NAMES[id] || id}</span>
              <span>×{count}</span>
            </li>
          ))}
        </ul>
      ) : <p>No items yet.</p>}
    </HudModal>
  );
};
