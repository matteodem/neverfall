import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { ITEM_NAMES, ITEM_SELL_PRICES } from "../../../game/inventory";
import { HudModal } from "../HudModal";
import { Icon } from "../Icon";
import { useHudStore } from "../../stores/useHudStore";
import { FantasyBadge, FantasyButton, FantasyDivider, FantasyPanel, FantasySectionHeader } from "../fantasy/FantasyUI";

export const SellItemModal = ({ itemId, available, itemDisplay, onClose, merchant }) => {
  const [quantity, setQuantity] = useState(String(available));
  const [selling, setSelling] = useState(false);
  const [error, setError] = useState("");
  if (!merchant) return null;
  const price = ITEM_SELL_PRICES[itemId];
  const amount = Number(quantity);
  const valid = /^\d+$/.test(quantity) && Number.isSafeInteger(amount) && amount >= 1 && amount <= available;
  const totalGold = valid ? (price * 10000 * amount) / 10000 : 0;
  const close = () => {
    useHudStore.getState().closeModal("sell-item");
    onClose();
  };
  const sell = async () => {
    if (!valid || selling) return;
    setSelling(true);
    setError("");
    try {
      await Meteor.callAsync("shop.sell", itemId, amount, merchant);
      close();
    } catch (saleError) {
      setError(saleError.reason || "Could not sell this item.");
    } finally {
      setSelling(false);
    }
  };

  return (
    <HudModal id="sell-item" title="Sell item" backdrop onClose={onClose}>
      <FantasyPanel className="fantasy-section">
        <div className="flex flex-wrap items-center gap-3">
          {itemDisplay?.icon && <Icon icon={itemDisplay.icon} className={itemDisplay.iconClass} />}
          <div className="min-w-0">
            <FantasySectionHeader className="fantasy-heading-inline">{ITEM_NAMES[itemId] || itemId}</FantasySectionHeader>
            <p className="mt-1 text-sm fantasy-muted">Available: {available}</p>
          </div>
        </div>
        <FantasyDivider />
        <p className="text-sm">Price each: {price} Gold</p>
        <label className="form-control mt-3 block">
          <span className="label-text">Quantity</span>
          <input type="number" min="1" max={available} step="1" inputMode="numeric"
            className="input input-bordered fantasy-input mt-1 w-full" value={quantity} disabled={selling}
            onChange={(event) => setQuantity(event.target.value)} />
        </label>
        <div className="mt-3"><FantasyBadge tone="warning">Total: {totalGold} Gold</FantasyBadge></div>
        {error && <p className="mt-3 text-sm fantasy-danger" role="alert">{error}</p>}
      </FantasyPanel>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <FantasyButton variant="ghost" disabled={selling} onClick={close}>Cancel</FantasyButton>
        <FantasyButton disabled={!valid || selling} onClick={sell}>
          {selling ? "Selling..." : "Sell"}
        </FantasyButton>
      </div>
    </HudModal>
  );
};
