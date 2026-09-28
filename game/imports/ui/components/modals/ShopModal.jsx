import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { EQUIPMENT_ITEMS, formatEquipmentStats } from "../../../game/equipment";
import { CONSUMABLES } from "../../../game/consumables";
import { SHOP_STOCK } from "../../../game/shop";
import { HudModal } from "../HudModal";

export const ShopModal = () => {
  const [buyingId, setBuyingId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const gold = useTracker(() => Math.floor((Meteor.user()?.profile?.inventory?.money || 0) / 10000));

  const buy = async (itemId) => {
    if (buyingId) return;
    setBuyingId(itemId);
    setFeedback(null);
    try {
      await Meteor.callAsync("shop.buy", itemId);
      setFeedback({ text: `${(EQUIPMENT_ITEMS[itemId] || CONSUMABLES[itemId]).name} added to your inventory.`, error: false });
    } catch (error) {
      setFeedback({ text: error.reason || "Could not buy this item.", error: true });
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <HudModal id="shop" title="Shop" onClose={() => setFeedback(null)}>
      <div className="mb-3 text-sm font-semibold">Your Gold: {gold}</div>
      {feedback && (
        <p className={`mb-3 text-sm ${feedback.error ? "text-error" : "text-success"}`} role={feedback.error ? "alert" : "status"}>
          {feedback.text}
        </p>
      )}
      <div className="space-y-2">
        {SHOP_STOCK.map(({ id, priceGold }) => {
          const item = EQUIPMENT_ITEMS[id] || CONSUMABLES[id];
          return (
            <div key={id} className="flex items-center justify-between gap-3 rounded-lg border border-base-300 p-3">
              <div className="min-w-0">
                <div className="font-semibold">{item.name}</div>
                <div className="text-xs opacity-70">{item.description || formatEquipmentStats(item).join(" · ")}</div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-sm font-semibold">{priceGold} Gold</span>
                <button type="button" className="btn btn-primary btn-sm" disabled={Boolean(buyingId)} onClick={() => buy(id)}>
                  {buyingId === id ? "Buying..." : "Buy"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </HudModal>
  );
};
