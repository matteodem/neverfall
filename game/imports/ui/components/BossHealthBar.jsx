import React from "react";
import { useBossHealthStore } from "../stores/useBossHealthStore";

export const BossHealthBar = () => {
  const boss = useBossHealthStore((state) => state.boss);
  if (!boss) return null;
  const percentage = Math.max(0, Math.min(100, boss.health / boss.maxHealth * 100));
  return (
    <div className="boss-health-bar pointer-events-none absolute left-1/2 top-4 z-[10000] w-[min(24rem,45%)] -translate-x-1/2 rounded-box border border-red-400/50 bg-black/80 p-3 text-white shadow-lg">
      <div className="mb-2 flex items-center justify-between gap-2 text-sm">
        <span className="font-bold">{boss.name}</span>
        <span className="text-xs">{Math.ceil(boss.health)} / {boss.maxHealth} HP</span>
      </div>
      <div role="progressbar" aria-label={`${boss.name} health`} aria-valuenow={boss.health} aria-valuemin={0} aria-valuemax={boss.maxHealth}
        className="h-5 overflow-hidden rounded bg-gray-800">
        <div className="h-full bg-red-500 transition-[width] duration-150" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};
