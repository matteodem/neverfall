import React from "react";
import { useBossNoticeStore } from "../stores/useBossNoticeStore";

export const BossNotice = () => {
  const text = useBossNoticeStore((state) => state.text);
  if (!text) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-[10001] flex justify-center" role="status">
      <div className="rounded-box bg-black/70 px-6 py-3 text-xl font-bold text-orange-300 shadow-lg">{text}</div>
    </div>
  );
};
