import React from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { ITEM_NAMES, splitMoney, stackItems } from "../../../game/inventory";

import {
  HudModal,
} from "../HudModal";

export const InventoryModal = () => {
  const inventory = useTracker(() => Meteor.user()?.profile?.inventory);
  const money = splitMoney(inventory?.money);
  const items = stackItems(inventory?.items);
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
