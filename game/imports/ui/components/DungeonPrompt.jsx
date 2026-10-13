import { FantasyBadge, FantasyButton, FantasyHudCard, FantasyKey } from "./fantasy/FantasyUI";
import React from "react";
import { getDungeonConfig } from "../../game/dungeonConfig";
import { useDungeonStore } from "../stores/useDungeonStore";
import { useHudStore } from "../stores/useHudStore";

const ACTIONS = { enter: "Enter Dungeon", reward: "Open Reward Chest", exit: "Exit Dungeon",
  towerChest: "Open Tower Chest", hiddenCache: "Open Hidden Cache", riftSeal: "Activate rift seal", questLocation: "Investigate" };

export const DungeonPrompt = () => {
  const location = useDungeonStore((state) => state.location);
  const dungeonId = useDungeonStore((state) => state.dungeonId);
  const config = getDungeonConfig(dungeonId);
  const prompt = useDungeonStore((state) => state.prompt);
  const busy = useDungeonStore((state) => state.busy);
  const stage = useDungeonStore((state) => state.stage);
  const completed = useDungeonStore((state) => state.completed);
  const challengeModeEnabled = useDungeonStore((state) => state.challengeModeEnabled);
  const challengeModeLocked = useDungeonStore((state) => state.challengeModeLocked);
  const error = useDungeonStore((state) => state.error);
  const interact = useDungeonStore((state) => state.interact);
  const clearError = useDungeonStore((state) => state.clearError);
  const modalOpen = useHudStore((state) => state.openModals.length > 0);
  if (modalOpen || (location !== "dungeon" && !prompt && !error && !busy)) return null;

  return (
    <FantasyHudCard className="fantasy-prompt absolute bottom-[210px] left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-2">
      {config && <p className="text-sm font-semibold">{config.name}</p>}
      {location === "dungeon" && <p className="text-sm">{completed ? "Dungeon complete" : config?.stages[stage]?.name}</p>}
      {location === "dungeon" && <FantasyBadge tone="warning">
        Challenge Mode {challengeModeEnabled ? "ON" : "OFF"}{challengeModeLocked ? " · Locked" : ""}
      </FantasyBadge>}
      {location === "world" && prompt === "enter" && config &&
        <p className="text-xs fantasy-muted">Recommended Level: {config.recommendedLevel}</p>}
      {error && <div role="alert" className="flex items-center gap-2 text-sm text-error"><span>{error}</span><FantasyButton variant="ghost" className="btn-xs" onClick={clearError} aria-label="Dismiss dungeon message">×</FantasyButton></div>}
      {prompt === "challengeLocked" && <p className="text-xs fantasy-muted">Challenge Mote locked because combat has started.</p>}
      {busy ? <span className="text-sm">Traveling…</span> : prompt && prompt !== "challengeLocked" && <FantasyButton className="btn-sm" onClick={interact}>{prompt === "challengeMote" ? `${challengeModeEnabled ? "Disable" : "Enable"} Challenge Mode` : ACTIONS[prompt]} <FantasyKey>F</FantasyKey></FantasyButton>}
    </FantasyHudCard>
  );
};
