import React from "react";
import { useQuestStore } from "../stores/useQuestStore";

export const HuntProgressPopup = () => {
  const message = useQuestStore((state) => state.huntPopup);
  const visible = useQuestStore((state) => state.huntPopupVisible);

  if (!message) return null;

  return (
    <div
      className={`pointer-events-none fixed left-1/2 top-[58%] z-[11000] -translate-x-1/2 text-center text-lg font-bold text-yellow-300 drop-shadow-[0_2px_3px_black] transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
    >
      {message}
    </div>
  );
};
