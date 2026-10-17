import React, { useState } from "react";
import { WORLD_EDITOR_ASSETS } from "../../game/editor/worldEditorAssets";

const entries = Object.entries(WORLD_EDITOR_ASSETS);
const categories = ["All", ...new Set(entries.map(([, asset]) => asset.category))];

export const WorldEditorAssetLibrary = ({ selectedAsset, busy, onSelect }) => {
  const [category, setCategory] = useState("All");
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Asset Library</h3>
      <div role="tablist" aria-label="Asset categories" className="tabs tabs-box tabs-sm">
        {categories.map((name) => <button key={name} type="button" role="tab" aria-selected={category === name}
          className={`tab ${category === name ? "tab-active" : ""}`} onClick={() => setCategory(name)}>{name}</button>)}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {entries.filter(([, asset]) => category === "All" || category === asset.category).map(([id, asset]) => (
          <button key={id} type="button" disabled={busy} aria-pressed={selectedAsset === id}
            className={`btn btn-sm h-auto min-h-10 whitespace-normal text-xs ${selectedAsset === id ? "btn-primary" : "btn-outline"}`}
            onClick={() => onSelect(id)}>{asset.name}</button>
        ))}
      </div>
      {/* 3D preview temporarily disabled. Keep its component and renderer for reuse,
          but do not import or mount them here to avoid preview engines and GLB loads. */}
    </div>
  );
};
