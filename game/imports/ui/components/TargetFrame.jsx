import React, { useEffect, useRef, useState } from "react";
import { useTargetStore } from "../stores/useTargetStore";
import { useBossHealthStore } from "../stores/useBossHealthStore";

const getDangerLevel = (enemyLevel, playerLevel) => {
  const difference = enemyLevel - playerLevel;
  if (difference >= 8) return "extreme";
  if (difference >= 3) return "dangerous";
  return null;
};

export const TargetFrame = ({ currentLevel }) => {
  const target = useTargetStore((state) => state.target);
  const bossVisible = useBossHealthStore((state) => Boolean(state.boss));
  const danger = target ? getDangerLevel(target.level, currentLevel) : null;
  const [popup, setPopup] = useState(null);
  const previousTargetId = useRef(null);
  const warnedTargetId = useRef(null);
  const popupTimeout = useRef(null);

  useEffect(() => {
    if (previousTargetId.current === target?.id) return;
    previousTargetId.current = target?.id || null;
    clearTimeout(popupTimeout.current);
    setPopup(null);
    if (!target || warnedTargetId.current === target.id) return;
    warnedTargetId.current = target.id;
    if (danger) {
      setPopup(danger);
      popupTimeout.current = setTimeout(() => setPopup(null), 3500);
    }
  }, [target?.id, danger]);

  useEffect(() => () => clearTimeout(popupTimeout.current), []);

  if (!target) return null;
  const percentage = target.maxHealth > 0 ? Math.max(0, Math.min(100, target.health / target.maxHealth * 100)) : 0;
  return (
    <>
      <div className={`target-frame ${bossVisible ? "target-with-boss" : ""} pointer-events-none absolute left-1/2 top-4 z-[10000] w-64 -translate-x-1/2 rounded-box border border-white/30 bg-black/80 p-2 text-white shadow-lg`}>
        <div className="mb-1 flex items-center justify-between gap-2 text-xs">
          <span className="font-bold">{target.name} <span className="font-normal text-white/70">Level {target.level}</span></span>
          <span>{Math.ceil(target.health)} / {target.maxHealth} HP</span>
        </div>
        <div role="progressbar" aria-label={`${target.name} health`} aria-valuenow={target.health} aria-valuemin={0} aria-valuemax={target.maxHealth}
          className="h-3 overflow-hidden rounded bg-gray-800">
          <div className="h-full bg-red-500 transition-[width] duration-150" style={{ width: `${percentage}%` }} />
        </div>
        {danger && <div className="mt-2 text-center text-sm font-bold text-red-400">⚠ {danger === "extreme" ? "Extremely Dangerous" : "Dangerous Enemy"}</div>}
      </div>
      {popup && (
        <div className="pointer-events-none fixed left-1/2 top-[58%] z-[11000] w-full max-w-md -translate-x-1/2 px-4 text-center text-red-400 drop-shadow-[0_2px_3px_black]" role="status" aria-live="polite">
          <div>
            <div className="text-2xl font-bold">{popup === "extreme" ? "Extremely Dangerous Enemy" : "Dangerous Enemy"}</div>
            <div className="mt-2 text-sm font-semibold">{popup === "extreme" ? "This enemy is far above your level." : "This enemy is 5+ levels above you."}</div>
          </div>
        </div>
      )}
    </>
  );
};
