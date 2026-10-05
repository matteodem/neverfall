import React from "react";
import { getDungeonConfig } from "../../game/dungeonConfig";
import { useDungeonStore } from "../stores/useDungeonStore";
import { useHudStore } from "../stores/useHudStore";

const ACTIONS = { enter: "Enter Dungeon", reward: "Open Reward Chest", exit: "Exit Dungeon",
  towerChest: "Open Tower Chest", riftSeal: "Activate rift seal" };

export const DungeonPrompt = () => {
  const location = useDungeonStore((state) => state.location);
  const dungeonId = useDungeonStore((state) => state.dungeonId);
  const config = getDungeonConfig(dungeonId);
  const prompt = useDungeonStore((state) => state.prompt);
  const busy = useDungeonStore((state) => state.busy);
  const stage = useDungeonStore((state) => state.stage);
  const completed = useDungeonStore((state) => state.completed);
  const error = useDungeonStore((state) => state.error);
  const interact = useDungeonStore((state) => state.interact);
  const clearError = useDungeonStore((state) => state.clearError);
  const modalOpen = useHudStore((state) => state.openModals.length > 0);
  if (modalOpen || (location !== "dungeon" && !prompt && !error && !busy)) return null;

  return (
    <div className="absolute bottom-[210px] left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-2 rounded-box bg-black/75 p-3 text-white">
      {config && <p className="text-sm font-semibold">{config.name}</p>}
      {location === "dungeon" && <p className="text-sm">{completed ? "Dungeon complete" : config?.stages[stage]?.name}</p>}
      {location === "world" && prompt === "enter" && config &&
        <p className="text-xs text-white/70">Recommended Level: {config.recommendedLevel}</p>}
      {error && <div role="alert" className="flex items-center gap-2 text-sm text-error"><span>{error}</span><button type="button" className="btn btn-ghost btn-xs" onClick={clearError} aria-label="Dismiss dungeon message">×</button></div>}
      {busy ? <span className="text-sm">Traveling…</span> : prompt && <button type="button" className="btn btn-primary btn-sm" onClick={interact}>{ACTIONS[prompt]} <kbd className="kbd kbd-sm">F</kbd></button>}
    </div>
  );
};
