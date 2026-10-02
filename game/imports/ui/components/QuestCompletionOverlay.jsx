import React, { useEffect } from "react";
import { useQuestCompletionStore } from "../stores/useQuestCompletionStore";

export const QuestCompletionOverlay = () => {
  const current = useQuestCompletionStore((state) => state.current);
  const dismiss = useQuestCompletionStore((state) => state.dismiss);

  useEffect(() => {
    if (!current) return;
    const timeout = setTimeout(dismiss, 4000);
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
      <div className="max-w-full rounded-xl border border-yellow-300/60 bg-black/80 px-8 py-5 text-center text-white shadow-[0_0_50px_rgba(250,204,21,0.35)] backdrop-blur-sm">
        <div className="text-sm font-bold uppercase tracking-widest text-yellow-300">Quest Complete!</div>
        <div className="mt-2 text-2xl font-bold">{current.title}</div>
        {rewards && <div className="mt-2 text-sm text-yellow-200">Reward: {rewards}</div>}
      </div>
    </div>
  );
};
