import React, { useEffect, useRef, useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { useHudStore } from "../../stores/useHudStore";
import { FantasyModalFrame, FantasyPanel } from "../fantasy/FantasyUI";

const MODAL_ID = "admin-analytics";

const AnalyticsDialog = () => {
  const dialogRef = useRef(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const dismiss = () => useHudStore.getState().closeModal(MODAL_ID);

  useEffect(() => {
    let cancelled = false;
    const previousFocus = document.activeElement;
    const dialog = dialogRef.current;
    dialog.showModal();
    Meteor.callAsync("analytics.getSummary").then((result) => {
      if (!cancelled) setSummary(result);
    }).catch(() => {
      if (!cancelled) setError("Could not load analytics. Close this window and try again.");
    });
    return () => {
      cancelled = true;
      dialog.close();
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  const metrics = summary && [
    ["Unique Players", summary.uniquePlayers, "All time"],
    ["Daily Active Players", summary.dailyActivePlayers, "Today, UTC"],
    ["Sessions", summary.totalSessions, "All time"],
    ["Average Session Duration", `${summary.averageSessionMinutes} min`, "All time · completed or timed out"],
  ];

  return (
    <dialog ref={dialogRef} className="modal fantasy-dialog" aria-label="Admin Analytics"
      onCancel={(event) => { event.preventDefault(); dismiss(); }}
      onKeyDown={(event) => event.stopPropagation()} onKeyUp={(event) => event.stopPropagation()}>
      <FantasyModalFrame title="Admin Analytics" onClose={dismiss} className="modal-box" bodyClassName="overflow-y-auto">
        {!summary && !error && <p role="status" className="mt-4">Loading analytics…</p>}
        {error && <p role="alert" className="mt-4 fantasy-danger">{error}</p>}
        {summary && <>
          {!summary.totalSessions && <p role="status" className="mt-4">No game sessions recorded yet.</p>}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {metrics.map(([label, value, window]) => (
              <FantasyPanel key={label} className="min-w-0 p-3">
                <p className="text-sm font-medium">{label}</p>
                <p className="my-2 break-words text-2xl font-bold">{value}</p>
                <p className="fantasy-muted text-xs">{window}</p>
              </FantasyPanel>
            ))}
          </div>
          <p className="fantasy-muted mt-4 text-xs">Recorded since tracking was enabled. Active sessions are excluded from average duration; timed-out sessions end at their last recorded activity.</p>
        </>}
      </FantasyModalFrame>
      <div className="modal-backdrop">
        <button type="button" aria-label="Dismiss analytics" onClick={dismiss}>close</button>
      </div>
    </dialog>
  );
};

export const AdminAnalyticsModal = () => {
  const userId = useTracker(() => Meteor.userId(), []);
  const [adminId, setAdminId] = useState(null);
  const adminIdRef = useRef(null);
  adminIdRef.current = adminId;
  const open = useHudStore((state) => state.openModals.includes(MODAL_ID));

  useEffect(() => {
    let cancelled = false;
    setAdminId(null);
    useHudStore.getState().closeModal(MODAL_ID);
    if (userId) Meteor.callAsync("analytics.isAdmin").then((allowed) => {
      if (!cancelled && allowed) setAdminId(userId);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.repeat || event.code !== "KeyE" || !event.shiftKey ||
        !(event.ctrlKey || event.metaKey) || event.altKey ||
        event.target?.closest?.("input, textarea, select, [contenteditable]:not([contenteditable='false'])")) return;
      if (!adminIdRef.current || adminIdRef.current !== Meteor.userId()) return;
      const hud = useHudStore.getState();
      if (hud.openModals.includes(MODAL_ID)) return;
      event.preventDefault();
      event.stopPropagation();
      hud.openModal(MODAL_ID);
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      useHudStore.getState().closeModal(MODAL_ID);
    };
  }, []);

  return open && userId && adminId === userId ? <AnalyticsDialog /> : null;
};
