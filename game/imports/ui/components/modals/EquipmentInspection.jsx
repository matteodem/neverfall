import React from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../../api/characters/characters";
import { EQUIPMENT_ITEMS, canEquipItem } from "../../../game/equipment";
import { getEquipmentComparison } from "../../../game/equipmentComparison";
import { ITEM_SELL_PRICES } from "../../../game/inventory";
import { useEquipmentStore } from "../../stores/useEquipmentStore";
import { useHudStore } from "../../stores/useHudStore";
import { HudModal } from "../HudModal";
import { actionButtonHandlers } from "../actionButtonHandlers";
import { FantasyBadge, FantasyButton, FantasyDivider, FantasyPanel, FantasySectionHeader } from "../fantasy/FantasyUI";

export const EquipmentInspection = ({ item, equipment, mobile, onClose, onSell, onMove, fantasy = false }) => {
  const Panel = fantasy ? FantasyPanel : "div";
  const Action = fantasy ? FantasyButton : "button";
  const definition = EQUIPMENT_ITEMS[item.id];
  const gameClass = useTracker(() => {
    const id = Meteor.user()?.profile?.currentCharacterId;
    return id ? Characters.findOne(id)?.gameClass : null;
  });
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
      <Panel className={fantasy ? "fantasy-section" : ""}>
      <div className="flex flex-wrap items-center gap-2">
        {fantasy ? <FantasySectionHeader className="fantasy-heading-inline">{definition.name}</FantasySectionHeader>
          : <h4 className="text-base font-bold">{definition.name}</h4>}
        {isUpgrade && (fantasy ? <FantasyBadge tone="success">Upgrade</FantasyBadge> : <span className="badge badge-success text-xs">Upgrade</span>)}
      </div>
      <p className="mt-1 text-xs opacity-70">Equipment · {slot}</p>
      {definition.gameClass && <p className="mt-1 text-xs opacity-70">Class: {definition.gameClass}</p>}
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
      {fantasy && !definition.amirMeshId && <FantasyDivider />}
      {!definition.amirMeshId && <p className={`text-xs ${fantasy ? "" : "mt-4 border-t border-base-300 pt-3"}`}>
        <span className="opacity-70">Compared to: </span>{current?.name || `Empty ${slot.toLowerCase()} slot`}
      </p>}
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Action type="button" {...(fantasy ? { variant: "secondary" } : {})} className="btn btn-sm" onClick={(event) => {
          // Keep the dialog in place until the mobile tap has finished.
          if (mobile) event.stopPropagation();
          close();
          onMove();
        }}>Move</Action>
        {sellable && onSell && <Action type="button" className="btn btn-sm" {...actionButtonHandlers(() => {
          close();
          onSell(item);
        }, mobile)}>Sell</Action>}
        <Action type="button" {...(fantasy ? { variant: "primary" } : {})} className={fantasy ? "btn-sm" : "btn btn-sm btn-primary"} disabled={!canEquipItem(definition, gameClass)} {...actionButtonHandlers(() => {
          useEquipmentStore.getState().requestChange("equip", { itemId: item.id, slot: definition.slot });
          close();
        }, mobile)}>Equip item</Action>
      </div>
      </Panel>
    </HudModal>
  );
};
