import React, { useEffect, useState } from "react";

import { isBlockingModal, useHudStore } from "../stores/useHudStore";
import { useMobileDevice } from "../hooks/useMobileDevice";
import { FantasyModalFrame } from "./fantasy/FantasyUI";

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
  const { mobile } = useMobileDevice();
  const blocking = useHudStore((state) => isBlockingModal(state, id)) || backdrop || mobile;
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
    <FantasyModalFrame
      title={title}
      onClose={dismiss}
      headerClassName={`hud-modal-header ${blocking ? "" : "cursor-move"} select-none`}
      headerProps={{ onPointerDown: blocking ? undefined : startDragging }}
      closeClassName="hud-modal-close"
      bodyClassName={`hud-modal-body ${scrollable ? "overflow-auto" : "overflow-visible"} p-4`}
      role="dialog"
      aria-modal={blocking || undefined}
      aria-label={title}
      className={`pointer-events-auto ${blocking ? "relative" : "absolute"} hud-modal ${className} max-h-[calc(var(--game-height,100vh)-16px)] w-[min(32rem,calc(var(--game-width,100vw)-16px))] ${scrollable ? "overflow-hidden" : "overflow-visible"}`}
      style={{
        ...(blocking ? {} : { left: position.x, top: position.y,
          transform: "translateX(-50%) scale(var(--hud-modal-scale, 1))" }),
        ...(maxHeight ? { maxHeight: `min(${typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight}, calc(var(--game-height, 100vh) - 16px))` } : {}),
        ...(width ? { width: `min(${width}px, calc(var(--game-width, 100vw) - 16px))` } : {}),
      }}
      onPointerDown={() => openModal(id)}
    >
      {children}
    </FantasyModalFrame>
  );

  if (!blocking) {
    return <div className="pointer-events-none fixed inset-0" style={{ zIndex: MODAL_Z_INDEX + index }}>{modal}</div>;
  }

  return (
    <div className="pointer-events-auto fixed inset-0" style={{ zIndex: BLOCKING_MODAL_Z_INDEX + index }}>
      <div className="fantasy-modal-backdrop absolute inset-0" onClick={dismiss} />
      <div className="pointer-events-none absolute inset-0 grid place-items-center">{modal}</div>
    </div>
  );
};
