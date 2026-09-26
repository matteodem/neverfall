import React, { useEffect, useRef, useState } from "react";
import { Joystick } from "react-joystick-component";
import { useMobileControlsStore } from "../stores/useMobileControlsStore";
import { useHudStore } from "../stores/useHudStore";

export const MobileJoystick = ({ portrait, disabled }) => {
  const area = useRef(null);
  const pointer = useRef(null);
  const [origin, setOrigin] = useState(null);
  const direction = useMobileControlsStore((state) => state.direction);
  const modalOpen = useHudStore((state) => state.openModals.length > 0);
  const size = Math.min(window.innerWidth, window.innerHeight) * 0.25;
  const stop = () => {
    pointer.current = null;
    setOrigin(null);
    useMobileControlsStore.getState().reset();
  };
  useEffect(() => {
    stop();
    window.addEventListener("blur", stop);
    window.addEventListener("resize", stop);
    return () => {
      window.removeEventListener("blur", stop);
      window.removeEventListener("resize", stop);
      useMobileControlsStore.getState().reset();
    };
  }, [portrait, disabled, modalOpen]);

  const point = (event) => {
    const bounds = area.current.getBoundingClientRect();
    return portrait
      ? { x: event.clientY - bounds.top, y: bounds.right - event.clientX }
      : { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  };
  return (
    <div ref={area} className="mobile-joystick-area" style={{ pointerEvents: disabled || modalOpen ? "none" : "auto" }}
      onPointerDown={(event) => {
        if (pointer.current !== null) return;
        pointer.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
        setOrigin(point(event));
      }}
      onPointerMove={(event) => {
        if (event.pointerId !== pointer.current || !origin) return;
        const position = point(event);
        const x = (position.x - origin.x) / (size / 2);
        const y = (origin.y - position.y) / (size / 2);
        const length = Math.max(1, Math.hypot(x, y));
        useMobileControlsStore.getState().setDirection({ x: x / length, y: y / length });
      }}
      onPointerUp={(event) => { if (event.pointerId === pointer.current) stop(); }}
      onPointerCancel={(event) => { if (event.pointerId === pointer.current) stop(); }}
      onLostPointerCapture={(event) => { if (event.pointerId === pointer.current) stop(); }}
    >
      {origin && <div style={{ position: "absolute", left: origin.x - size / 2, top: origin.y - size / 2, opacity: 0.7, pointerEvents: "none" }}>
        <Joystick size={size} stickSize={size * 0.4} baseColor="#666666" stickColor="#aaaaaa" disabled pos={direction} />
      </div>}
    </div>
  );
};
