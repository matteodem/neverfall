import React from "react";
import { useWorldEventStore } from "../stores/useWorldEventStore";

export const WorldEventTracker = () => {
  const event = useWorldEventStore((state) => state.event);
  if (!event) return null;
  return (
    <div className="w-64 rounded-lg border border-orange-300/40 bg-black/70 p-4 text-white shadow-lg" role="status">
      <div className="text-xs font-semibold uppercase text-orange-300">World Event</div>
      <div className="font-bold">{event.name}</div>
      {event.inSafeZone && <div className="mt-1 text-xs font-semibold text-green-300">In Safe Zone</div>}
      <div className="mt-1 text-sm text-white/70">Phase {event.phase} / {event.totalPhases}: {event.phaseName}</div>
      <div className="mt-2 text-sm">{event.objective}: {event.objectiveProgress} / {event.objectiveTarget}</div>
      {event.totalWaves > 1 && <div className="text-xs text-white/70">Wave {event.wave} / {event.totalWaves}</div>}
      {event.nextWaveIn > 0 && <div className="text-xs text-white/70">Next wave in {event.nextWaveIn}s</div>}
      {event.nearObjective && <div className="mt-1 text-sm font-semibold text-orange-200">Press F to {event.interaction === "seal" ? "activate seal" : "clear den"}</div>}
    </div>
  );
};
