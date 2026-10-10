import React, { useEffect } from "react";
import { HudModal } from "./HudModal";
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
      <p className="whitespace-pre-line">{dialogue.dialogue?.text || "Hello, traveler."}</p>
      <div className="mt-4 flex justify-end">
        <button type="button" className="btn btn-primary" onClick={closeDialogue}>Close</button>
      </div>
    </HudModal>}
  </>;
};
