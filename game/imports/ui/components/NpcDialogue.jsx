import React, { useEffect, useState } from "react";
import { HudModal } from "./HudModal";
import { NpcQuestPanel } from "./NpcQuestPanel";
import { ShopModal } from "./modals/ShopModal";
import { InventoryModal } from "./modals/InventoryModal";
import { getMerchantShop } from "../../game/shop";
import { NPC_DIALOGUE_MODAL, useNpcStore } from "../stores/useNpcStore";
import { useHudStore } from "../stores/useHudStore";
import { useDungeonStore } from "../stores/useDungeonStore";
import { useWorldEventStore } from "../stores/useWorldEventStore";

export const NpcDialogue = () => {
  const nearby = useNpcStore((state) => state.nearby);
  const dialogue = useNpcStore((state) => state.dialogue);
  const interact = useNpcStore((state) => state.interact);
  const closeDialogue = useNpcStore((state) => state.closeDialogue);
  const modalOpen = useHudStore((state) => state.openModals.length > 0);
  const dungeonPrompt = useDungeonStore((state) => state.prompt);
  const eventInteraction = useWorldEventStore((state) => state.event?.nearObjective);
  const questPending = useNpcStore((state) => state.questPending);
  const questError = useNpcStore((state) => state.questError);
  const [merchantAction, setMerchantAction] = useState(null);
  const canBuy = Boolean(getMerchantShop(dialogue, "buy"));
  const canSell = Boolean(getMerchantShop(dialogue, "sell"));
  const merchant = dialogue?.npcType === "merchant"
    ? { npcId: dialogue.id, shopId: dialogue.merchant?.shopId } : null;

  useEffect(() => setMerchantAction(null), [dialogue?.id]);

  useEffect(() => {
    if (!dialogue) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeDialogue();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dialogue, closeDialogue]);

  return <>
    {nearby && !modalOpen && !dungeonPrompt && !eventInteraction && (
      <div className="absolute bottom-[210px] left-1/2 z-40 -translate-x-1/2 rounded-box bg-black/75 p-3 text-white">
        <button type="button" className="btn btn-primary btn-sm" onClick={interact}>
          Press <kbd className="kbd kbd-sm">F</kbd> to talk to {nearby.name}
        </button>
      </div>
    )}
    {dialogue && <HudModal id={NPC_DIALOGUE_MODAL} title={dialogue.name} onClose={closeDialogue} backdrop>
      {merchantAction === "shop" && canBuy ? <ShopModal key={dialogue.id} embedded merchant={merchant} /> :
        merchantAction === "sell" && canSell ? <>
          <p className="mb-3 text-sm">Click an inventory item to sell it.</p>
          <InventoryModal key={dialogue.id} embedded merchant={merchant} />
        </> : <>
          <p className="whitespace-pre-line">{dialogue.dialogue?.text || "Hello, traveler."}</p>
          <NpcQuestPanel key={dialogue.id} npc={dialogue} />
        </>}
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        {merchantAction ? <button type="button" className="btn" onClick={() => setMerchantAction(null)}>Back</button> : <>
          {canBuy && <button type="button" className="btn" disabled={questPending || Boolean(questError)}
            onClick={() => setMerchantAction("shop")}>Shop</button>}
          {canSell && <button type="button" className="btn" disabled={questPending || Boolean(questError)}
            onClick={() => setMerchantAction("sell")}>Sell</button>}
        </>}
        <button type="button" className="btn btn-primary" onClick={closeDialogue}>Close</button>
      </div>
    </HudModal>}
  </>;
};
