import { FantasyButton, FantasyHudCard, FantasyKey } from "./fantasy/FantasyUI";
import { useMobileDevice } from "../hooks/useMobileDevice";
import { useActionBarStore } from "../stores/useActionBarStore";
import { useDungeonStore } from "../stores/useDungeonStore";
import React from "react";
import { useLootStore } from "../stores/useLootStore";
import { useHudStore } from "../stores/useHudStore";

export const LootPrompt = () => {
  const { mobile } = useMobileDevice();
  const dungeonPrompt = useDungeonStore((state) => state.prompt);
  const nearbyId = useLootStore((state) => state.nearbyId);
  const hasOpenModal = useHudStore((state) => state.openModals.length > 0);
  if (!nearbyId || hasOpenModal || dungeonPrompt) return null;

  return (
    <FantasyHudCard className={`fantasy-prompt pointer-events-none absolute left-1/2 -translate-x-1/2 ${mobile ? "top-3/5 z-50" : "top-1/4 -translate-y-1/2"}`}>
      {mobile ? <FantasyButton className="pointer-events-auto btn-sm" onClick={() => useActionBarStore.getState().triggerSkill("KeyF")}>Loot</FantasyButton> : <>Press <FantasyKey>F</FantasyKey> to loot</>}
    </FantasyHudCard>
  );
};
