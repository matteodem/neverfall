import React from "react";
import { useWorldEditorStore } from "../stores/useWorldEditorStore";
import { WorldEditorAssetLibrary } from "./WorldEditorAssetLibrary";

export const WorldEditorPanel = () => {
  const { enabled, source, readOnly, asset, previewAsset, selected, tool, busy, error, actions } = useWorldEditorStore();
  if (!enabled) return null;
  return (
    <section aria-label="World editor" className="card fixed left-4 top-24 z-[90] max-h-[calc(100dvh-7rem)] w-72 overflow-y-auto border border-base-300 bg-base-100/95 shadow-xl">
      <div className="card-body gap-3 p-4">
        <div className="flex items-center justify-between">
          <h2 className="card-title text-base">Build Mode</h2>
          <button type="button" className="btn btn-ghost btn-xs" aria-label="Close Build Mode" onClick={() => actions?.close()}>✕</button>
        </div>
        <span className="badge badge-outline badge-sm">{source === "json" ? "JSON · read-only" : "MongoDB"}</span>
        <WorldEditorAssetLibrary selectedAsset={previewAsset} busy={busy} onSelect={(id) => actions?.selectAsset(id)} />
        <div className="join">
          {["move", "rotate"].map((mode) => (
            <button key={mode} type="button" disabled={!selected || busy || readOnly} aria-pressed={tool === mode}
              className={`btn btn-sm join-item flex-1 capitalize ${tool === mode ? "btn-primary" : "btn-outline"}`}
              onClick={() => actions?.setTool(mode)}>{mode}</button>
          ))}
        </div>
        <button type="button" className="btn btn-error btn-outline btn-sm" disabled={!selected || busy || readOnly}
          onClick={() => actions?.deleteSelected()}>Delete selected</button>
        <button type="button" className="btn btn-outline btn-sm" disabled={busy}
          onClick={() => actions?.exportWorld()}>Export World</button>
        <p className="text-xs opacity-80" role="status">
          {busy ? "Working…" : readOnly ? "JSON world data is read-only. Export downloads the MongoDB draft."
            : asset ? "Click terrain to place the selected asset."
            : selected ? "Drag the gizmo to move or rotate this object." : "Choose an asset to place, or click a placed object to edit."}
        </p>
        {error && <p className="text-xs text-error" role="alert">{error}</p>}
        <p className="text-xs opacity-60">Ctrl+Shift+R to close{!readOnly && " · Placement and gizmo release save changes."}</p>
      </div>
    </section>
  );
};
