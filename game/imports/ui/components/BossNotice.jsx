import React from "react";
import { useBossNoticeStore } from "../stores/useBossNoticeStore";

export const BossNotice = () => {
  const text = useBossNoticeStore((state) => state.text);
  if (!text) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-[10001] flex justify-center" role="status">
      <div className="rounded-box mx-4 max-w-sm bg-black/70 px-4 py-2 text-center text-base font-bold text-orange-300 shadow-lg sm:max-w-none sm:px-6 sm:py-3 sm:text-xl">{text}</div>
    </div>
  );
};
