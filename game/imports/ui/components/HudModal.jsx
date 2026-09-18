import React from "react";

import {
  useHudStore,
} from "../stores/useHudStore";

export const HudModal = ({
  id,
  title,
  children,
}) => {
  const activeModal =
    useHudStore(
      (state) =>
        state.activeModal
    );

  const closeModal =
    useHudStore(
      (state) =>
        state.closeModal
    );

  if (activeModal !== id) {
    return null;
  }

  return (
    <dialog
      className="modal modal-open"
      open
    >
      <div className="modal-box">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">
            {title}
          </h3>

          <button
            className="btn btn-sm btn-circle btn-ghost"
            onClick={closeModal}
          >
            ✕
          </button>
        </div>

        <div className="py-4">
          {children}
        </div>
      </div>

      <div
        className="modal-backdrop"
        onClick={closeModal}
      />
    </dialog>
  );
};