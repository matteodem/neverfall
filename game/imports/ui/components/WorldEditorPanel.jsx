import React from "react";
import { useWorldEditorStore } from "../stores/useWorldEditorStore";

export const WorldEditorPanel = () => {
  const { enabled, asset, selected, tool, busy, error, actions } = useWorldEditorStore();
  if (!enabled) return null;
  return (
    <section aria-label="World editor" className="card fixed left-4 top-24 z-[90] w-64 border border-base-300 bg-base-100/95 shadow-xl">
      <div className="card-body gap-3 p-4">
        <div className="flex items-center justify-between">
          <h2 className="card-title text-base">Build Mode</h2>
          <button type="button" className="btn btn-ghost btn-xs" aria-label="Close Build Mode" onClick={() => actions?.close()}>✕</button>
        </div>
        <button type="button" aria-pressed={asset === "fence"} disabled={busy}
          className={`btn btn-sm ${asset === "fence" ? "btn-primary" : "btn-outline"}`}
          onClick={() => actions?.selectFence()}>Fence</button>
        <div className="join">
          {["move", "rotate"].map((mode) => (
            <button key={mode} type="button" disabled={!selected || busy} aria-pressed={tool === mode}
              className={`btn btn-sm join-item flex-1 capitalize ${tool === mode ? "btn-primary" : "btn-outline"}`}
              onClick={() => actions?.setTool(mode)}>{mode}</button>
          ))}
        </div>
        <button type="button" className="btn btn-error btn-outline btn-sm" disabled={!selected || busy}
          onClick={() => actions?.deleteSelected()}>Delete selected</button>
        <p className="text-xs opacity-80" role="status">
          {busy ? "Loading / saving…" : asset === "fence" ? "Click terrain to place a fence."
            : selected ? "Drag the gizmo to move or rotate this fence." : "Choose Fence to place, or click a placed fence to edit."}
        </p>
        {error && <p className="text-xs text-error" role="alert">{error}</p>}
        <p className="text-xs opacity-60">Ctrl+Shift+R to close · Placement and gizmo release save changes.</p>
      </div>
    </section>
  );
};
