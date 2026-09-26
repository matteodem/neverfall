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
    <div className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 rounded bg-black/70 px-4 py-2 text-white">
      {mobile ? <button type="button" className="pointer-events-auto btn btn-sm" onClick={() => useActionBarStore.getState().triggerSkill("KeyF")}>Loot</button> : "Press F to loot"}
    </div>
  );
};
