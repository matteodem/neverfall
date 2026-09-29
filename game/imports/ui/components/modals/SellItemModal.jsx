import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { ITEM_NAMES, ITEM_SELL_PRICES } from "../../../game/inventory";
import { HudModal } from "../HudModal";
import { Icon } from "../Icon";
import { useHudStore } from "../../stores/useHudStore";

export const SellItemModal = ({ itemId, available, itemDisplay, onClose }) => {
  const [quantity, setQuantity] = useState(String(available));
  const [selling, setSelling] = useState(false);
  const [error, setError] = useState("");
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
      await Meteor.callAsync("shop.sell", itemId, amount);
      close();
    } catch (saleError) {
      setError(saleError.reason || "Could not sell this item.");
    } finally {
      setSelling(false);
    }
  };

  return (
    <HudModal id="sell-item" title="Sell item" backdrop onClose={onClose}>
      <div className="flex items-center gap-3">
        {itemDisplay?.icon && <Icon icon={itemDisplay.icon} className={itemDisplay.iconClass} />}
        <div>
          <div className="font-semibold">{ITEM_NAMES[itemId] || itemId}</div>
          <div className="text-sm opacity-70">Available: {available}</div>
        </div>
      </div>
      <div className="mt-4 text-sm">Price each: {price} Gold</div>
      <label className="form-control mt-3 block">
        <span className="label-text">Quantity</span>
        <input type="number" min="1" max={available} step="1" inputMode="numeric"
          className="input input-bordered mt-1 w-full" value={quantity} disabled={selling}
          onChange={(event) => setQuantity(event.target.value)} />
      </label>
      <div className="mt-3 font-semibold">Total: {totalGold} Gold</div>
      {error && <p className="mt-3 text-sm text-error" role="alert">{error}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" className="btn btn-ghost" disabled={selling} onClick={close}>Cancel</button>
        <button type="button" className="btn btn-primary" disabled={!valid || selling} onClick={sell}>
          {selling ? "Selling..." : "Sell"}
        </button>
      </div>
    </HudModal>
  );
};
