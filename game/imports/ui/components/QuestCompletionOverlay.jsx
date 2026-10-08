import React, { useEffect } from "react";
import { useQuestCompletionStore } from "../stores/useQuestCompletionStore";

export const QuestCompletionOverlay = () => {
  const current = useQuestCompletionStore((state) => state.current);
  const dismiss = useQuestCompletionStore((state) => state.dismiss);

  useEffect(() => {
    if (!current) return;
    const timeout = setTimeout(dismiss, 3000);
    return () => clearTimeout(timeout);
  }, [current, dismiss]);

  if (!current) return null;
  const rewards = [
    current.rewards?.xp && `${current.rewards.xp} XP`,
    current.rewards?.gold && `${current.rewards.gold} Gold`,
    current.rewards?.item,
    current.rewards?.lootType && "Loot",
  ].filter(Boolean).join(" · ");

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[20dvh] z-[11001] flex justify-center px-4" role="status" aria-live="polite">
      <div className="w-full max-w-sm rounded-lg border border-yellow-300/60 bg-black/80 px-4 py-3 text-center text-white shadow-lg">
        <div className="text-xs font-semibold uppercase text-yellow-300">Quest Complete</div>
        <div className="mt-1 text-base font-bold">{current.title}</div>
        {rewards && <div className="mt-1 text-xs text-yellow-200">{rewards}</div>}
      </div>
    </div>
  );
};
