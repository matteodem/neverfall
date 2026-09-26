import React from "react";
import { DUNGEON } from "../../../game/dungeonConfig";
import { worldToPercent } from "../../../game/worldMap";
import { useDungeonStore } from "../../stores/useDungeonStore";
import { useHudStore } from "../../stores/useHudStore";
import { useMinimapStore } from "../../stores/useMinimapStore";
import { HudModal } from "../HudModal";
import { Icon } from "../Icon";

const MapContent = () => {
  const localPlayer = useMinimapStore((state) => state.localPlayer);
  const location = useDungeonStore((state) => state.location);
  const dungeon = location === "dungeon";
  const entrance = dungeon ? DUNGEON.spawn : DUNGEON.entrance;

  return (
    <>
      <div className="relative aspect-square overflow-hidden rounded-box border border-base-300">
        <img src={dungeon ? "/maps/dungeon.svg" : "/maps/forest.svg"}
          alt={dungeon ? "Top-down dungeon map" : "Top-down Neverfall forest map"}
          className="block h-full w-full" draggable={false} />
        <div className="absolute z-10 -translate-x-1/2 -translate-y-1/2 text-center" style={worldToPercent(entrance)}>
          <span className="mx-auto block h-3 w-3 rounded-full border-2 border-white bg-violet-500 shadow" />
          <span className="rounded bg-black/80 px-1 text-xs text-white">Dungeon Entrance</span>
        </div>
        <div className="absolute z-20" title="You" aria-label="Your position" style={{
          ...worldToPercent(localPlayer),
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
