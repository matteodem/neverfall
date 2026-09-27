import React from "react";
import { useWorldEventStore } from "../stores/useWorldEventStore";

export const WorldEventTracker = () => {
  const event = useWorldEventStore((state) => state.event);
  if (!event) return null;
  return (
    <div className="w-64 rounded-lg border border-orange-300/40 bg-black/70 p-4 text-white shadow-lg" role="status">
      <div className="text-xs font-semibold uppercase text-orange-300">World Event</div>
      <div className="font-bold">{event.name}</div>
      <div className="mt-1 text-sm text-white/70">
        {event.wave > event.totalWaves ? "Final Boss" : `Wave ${event.wave} / ${event.totalWaves}`}
      </div>
      <div className="mt-2 text-sm">Enemies remaining: {event.enemiesRemaining}</div>
    </div>
  );
};
