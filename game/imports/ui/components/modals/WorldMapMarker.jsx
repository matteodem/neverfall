import React from "react";
import { Icon } from "../Icon";

const ICONS = {
  spawn: { className: "h-5 w-5 border-2 border-white bg-emerald-600 text-xs font-bold text-white", glyph: "✚" },
  waypoint: { className: "h-4 w-4 border-2 border-white bg-sky-700 text-[10px] font-bold text-white", glyph: "◆" },
  undiscovered: { className: "h-4 w-4 border-2 border-white bg-slate-600 text-[10px] text-white", glyph: "◆" },
  dungeon: { className: "world-map-point h-3 w-3 border-2 border-white bg-violet-500" },
  boss: { className: "world-map-point h-4 w-4 border-2 border-white bg-red-700", glyph: "!" },
  questAvailable: { className: "h-5 w-5 border border-amber-200 bg-slate-900 text-sm font-bold text-yellow-300", glyph: "!" },
  questActive: { className: "h-5 w-5 border border-gray-400 bg-slate-900 text-sm font-bold text-gray-400", glyph: "?" },
  questReady: { className: "h-5 w-5 border border-amber-200 bg-slate-900 text-sm font-bold text-yellow-300", glyph: "?" },
  puzzle: { className: "world-map-point h-3 w-3 border-2 border-white bg-amber-700" },
  landmark: { className: "world-map-point h-2.5 w-2.5 border border-[#e0c99a] bg-[#59646b]" },
  event: { className: "world-map-point h-7 w-7 border-2 border-orange-400 bg-orange-400/25" },
  custom: { className: "h-5 w-5 text-rose-400", glyph: <Icon icon="mapPin" className="h-full w-full drop-shadow-[0_1px_2px_black]" /> },
};

export const WorldMapMarkerIcon = ({ kind }) => {
  const { className, glyph } = ICONS[kind];
  return <span className={`fantasy-map-marker-icon fantasy-map-marker-${kind} flex shrink-0 items-center justify-center rounded-full shadow ${className}`}>{glyph}</span>;
};

export const WorldMapMarker = ({ id, kind, label, position, mobile, selected, onSelect, offsetX = 0, offsetY = 0 }) => {
  const compact = ["waypoint", "undiscovered", "spawn"].includes(kind);
  const left = parseFloat(position.left);
  const top = parseFloat(position.top);
  const horizontal = left < 25 ? "left-0" : left > 75 ? "right-0" : "left-1/2 -translate-x-1/2";
  const vertical = top < 20 ? "top-full mt-1" : "bottom-full mb-1";

  return (
    <button type="button" data-map-marker={id} aria-label={label}
      data-selected={selected || undefined}
      className={`fantasy-map-marker group absolute flex items-center justify-center border-0 bg-transparent p-0 ${compact ? mobile ? "h-10 w-10" : "h-6 w-6" : mobile ? "h-12 w-12" : "h-8 w-8"} ${kind === "event" ? "z-10" : selected ? "z-30" : kind === "custom" ? "z-[25] hover:z-30 focus-visible:z-30" : "z-[15] hover:z-30 focus-visible:z-30"}`}
      style={{ ...position, transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))` }}
      onPointerDown={(event) => event.stopPropagation()}
      onPointerUp={(event) => event.stopPropagation()}
      onClick={(event) => { event.stopPropagation(); onSelect(id, event); }}>
      <WorldMapMarkerIcon kind={kind} />
      <span className={`world-map-marker-label pointer-events-none absolute rounded px-1.5 py-1 text-xs font-semibold ${horizontal} ${vertical} ${mobile ? selected ? "block" : "hidden" : "hidden group-hover:block group-focus-visible:block"}`}>
        {label}
      </span>
    </button>
  );
};
