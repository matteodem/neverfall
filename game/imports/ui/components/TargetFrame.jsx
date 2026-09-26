import React from "react";
import { useTargetStore } from "../stores/useTargetStore";
import { useBossHealthStore } from "../stores/useBossHealthStore";

export const TargetFrame = () => {
  const target = useTargetStore((state) => state.target);
  const bossVisible = useBossHealthStore((state) => Boolean(state.boss));
  if (!target) return null;
  const percentage = target.maxHealth > 0 ? Math.max(0, Math.min(100, target.health / target.maxHealth * 100)) : 0;
  return (
    <div className={`target-frame ${bossVisible ? "target-with-boss" : ""} pointer-events-none absolute left-1/2 top-4 z-[10000] w-64 -translate-x-1/2 rounded-box border border-white/30 bg-black/80 p-2 text-white shadow-lg`}>
      <div className="mb-1 flex items-center justify-between gap-2 text-xs">
        <span className="font-bold">{target.name}</span>
        <span>{Math.ceil(target.health)} / {target.maxHealth} HP</span>
      </div>
      <div role="progressbar" aria-label={`${target.name} health`} aria-valuenow={target.health} aria-valuemin={0} aria-valuemax={target.maxHealth}
        className="h-3 overflow-hidden rounded bg-gray-800">
        <div className="h-full bg-red-500 transition-[width] duration-150" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};
