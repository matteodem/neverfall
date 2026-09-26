import React from "react";
import { useGroupStore } from "../stores/useGroupStore";

export const GroupPanel = () => {
  const groupId = useGroupStore((state) => state.groupId);
  const members = useGroupStore((state) => state.members);
  const error = useGroupStore((state) => state.error);
  const requestAction = useGroupStore((state) => state.requestAction);
  const clearError = useGroupStore((state) => state.clearError);
  if (!groupId && !error) return null;

  return (
    <section className="absolute left-6 top-24 z-40 w-56 space-y-2" aria-label="Group">
      {error && (
        <div className="alert alert-error text-sm" role="alert">
          <span>{error}</span>
          <button type="button" className="btn btn-ghost btn-xs" onClick={clearError} aria-label="Dismiss group message">×</button>
        </div>
      )}
      {groupId && (
        <div className="rounded-box bg-base-100/90 p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-semibold">Group</span>
            <button type="button" className="btn btn-ghost btn-xs" onClick={() => requestAction("leave")}>Leave</button>
          </div>
          <ul className="space-y-3">
            {members.map((member) => (
              <li key={member.sessionId}>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{member.name}</span>
                  <span className="shrink-0 text-xs">Level {member.level}</span>
                </div>
                <progress
                  className="progress progress-success block w-full"
                  value={Math.max(0, member.health)}
                  max={Math.max(1, member.maxHealth)}
                  aria-label={`${member.name} health`}
                />
                <div className="text-right text-xs opacity-70">{member.health} / {member.maxHealth}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
