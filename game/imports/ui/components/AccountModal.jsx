import React, { useEffect, useRef } from "react";
import { FantasyModalFrame } from "./fantasy/FantasyUI";

export const AccountModal = ({ title, busy, onClose, children }) => {
  const dialog = useRef(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  const dismiss = () => { if (!busy) onClose(); };
  return (
    <dialog ref={dialog} className="modal fantasy-dialog" aria-label={title}
      onCancel={(event) => { event.preventDefault(); dismiss(); }}>
      <FantasyModalFrame className="modal-box" title={title} onClose={dismiss} closeDisabled={busy}>
        {children}
      </FantasyModalFrame>
      <div className="modal-backdrop">
        <button type="button" disabled={busy} onClick={dismiss} aria-label="Close">close</button>
      </div>
    </dialog>
  );
};
