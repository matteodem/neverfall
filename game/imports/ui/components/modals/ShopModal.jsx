import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { EQUIPMENT_ITEMS, formatEquipmentStats } from "../../../game/equipment";
import { CONSUMABLES } from "../../../game/consumables";
import { getShop } from "../../../game/shop";
import { HudModal } from "../HudModal";
import { FantasyBadge, FantasyButton, FantasyPanel, FantasySectionHeader } from "../fantasy/FantasyUI";

export const ShopModal = ({ embedded = false, merchant }) => {
  const [buyingId, setBuyingId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const gold = useTracker(() => Math.floor((Meteor.user()?.profile?.inventory?.money || 0) / 10000));
  const shop = getShop(merchant?.shopId);
  if (!merchant || !shop) return null;

  const buy = async (itemId) => {
    if (buyingId) return;
    setBuyingId(itemId);
    setFeedback(null);
    try {
      await Meteor.callAsync("shop.buy", itemId, merchant);
      setFeedback({ text: `${(EQUIPMENT_ITEMS[itemId] || CONSUMABLES[itemId]).name} added to your inventory.`, error: false });
    } catch (error) {
      setFeedback({ text: error.reason || "Could not buy this item.", error: true });
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <HudModal id="shop" title="Shop" embedded={embedded} onClose={() => setFeedback(null)}>
      <div className="fantasy-stack">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <FantasySectionHeader as="h4" className="fantasy-heading-inline">Goods for sale</FantasySectionHeader>
          <FantasyBadge tone="warning">Your Gold: {gold}</FantasyBadge>
        </div>
        {feedback && (
          <p className={`text-sm ${feedback.error ? "fantasy-danger" : "text-success"}`} role={feedback.error ? "alert" : "status"}>
            {feedback.text}
          </p>
        )}
        <div className="fantasy-stack">
          {[...shop.items].sort((a, b) => a.priceGold - b.priceGold).map(({ id, priceGold }) => {
            const item = EQUIPMENT_ITEMS[id] || CONSUMABLES[id];
            return (
              <FantasyPanel key={id} className="fantasy-section flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <FantasySectionHeader as="h5" className="fantasy-heading-inline">{item.name}</FantasySectionHeader>
                  <div className="mt-1 text-xs fantasy-muted">{item.description || (item.gameClass ? `Class: ${item.gameClass}` : formatEquipmentStats(item).join(" · "))}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <FantasyBadge tone="warning">{priceGold} Gold</FantasyBadge>
                  <FantasyButton className="btn-sm" disabled={Boolean(buyingId)} onClick={() => buy(id)}>
                    {buyingId === id ? "Buying..." : "Buy"}
                  </FantasyButton>
                </div>
              </FantasyPanel>
            );
          })}
        </div>
      </div>
    </HudModal>
  );
};
