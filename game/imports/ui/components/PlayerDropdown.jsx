import { useChatStore } from "../stores/useChatStore";
import { useGroupStore } from "../stores/useGroupStore";
import React, { useEffect, useLayoutEffect, useRef } from "react";

export const PlayerDropdown = ({ selection, onClose }) => {
  const invite = () => {
    useGroupStore.getState().requestAction("invite", selection.sessionId);
    onClose();
  };

  const menuRef = useRef(null);

  useLayoutEffect(() => {
    const menu = menuRef.current;
    const bounds = menu.querySelector("ul").getBoundingClientRect();
    menu.style.left = `${Math.max(8, Math.min(selection.x, window.innerWidth - bounds.width - 8))}px`;
    menu.style.top = `${Math.max(8, Math.min(selection.y, window.innerHeight - bounds.height - 8))}px`;
  }, [selection]);

  useEffect(() => {
    const dismissOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) onClose();
    };
    const dismissOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("keydown", dismissOnEscape);
    window.addEventListener("resize", onClose);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("keydown", dismissOnEscape);
      window.removeEventListener("resize", onClose);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="dropdown dropdown-open fixed z-50"
      style={{ left: selection.x, top: selection.y }}
    >
      <ul className="dropdown-content menu bg-base-100 rounded-box w-40 p-2 shadow-lg" aria-label="Player actions">
        <li><button type="button" onClick={invite}>Invite</button></li>
        <li><button type="button" onClick={() => { onClose(); useChatStore.getState().show(`/whisper "${selection.name}" `); }}>Whisper</button></li>
      </ul>
    </div>
  );
};
