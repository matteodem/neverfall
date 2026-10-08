import React from "react";
import { Meteor } from "meteor/meteor";
import { Characters } from "../../../api/characters/characters";
import { EQUIPMENT_ITEMS } from "../../../game/equipment";
import { useEquipmentStore } from "../../stores/useEquipmentStore";
import { useInventoryDragStore } from "../../stores/useInventoryDragStore";

const ITEM_DRAG_TYPE = "application/x-neverfall-item";

// Native desktop dragging is an optional layer over the existing item buttons.
export const InventoryDropTarget = ({ characterId, itemId, target, mobile, children, onDragStart }) => {
  const source = useInventoryDragStore((state) => state.source);
  const busy = useInventoryDragStore((state) => state.busy);
  const store = useInventoryDragStore.getState;
  const character = characterId && Characters.findOne(characterId);
  const owned = source?.type === "inventory"
    ? character?.inventory?.items?.some((item) => item.id === source.itemId)
    : character?.equipment?.[source?.slot] === source?.itemId;
  const valid = Boolean(source && !busy && source.characterId === characterId && owned &&
    (target.type === "inventory" || (source.type === "inventory" &&
      EQUIPMENT_ITEMS[source.itemId]?.slot === target.slot && character?.equipment?.[target.slot] !== source.itemId)));
  const isSource = source?.characterId === characterId && source?.type === target.type && source?.itemId === itemId;

  const drop = async () => {
    if (busy) return;
    if (!valid) {
      store().setError("That item cannot be moved here.");
      return;
    }
    store().clear();
    if (source.type === "inventory" && target.type === "inventory" && source.itemId === itemId) return;
    if (target.type === "equipment") {
      useEquipmentStore.getState().requestChange("equip", { itemId: source.itemId, slot: target.slot });
    } else if (source.type === "equipment") {
      useEquipmentStore.getState().requestChange("unequip", {
        slot: source.slot, itemId: source.itemId, inventoryIndex: target.index,
      });
    } else {
      store().setBusy(true);
      try {
        await Meteor.callAsync("inventory.moveItem", characterId, source.itemId, target.index);
      } catch (error) {
        store().setError(error.reason || "Could not move this item.");
      } finally {
        store().setBusy(false);
      }
    }
  };

  return (
    <div
      className={`min-w-0 rounded-md ${source ? valid ? "ring-2 ring-green-500" : "ring-2 ring-red-400" : ""} ${isSource ? "opacity-50" : ""}`}
      draggable={!mobile && !busy && Boolean(itemId)}
      onDragStart={(event) => {
        if (!itemId || event.target.closest("ul")) { event.preventDefault(); return; }
        event.stopPropagation();
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData(ITEM_DRAG_TYPE, itemId);
        store().select({ characterId, itemId, type: target.type, slot: target.slot, mode: "drag" });
        onDragStart?.();
      }}
      onDragEnd={() => store().clear()}
      onDragOver={(event) => {
        if (source?.mode !== "drag" || !event.dataTransfer.types.includes(ITEM_DRAG_TYPE)) return;
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = valid ? "move" : "none";
      }}
      onDrop={(event) => {
        if (source?.mode !== "drag" || !event.dataTransfer.types.includes(ITEM_DRAG_TYPE)) return;
        event.preventDefault();
        event.stopPropagation();
        void drop();
      }}
      onClickCapture={(event) => {
        if (source?.mode !== "move") return;
        event.preventDefault();
        event.stopPropagation();
        void drop();
      }}
      onPointerDownCapture={(event) => {
        // Mobile action buttons act on pointerdown; consume it while choosing a slot.
        if (!mobile || source?.mode !== "move") return;
        event.preventDefault();
        event.stopPropagation();
        void drop();
      }}
    >{children}</div>
  );
};

export const InventoryMoveFeedback = () => {
  const source = useInventoryDragStore((state) => state.source);
  const busy = useInventoryDragStore((state) => state.busy);
  const error = useInventoryDragStore((state) => state.error);
  return <>
    {/*source && <p className="mb-3 text-xs text-gray-600" role="status">
      {source.mode === "move" ? "Choose a backpack or valid equipment slot." : "Green slots accept this item; red slots do not."}
      <button type="button" className="btn btn-ghost btn-xs ml-2" onClick={() => useInventoryDragStore.getState().clear()}>Cancel</button>
    </p>*/}
    {busy && <p className="mb-3 text-xs text-gray-600" role="status">Moving item…</p>}
    {error && <p className="mb-3 text-xs text-error" role="alert">{error}</p>}
  </>;
};
