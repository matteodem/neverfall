import { FantasyNotice, FantasySectionHeader } from "./fantasy/FantasyUI";
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
    <div className="fantasy-toast-slot" role="status" aria-live="polite">
      <FantasyNotice tone="reward" className="w-full max-w-sm text-center">
        <FantasySectionHeader className="fantasy-hud-heading">Quest Complete</FantasySectionHeader>
        <div className="mt-1 text-base font-bold">{current.title}</div>
        {rewards && <div className="mt-1 text-xs fantasy-muted">{rewards}</div>}
      </FantasyNotice>
    </div>
  );
};
