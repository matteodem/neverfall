import React from "react";
import { useGroupStore } from "../stores/useGroupStore";
import { FantasyBadge, FantasyButton, FantasyHudCard, FantasyMeter, FantasySectionHeader } from "./fantasy/FantasyUI";

export const GroupPanel = () => {
  const groupId = useGroupStore((state) => state.groupId);
  const members = useGroupStore((state) => state.members);
  const error = useGroupStore((state) => state.error);
  const requestAction = useGroupStore((state) => state.requestAction);
  const clearError = useGroupStore((state) => state.clearError);
  if (!groupId && !error) return null;

  return (
    <section className="game-group-panel absolute left-4 top-24 z-40 w-56 space-y-2" aria-label="Group">
      {error && (
        <FantasyHudCard className="flex items-center gap-2 text-sm fantasy-danger" role="alert">
          <span>{error}</span>
          <FantasyButton variant="ghost" className="btn-xs ml-auto" onClick={clearError} aria-label="Dismiss group message">×</FantasyButton>
        </FantasyHudCard>
      )}
      {groupId && (
        <FantasyHudCard>
          <div className="mb-2 flex items-center justify-between">
            <FantasySectionHeader as="h3" className="my-0">Group</FantasySectionHeader>
            <FantasyButton variant="ghost" className="btn-xs" onClick={() => requestAction("leave")}>Leave</FantasyButton>
          </div>
          <ul className="space-y-3">
            {members.map((member) => (
              <li key={member.sessionId}>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 break-words">{member.name}</span>
                  <FantasyBadge className="shrink-0">Lv {member.level}</FantasyBadge>
                </div>
                <FantasyMeter value={Math.max(0, Math.min(member.health, Math.max(1, member.maxHealth)))} max={Math.max(1, member.maxHealth)}
                  percentage={Math.min(100, Math.max(0, member.health / Math.max(1, member.maxHealth) * 100))}
                  label={`${member.name} health`} className="mt-1 h-2 w-full" />
                <div className="fantasy-muted text-right text-xs">{parseInt(member.health, 10)} / {member.maxHealth}</div>
              </li>
            ))}
          </ul>
        </FantasyHudCard>
      )}
    </section>
  );
};
