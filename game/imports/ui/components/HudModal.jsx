import React, { useEffect, useState } from "react";

import { isBlockingModal, useHudStore } from "../stores/useHudStore";

const MODAL_Z_INDEX = 20000;
const BLOCKING_MODAL_Z_INDEX = 30000;

const getInitialPosition = () => {
  const game = typeof document === "undefined" ? null : document.querySelector(".mobile-game");
  const viewportWidth = game?.clientWidth || (typeof window === "undefined" ? 1024 : window.innerWidth);
  const viewportHeight = game?.clientHeight || (typeof window === "undefined" ? 768 : window.innerHeight);

  return {
    x: viewportWidth / 2,
    y: Math.max(8, Math.min(viewportHeight - 120, 75)),
  };
};

export const HudModal = ({ id, title, children, embedded = false, backdrop = false, onClose, maxHeight, width, scrollable = true, className = "" }) => {
  const blocking = useHudStore((state) => isBlockingModal(state, id)) || backdrop;
  const openModals = useHudStore((state) => state.openModals);
  const openModal = useHudStore((state) => state.openModal);
  const closeModal = useHudStore((state) => state.closeModal);
  const dismiss = () => {
    onClose?.();
    closeModal(id);
  };
  const index = openModals.indexOf(id);
  const isOpen = index >= 0;
  const [position, setPosition] = useState(getInitialPosition);
  const [drag, setDrag] = useState(null);

  useEffect(() => {
    if (isOpen) setPosition(getInitialPosition());
  }, [isOpen, id]);

  useEffect(() => {
    if (!drag) return undefined;

    const handlePointerMove = (event) => {
      const game = document.querySelector(".mobile-game");
      const maxX = Math.max(8, (game?.clientWidth || window.innerWidth) - 120);
      const maxY = Math.max(8, (game?.clientHeight || window.innerHeight) - 56);
      let dx = event.clientX - drag.pointerX;
      let dy = event.clientY - drag.pointerY;
      if (game?.classList.contains("mobile-portrait")) [dx, dy] = [dy, -dx];
      setPosition({
        x: Math.max(8, Math.min(maxX, drag.x + dx)),
        y: Math.max(8, Math.min(maxY, drag.y + dy)),
      });
    };
    const handlePointerUp = () => setDrag(null);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [drag]);

  if (embedded) return <>{children}</>;
  if (!isOpen) return null;

  const startDragging = (event) => {
    if (blocking) return;
    if (event.target.closest("button")) return;
    event.preventDefault();
    setDrag({
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: position.x,
      y: position.y,
    });
  };

  const modal = (
    <div
      role="dialog"
      aria-modal={blocking || undefined}
      aria-label={title}
      className={`pointer-events-auto ${blocking ? "relative" : "absolute"} hud-modal ${className} flex max-h-[calc(var(--game-height,100vh)-16px)] w-[min(32rem,calc(var(--game-width,100vw)-16px))] flex-col ${scrollable ? "overflow-hidden" : "overflow-visible"} rounded-box bg-base-100 text-base-content shadow-2xl`}
      style={{
        ...(blocking ? {} : { left: position.x, top: position.y,
          transform: "translateX(-50%) scale(var(--hud-modal-scale, 1))" }),
        ...(maxHeight ? { maxHeight: `min(${typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight}, calc(var(--game-height, 100vh) - 16px))` } : {}),
        ...(width ? { width: `min(${width}px, calc(var(--game-width, 100vw) - 16px))` } : {}),
      }}
      onPointerDown={() => openModal(id)}
    >
      <div
        className={`hud-modal-header flex shrink-0 ${blocking ? "" : "cursor-move"} select-none items-center justify-between border-b border-base-300 px-4 py-3`}
        onPointerDown={blocking ? undefined : startDragging}
      >
        <h3 className="text-xl font-bold">{title}</h3>
        <button
          type="button"
          className="hud-modal-close btn btn-sm btn-circle btn-ghost cursor-pointer"
          onClick={dismiss}
        >
          ✕
        </button>
      </div>
      <div className={`hud-modal-body ${scrollable ? "min-h-0 overflow-auto" : "overflow-visible"} p-4`}>{children}</div>
    </div>
  );

  if (!blocking) {
    return <div className="pointer-events-none fixed inset-0" style={{ zIndex: MODAL_Z_INDEX + index }}>{modal}</div>;
  }

  return (
    <div className="pointer-events-auto fixed inset-0" style={{ zIndex: BLOCKING_MODAL_Z_INDEX + index }}>
      <div className="absolute inset-0 bg-black/30" onClick={dismiss} />
      <div className="pointer-events-none absolute inset-0 grid place-items-center">{modal}</div>
    </div>
  );
};
