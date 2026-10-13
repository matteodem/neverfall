import { FantasyHudCard, FantasyMeter } from "./fantasy/FantasyUI";
import React from "react";
import { useTargetStore } from "../stores/useTargetStore";
import { PotionBuffs } from "./PotionBuffs";

export const BossHealthBar = () => {
  const boss = useTargetStore((state) => state.target);
  if (!boss?.isBoss) return null;
  const percentage = Math.max(0, Math.min(100, boss.health / boss.maxHealth * 100));
  return (
    <FantasyHudCard className="boss-health-bar pointer-events-none absolute left-1/2 top-4 z-[10000] w-[min(24rem,45%)] -translate-x-1/2">
      <div className="mb-2 flex items-center justify-between gap-2 text-sm">
        <span className="font-bold">{boss.name} <span className="font-normal fantasy-muted">Level {boss.level}</span></span>
        <span className="text-xs">{Math.ceil(boss.health)} / {boss.maxHealth} HP</span>
      </div>
      <FantasyMeter value={boss.health} max={boss.maxHealth} percentage={percentage}
          label={`${boss.name} health`} tone="danger" className="h-5" />
      <PotionBuffs buffs={boss} className="pointer-events-auto mt-2 flex flex-wrap items-center gap-1" />
    </FantasyHudCard>
  );
};
