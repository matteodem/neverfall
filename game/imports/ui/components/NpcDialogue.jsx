import { FantasyButton, FantasyHudCard, FantasyKey, FantasyPanel, FantasySectionHeader } from "./fantasy/FantasyUI";
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
      <FantasyHudCard className="fantasy-prompt absolute bottom-[210px] left-1/2 z-40 -translate-x-1/2">
        <FantasyButton className="btn-sm" onClick={interact}>
          Press <FantasyKey>F</FantasyKey> to talk to {nearby.name}
        </FantasyButton>
      </FantasyHudCard>
    )}
    {dialogue && <HudModal id={NPC_DIALOGUE_MODAL} title={dialogue.name} onClose={closeDialogue}
      className="quest-modal" backdrop>
      {merchantAction === "shop" && canBuy ? <ShopModal key={dialogue.id} embedded merchant={merchant} /> :
        merchantAction === "sell" && canSell ? <div className="fantasy-stack">
          <p className="text-sm fantasy-muted">Choose an inventory item to sell.</p>
          <InventoryModal key={dialogue.id} embedded merchant={merchant} fantasy />
        </div> : <div className="fantasy-stack">
          <FantasyPanel as="section" className="fantasy-section">
            <FantasySectionHeader className="fantasy-heading-inline">Dialogue</FantasySectionHeader>
            <p className="mt-2 whitespace-pre-line text-sm">{dialogue.dialogue?.text || "Hello, traveler."}</p>
          </FantasyPanel>
          <NpcQuestPanel key={dialogue.id} npc={dialogue} fantasy />
        </div>}
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        {merchantAction ? <FantasyButton variant="secondary" onClick={() => setMerchantAction(null)}>Back</FantasyButton> : <>
          {canBuy && <FantasyButton variant="secondary" disabled={questPending || Boolean(questError)}
            onClick={() => setMerchantAction("shop")}>Shop</FantasyButton>}
          {canSell && <FantasyButton variant="secondary" disabled={questPending || Boolean(questError)}
            onClick={() => setMerchantAction("sell")}>Sell</FantasyButton>}
        </>}
        <FantasyButton onClick={closeDialogue}>Close</FantasyButton>
      </div>
    </HudModal>}
  </>;
};
