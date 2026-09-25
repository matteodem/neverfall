import React from "react";
import { useLootStore } from "../stores/useLootStore";
import { useHudStore } from "../stores/useHudStore";

export const LootPrompt = () => {
  const nearbyId = useLootStore((state) => state.nearbyId);
  const activeModal = useHudStore((state) => state.activeModal);
  if (!nearbyId || activeModal) return null;

  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-black/70 px-4 py-2 text-white">
      Press F to loot
    </div>
  );
};
