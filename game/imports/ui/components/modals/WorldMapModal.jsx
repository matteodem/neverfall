import React from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../../api/characters/characters";
import { getUnlockedSpawnPoints } from "../../../game/spawnPoints";
import { SOUTHWEST_LAKE } from "../../../game/worldConfig";
import { DUNGEONS, getDungeonConfig } from "../../../game/dungeonConfig";
import { ENEMY_SPAWNS } from "../../../game/enemyConfig";
import { HUNT_QUESTS } from "../../../game/quests";
import { DUNGEON_MAP_RADIUS, worldToPercent } from "../../../game/worldMap";
import { useDungeonStore } from "../../stores/useDungeonStore";
import { useHudStore } from "../../stores/useHudStore";
import { useMinimapStore } from "../../stores/useMinimapStore";
import { useMobileDevice } from "../../hooks/useMobileDevice";
import { HudModal } from "../HudModal";
import { Icon } from "../Icon";

const WORLD_LABELS = [
  { label: "Forest", x: -60, z: 57.5 },
  { label: "Forest", x: -200, z: 0 },
  { label: "Forest", x: 200, z: 0 },
  { label: "Forest", x: 0, z: -210 },
];

const HIGHLANDS_LOOKOUT = { x: 40, z: 245 };
const HUNT_MARKERS = Object.entries(HUNT_QUESTS).map(([type, quest]) => {
  const spawns = ENEMY_SPAWNS.filter((spawn) => spawn.type === type);
  const position = type === "seal"
    ? spawns.reduce((south, spawn) => spawn.z < south.z ? spawn : south)
    : {
      x: spawns.reduce((sum, spawn) => sum + spawn.x, 0) / spawns.length,
      z: spawns.reduce((sum, spawn) => sum + spawn.z, 0) / spawns.length,
    };
  return { id: quest.id, title: quest.title, position, labelBelow: type === "seal" };
});

const MapContent = () => {
  const { mobile } = useMobileDevice();
  const [view, setView] = React.useState(() => ({ zoom: mobile ? 1.5 : 1, x: 0, y: 0 }));
  const viewportRef = React.useRef(null);
  const pointers = React.useRef(new Map());
  const gesture = React.useRef(null);
  const localPlayer = useMinimapStore((state) => state.localPlayer);
  const location = useDungeonStore((state) => state.location);
  const dungeonId = useDungeonStore((state) => state.dungeonId);
  const dungeon = location === "dungeon";
  const dungeonConfig = getDungeonConfig(dungeonId);
  const character = useTracker(() => {
    const id = Meteor.user()?.profile?.currentCharacterId;
    return id ? Characters.findOne(id) : null;
  });
  React.useEffect(() => {
    if (dungeon || !character || character.adventureGuide?.openedMap) return;
    Meteor.callAsync("adventureGuide.openMap").catch((error) =>
      console.error("[Adventure Guide] Could not save map visit", error));
  }, [dungeon, character?._id, character?.adventureGuide?.openedMap]);

  const clampView = React.useCallback((zoom, x, y) => {
    const edge = (zoom - 1) * (viewportRef.current?.clientWidth || 0) / 2;
    return { zoom, x: Math.max(-edge, Math.min(edge, x)), y: Math.max(-edge, Math.min(edge, y)) };
  }, []);
  const changeZoom = React.useCallback((amount) => setView((current) => {
    const zoom = Math.max(1, Math.min(3, current.zoom + amount));
    return clampView(zoom, current.x, current.y);
  }), [clampView]);
  React.useEffect(() => {
    const viewport = viewportRef.current;
    const handleWheel = (event) => {
      event.preventDefault();
      changeZoom(event.deltaY < 0 ? 0.25 : -0.25);
    };
    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", handleWheel);
  }, [changeZoom]);
  const startGesture = () => {
    const points = [...pointers.current.values()];
    if (points.length === 1) gesture.current = { point: points[0], view };
    if (points.length === 2) gesture.current = {
      distance: Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y), view,
    };
  };
  const handlePointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    startGesture();
  };
  const handlePointerMove = (event) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = [...pointers.current.values()];
    if (points.length === 2 && gesture.current?.distance) {
      const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      const zoom = Math.max(1, Math.min(3, gesture.current.view.zoom * distance / gesture.current.distance));
      setView(clampView(zoom, gesture.current.view.x, gesture.current.view.y));
    } else if (points.length === 1 && gesture.current?.point) {
      let dx = points[0].x - gesture.current.point.x;
      let dy = points[0].y - gesture.current.point.y;
      const portrait = event.currentTarget.closest(".mobile-portrait");
      if (portrait) [dx, dy] = [dy, -dx];
      const bounds = event.currentTarget.getBoundingClientRect();
      const scale = (portrait ? bounds.height : bounds.width) / event.currentTarget.clientWidth;
      dx /= scale;
      dy /= scale;
      setView(clampView(view.zoom, gesture.current.view.x + dx, gesture.current.view.y + dy));
    }
  };
  const handlePointerUp = (event) => {
    pointers.current.delete(event.pointerId);
    startGesture();
  };

  return (
    <>
      <div className="mb-2 flex items-center justify-end gap-2">
        <button type="button" className="btn btn-sm" aria-label="Zoom out" disabled={view.zoom <= 1} onClick={() => changeZoom(-0.25)}>−</button>
        <span className="min-w-12 text-center text-sm">{Math.round(view.zoom * 100)}%</span>
        <button type="button" className="btn btn-sm" aria-label="Zoom in" disabled={view.zoom >= 3} onClick={() => changeZoom(0.25)}>+</button>
      </div>
      <div ref={viewportRef} className="relative aspect-square cursor-grab touch-none overflow-hidden rounded-box border border-base-300 active:cursor-grabbing"
        onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}>
        <div className="absolute inset-0 origin-center" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }}>
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
        {!dungeon && getUnlockedSpawnPoints(character?.unlockedSpawnPoints).map((point) => (
          <div key={point.id} className="pointer-events-none absolute z-[15]" style={worldToPercent(point.position)}
            role="img" aria-label={`${point.name}, Respawn Point, Unlocked`}>
            <span className="flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-emerald-600 text-xs font-bold text-white shadow">✚</span>
            <span className="world-map-marker-label absolute right-6 top-2 whitespace-nowrap rounded bg-black/80 px-1 py-0.5 text-right text-emerald-100"
              style={{ fontSize: 10, lineHeight: 1.15 }}>
              <strong className="block">{point.name}</strong>
              <span className="block">Respawn Point · Unlocked</span>
            </span>
          </div>
        ))}
        {!dungeon && (
          <div className="absolute z-10" style={worldToPercent(HIGHLANDS_LOOKOUT)} title="Highlands Lookout">
            <span className="world-map-point absolute -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full border border-[#e0c99a] bg-[#59646b]" />
            <span className="world-map-marker-label absolute bottom-2 left-0 -translate-x-1/2 whitespace-nowrap text-xs text-[#f1eed7] drop-shadow-[0_1px_2px_black]">
              Highlands Lookout
            </span>
          </div>
        )}
        {!dungeon && (
          <div className="absolute z-10" style={worldToPercent(SOUTHWEST_LAKE.center)} title="Southwest Lake">
            <span className="world-map-point absolute -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full border border-white bg-sky-500" />
            <span className="world-map-marker-label absolute bottom-2 left-0 -translate-x-1/2 whitespace-nowrap text-xs text-[#f1eed7] drop-shadow-[0_1px_2px_black]">
              Southwest Lake
            </span>
          </div>
        )}
        {!dungeon && HUNT_MARKERS.map((hunt) => (
          <div key={hunt.id} className="pointer-events-none absolute z-10" style={worldToPercent(hunt.position)} title={hunt.title}>
            <span className="world-map-point absolute -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full border border-white bg-amber-400 shadow" />
            <span className={`world-map-marker-label absolute left-0 -translate-x-1/2 whitespace-nowrap rounded bg-black/75 px-1 text-[10px] font-semibold text-amber-200 ${hunt.labelBelow ? "top-2" : "bottom-2"}`}>
              {hunt.title}
            </span>
          </div>
        ))}
        {!dungeon && DUNGEONS.map((entry) => (
          <div key={entry.id} className="absolute z-10 -translate-x-1/2 -translate-y-1/2 text-center" style={worldToPercent(entry.entrance)}>
            <span className="world-map-point mx-auto block h-3 w-3 rounded-full border-2 border-white bg-violet-500 shadow" />
            <span className="world-map-marker-label rounded bg-black/80 px-1 text-xs text-white">{entry.name}</span>
          </div>
        ))}
        {dungeon && dungeonConfig && (
          <div className="absolute z-10 -translate-x-1/2 -translate-y-1/2 text-center" style={worldToPercent(dungeonConfig.spawn, DUNGEON_MAP_RADIUS)}>
            <span className="world-map-point mx-auto block h-3 w-3 rounded-full border-2 border-white bg-violet-500 shadow" />
            <span className="world-map-marker-label rounded bg-black/80 px-1 text-xs text-white">{dungeonConfig.name}</span>
          </div>
        )}
        <div className="absolute z-20" title="You" aria-label="Your position" style={{
          ...worldToPercent(localPlayer, dungeon ? DUNGEON_MAP_RADIUS : undefined),
          transform: `translate(-50%, -50%) rotate(${localPlayer.rotationY - Math.PI / 4}rad)`,
        }}>
          <Icon icon="locationArrow" className="world-map-player-point h-4 w-4 text-white drop-shadow-[0_1px_3px_black]" />
        </div>
        </div>
      </div>
    </>
  );
};

export const WorldMapModal = () => {
  const open = useHudStore((state) => state.openModals.includes("map"));
  if (!open) return null;
  return (
    <HudModal id="map" title="Map" width={640} className="world-map-modal">
      <MapContent />
    </HudModal>
  );
};
