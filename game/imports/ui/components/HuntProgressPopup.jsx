import React from "react";
import { useQuestStore } from "../stores/useQuestStore";

export const HuntProgressPopup = () => {
  const message = useQuestStore((state) => state.huntPopup);
  const visible = useQuestStore((state) => state.huntPopupVisible);

  if (!message) return null;

  return (
    <div
      className={`pointer-events-none fixed left-1/2 top-[58%] z-[11000] max-w-[calc(var(--game-width,100vw)-2rem)] -translate-x-1/2 rounded-lg bg-black/75 px-3 py-2 text-center text-sm font-semibold text-yellow-200 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
    >
      {message}
    </div>
  );
};
