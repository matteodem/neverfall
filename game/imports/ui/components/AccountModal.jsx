import React, { useEffect, useRef } from "react";

export const AccountModal = ({ title, busy, onClose, children }) => {
  const dialog = useRef(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  const dismiss = () => { if (!busy) onClose(); };
  return (
    <dialog ref={dialog} className="modal" aria-label={title}
      onCancel={(event) => { event.preventDefault(); dismiss(); }}>
      <div className="modal-box text-base-content">
        <h3 className="text-lg font-bold">{title}</h3>
        {children}
      </div>
      <div className="modal-backdrop">
        <button type="button" disabled={busy} onClick={dismiss} aria-label="Close">close</button>
      </div>
    </dialog>
  );
};
