import React, { useEffect, useRef, useState } from "react";
import { Meteor } from "meteor/meteor";

const targets = [
  { kind: "worldObjects", label: "World Objects", file: "world-objects.json" },
  { kind: "terrainPaint", label: "Terrain Paint", file: "terrain-paint.json" },
];

export const WorldEditorJsonSync = ({ busy, actions }) => {
  const [target, setTarget] = useState(null);
  const dialog = useRef(null);
  useEffect(() => { if (target) dialog.current?.showModal(); }, [target]);
  if (!Meteor.isDevelopment) return null;
  return <>
    {targets.map((item) => (
      <button key={item.kind} type="button" className="btn btn-warning btn-outline btn-sm" disabled={busy}
        onClick={() => setTarget(item)}>Sync {item.label} from JSON</button>
    ))}
    {target && (
      <dialog ref={dialog} className="modal" aria-labelledby="world-editor-sync-title"
        aria-describedby="world-editor-sync-warning"
        onCancel={(event) => { event.preventDefault(); setTarget(null); }}>
        <div className="modal-box">
          <h3 id="world-editor-sync-title" className="text-lg font-bold">Sync {target.label} from JSON?</h3>
          <p id="world-editor-sync-warning" className="py-4">
            All local MongoDB {target.label} changes will be overwritten by {target.file}.
            Only this collection will be replaced. The other collection will not be changed.
          </p>
          <div className="modal-action">
            <button type="button" className="btn" autoFocus onClick={() => setTarget(null)}>Cancel</button>
            <button type="button" className="btn btn-warning" disabled={busy} onClick={() => {
              setTarget(null);
              void actions?.syncFromJson(target.kind);
            }}>Overwrite MongoDB</button>
          </div>
        </div>
        <div className="modal-backdrop">
          <button type="button" aria-label="Cancel sync" onClick={() => setTarget(null)}>close</button>
        </div>
      </dialog>
    )}
  </>;
};
