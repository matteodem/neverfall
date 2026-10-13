import { FantasyNotice } from "./fantasy/FantasyUI";
import React from "react";
import { useBossNoticeStore } from "../stores/useBossNoticeStore";

export const BossNotice = () => {
  const text = useBossNoticeStore((state) => state.text);
  if (!text) return null;
  return (
    <div className="fantasy-toast-slot" role="status">
      <FantasyNotice tone="warning" className="mx-4 max-w-sm text-center text-sm font-semibold">{text}</FantasyNotice>
    </div>
  );
};
