import { FantasyBadge, FantasyHudCard, FantasyKey, FantasySectionHeader } from "./fantasy/FantasyUI";
import React from "react";
import { useWorldEventStore } from "../stores/useWorldEventStore";

export const WorldEventTracker = () => {
  const event = useWorldEventStore((state) => state.event);
  if (!event) return null;
  return (
    <FantasyHudCard className="fantasy-tracker w-64" role="status">
      <FantasySectionHeader className="fantasy-hud-heading">World Event</FantasySectionHeader>
      <div className="font-bold">{event.name}</div>
      {event.inSafeZone && <FantasyBadge tone="success" className="mt-1">In Safe Zone</FantasyBadge>}
      <div className="mt-1 text-sm fantasy-muted">Phase {event.phase} / {event.totalPhases}: {event.phaseName}</div>
      <div className="mt-2 text-sm">{event.objective}: {event.objectiveProgress} / {event.objectiveTarget}</div>
      {event.totalWaves > 1 && <div className="text-xs fantasy-muted">Wave {event.wave} / {event.totalWaves}</div>}
      {event.nextWaveIn > 0 && <div className="text-xs fantasy-muted">Next wave in {event.nextWaveIn}s</div>}
      {event.nearObjective && <div className="mt-1 text-sm font-semibold fantasy-accent">Press <FantasyKey>F</FantasyKey> to {event.interaction === "seal" ? "activate seal" : "clear den"}</div>}
    </FantasyHudCard>
  );
};
