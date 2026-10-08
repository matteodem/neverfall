import React from "react";
import { EQUIPMENT_ITEMS } from "../../../game/equipment";
import { getEquipmentComparison } from "../../../game/equipmentComparison";
import { ITEM_SELL_PRICES } from "../../../game/inventory";
import { useEquipmentStore } from "../../stores/useEquipmentStore";
import { useHudStore } from "../../stores/useHudStore";
import { HudModal } from "../HudModal";
import { actionButtonHandlers } from "../actionButtonHandlers";

export const EquipmentInspection = ({ item, equipment, mobile, onClose, onSell }) => {
  const definition = EQUIPMENT_ITEMS[item.id];
  const { current, stats, isUpgrade } = getEquipmentComparison(definition, equipment);
  const slot = definition.slot[0].toUpperCase() + definition.slot.slice(1);
  const sellPrice = ITEM_SELL_PRICES[item.id];
  const sellable = Number.isFinite(sellPrice) && sellPrice > 0 && Number.isSafeInteger(sellPrice * 10000);
  const close = () => {
    useHudStore.getState().closeModal("equipment-inspection");
    onClose();
  };

  return (
    <HudModal id="equipment-inspection" title="Item details" backdrop onClose={onClose}>
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-base font-bold">{definition.name}</h4>
        {isUpgrade && <span className="badge badge-success text-xs">Upgrade</span>}
      </div>
      <p className="mt-1 text-xs opacity-70">Equipment · {slot}</p>
      <div className="mt-4 space-y-2 text-sm">
        {stats.map((stat) => (
          <div key={stat.id} className="flex flex-wrap justify-between gap-x-3">
            <span>{stat.label}</span>
            <span className="font-semibold">
              {stat.value}{" "}
              <span className={stat.delta > 0 ? "text-success" : stat.delta < 0 ? "text-error" : "opacity-60"}>
                ({stat.difference})
              </span>
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 border-t border-base-300 pt-3 text-xs">
        <span className="opacity-70">Compared to: </span>{current?.name || `Empty ${slot.toLowerCase()} slot`}
      </p>
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        {sellable && <button type="button" className="btn btn-sm" {...actionButtonHandlers(() => {
          close();
          onSell(item);
        }, mobile)}>Sell</button>}
        <button type="button" className="btn btn-sm btn-primary" {...actionButtonHandlers(() => {
          useEquipmentStore.getState().requestChange("equip", { itemId: item.id, slot: definition.slot });
          close();
        }, mobile)}>Equip item</button>
      </div>
    </HudModal>
  );
};
