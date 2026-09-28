import React from "react";
import { NORTHERN_CAMP } from "../../../game/campProtection";
import { DUNGEONS, getDungeonConfig } from "../../../game/dungeonConfig";
import { DUNGEON_MAP_RADIUS, worldToPercent } from "../../../game/worldMap";
import { useDungeonStore } from "../../stores/useDungeonStore";
import { useHudStore } from "../../stores/useHudStore";
import { useMinimapStore } from "../../stores/useMinimapStore";
import { HudModal } from "../HudModal";
import { Icon } from "../Icon";

const WORLD_LABELS = [
  { label: "Camp", x: 0, z: -14 },
  { label: "Northern Camp", ...NORTHERN_CAMP.center, z: NORTHERN_CAMP.center.z + 35 },
  { label: "Forest", x: -60, z: 57.5 },
  { label: "Forest", x: -200, z: 0 },
  { label: "Forest", x: 200, z: 0 },
  { label: "Forest", x: 0, z: -210 },
];

const MapContent = () => {
  const localPlayer = useMinimapStore((state) => state.localPlayer);
  const location = useDungeonStore((state) => state.location);
  const dungeonId = useDungeonStore((state) => state.dungeonId);
  const dungeon = location === "dungeon";
  const dungeonConfig = getDungeonConfig(dungeonId);

  return (
    <>
      <div className="relative aspect-square overflow-hidden rounded-box border border-base-300">
        <img src={dungeon ? "/maps/dungeon.svg" : "/maps/forest.svg"}
          alt={dungeon ? "Top-down dungeon map" : "Top-down Neverfall world map"}
          className="block h-full w-full" draggable={false} />
        {!dungeon && ["edge-forests", "highlands"].map((region) => (
          <img key={region} src={`/maps/${region}.svg`} alt="" aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full" draggable={false} />
        ))}
        {!dungeon && WORLD_LABELS.map((position, index) => (
          <span key={index} className="absolute -translate-x-1/2 -translate-y-1/2 text-xs text-[#f1eed7]"
            style={worldToPercent(position)}>{position.label}</span>
        ))}
        {!dungeon && DUNGEONS.map((entry) => (
          <div key={entry.id} className="absolute z-10 -translate-x-1/2 -translate-y-1/2 text-center" style={worldToPercent(entry.entrance)}>
            <span className="mx-auto block h-3 w-3 rounded-full border-2 border-white bg-violet-500 shadow" />
            <span className="rounded bg-black/80 px-1 text-xs text-white">{entry.name}</span>
          </div>
        ))}
        {dungeon && dungeonConfig && (
          <div className="absolute z-10 -translate-x-1/2 -translate-y-1/2 text-center" style={worldToPercent(dungeonConfig.spawn, DUNGEON_MAP_RADIUS)}>
            <span className="mx-auto block h-3 w-3 rounded-full border-2 border-white bg-violet-500 shadow" />
            <span className="rounded bg-black/80 px-1 text-xs text-white">{dungeonConfig.name}</span>
          </div>
        )}
        <div className="absolute z-20" title="You" aria-label="Your position" style={{
          ...worldToPercent(localPlayer, dungeon ? DUNGEON_MAP_RADIUS : undefined),
          transform: `translate(-50%, -50%) rotate(${localPlayer.rotationY - Math.PI / 4}rad)`,
        }}>
          <Icon icon="locationArrow" className="h-4 w-4 text-white drop-shadow-[0_1px_3px_black]" />
        </div>
      </div>
    </>
  );
};

export const WorldMapModal = () => {
  const open = useHudStore((state) => state.openModals.includes("map"));
  if (!open) return null;
  return (
    <HudModal id="map" title="Map">
      <MapContent />
    </HudModal>
  );
};
