import React, { useEffect, useState } from "react";

import { useHudStore } from "../stores/useHudStore";

const getInitialPosition = (id) => {
  const viewportWidth = typeof window === "undefined" ? 1024 : window.innerWidth;
  const viewportHeight = typeof window === "undefined" ? 768 : window.innerHeight;
  const offset = { inventory: 0, gear: 40, help: 80, settings: 120 }[id] || 0;

  return {
    x: Math.max(8, Math.min(viewportWidth - 120, viewportWidth * 0.28 + offset)),
    y: Math.max(8, Math.min(viewportHeight - 120, 96 + offset)),
  };
};

export const HudModal = ({ id, title, children, backdrop = false, onClose, maxHeight }) => {
  const openModals = useHudStore((state) => state.openModals);
  const openModal = useHudStore((state) => state.openModal);
  const closeModal = useHudStore((state) => state.closeModal);
  const dismiss = () => {
    onClose?.();
    closeModal(id);
  };
  const index = openModals.indexOf(id);
  const isOpen = index >= 0;
  const [position, setPosition] = useState(() => getInitialPosition(id));
  const [drag, setDrag] = useState(null);

  useEffect(() => {
    if (isOpen) setPosition(getInitialPosition(id));
  }, [isOpen, id]);

  useEffect(() => {
    if (!drag) return undefined;

    const handlePointerMove = (event) => {
      const maxX = Math.max(8, window.innerWidth - 120);
      const maxY = Math.max(8, window.innerHeight - 56);
      setPosition({
        x: Math.max(8, Math.min(maxX, drag.x + event.clientX - drag.pointerX)),
        y: Math.max(8, Math.min(maxY, drag.y + event.clientY - drag.pointerY)),
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

  if (!isOpen) return null;

  const startDragging = (event) => {
    if (backdrop) return;
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
      className={`pointer-events-auto ${backdrop ? "relative" : "absolute"} flex max-h-[calc(100vh-16px)] w-[min(32rem,calc(100vw-16px))] flex-col overflow-hidden rounded-box bg-base-100 text-base-content shadow-2xl`}
      style={{
        ...(backdrop ? {} : { left: position.x, top: position.y }),
        ...(maxHeight ? { maxHeight: `min(${maxHeight}px, calc(100vh - 16px))` } : {}),
      }}
      onPointerDown={() => openModal(id)}
    >
      <div
        className={`flex shrink-0 ${backdrop ? "" : "cursor-move"} select-none items-center justify-between border-b border-base-300 px-4 py-3`}
        onPointerDown={backdrop ? undefined : startDragging}
      >
        <h3 className="text-xl font-bold">{title}</h3>
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost cursor-pointer"
          onClick={dismiss}
        >
          ✕
        </button>
      </div>
      <div className="overflow-auto p-4">{children}</div>
    </div>
  );

  if (!backdrop) {
    return <div className="pointer-events-none fixed inset-0" style={{ zIndex: 50 + index }}>{modal}</div>;
  }

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/30" onClick={dismiss} />
      <div className="pointer-events-none absolute inset-0 grid place-items-center">{modal}</div>
    </div>
  );
};
