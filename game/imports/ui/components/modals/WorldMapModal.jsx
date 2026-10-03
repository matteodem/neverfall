import React from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../../api/characters/characters";
import { getUnlockedSpawnPoints } from "../../../game/spawnPoints";
import { WAYPOINTS, getUnlockedWaypoints } from "../../../game/waypoints";
import { SOUTHWEST_LAKE } from "../../../game/worldConfig";
import { LANDMARKS } from "../../../game/landmarks";
import { BASIC_TOWER_POSITION } from "../../../game/basicTowerConfig";
import { DUNGEONS, getDungeonConfig } from "../../../game/dungeonConfig";
import { ENEMY_SPAWNS } from "../../../game/enemyConfig";
import { HUNT_QUESTS } from "../../../game/quests";
import { DUNGEON_MAP_RADIUS, percentToWorld, worldToPercent } from "../../../game/worldMap";
import { useDungeonStore } from "../../stores/useDungeonStore";
import { useHudStore } from "../../stores/useHudStore";
import { useMinimapStore } from "../../stores/useMinimapStore";
import { useWaypointStore } from "../../stores/useWaypointStore";
import { useMobileDevice } from "../../hooks/useMobileDevice";
import { HudModal } from "../HudModal";
import { Icon } from "../Icon";
import { WorldMapMarker, WorldMapMarkerIcon } from "./WorldMapMarker";

const WORLD_LABELS = [
  { label: "Highlands (Level 5 - 10)", x: 0, z: 160 },
  { label: "Forest (Level 1 - 5)", x: 0, z: 42.5 },
  { label: "Forest", x: -200, z: 0 },
  { label: "Forest", x: 200, z: -200 },
  { label: "Forest", x: 0, z: -210 },
  { label: "Snowy Mountains (Level 10 - 15)", x: 208, z: -75 },
];

const isStandaloneWaypoint = (point) => ["lake-waypoint", "snowy-mountains-waypoint"].includes(point.id);
const LEGEND = [
  { kind: "waypoint", label: "Waypoint" },
  { kind: "undiscovered", label: "Undiscovered waypoint" },
  { kind: "spawn", label: "Respawn point / camp" },
  { kind: "dungeon", label: "Dungeon" },
  { kind: "hunt", label: "Hunt" },
  { kind: "puzzle", label: "Jumping puzzle" },
  { kind: "landmark", label: "Landmark" },
  { kind: "custom", label: "Custom Marker" },
];
const HUNT_MARKERS = Object.entries(HUNT_QUESTS).map(([type, quest]) => {
  const spawns = ENEMY_SPAWNS.filter((spawn) => spawn.type === type);
  const position = type === "seal"
    ? spawns.reduce((south, spawn) => spawn.z < south.z ? spawn : south)
    : {
      x: spawns.reduce((sum, spawn) => sum + spawn.x, 0) / spawns.length,
      z: spawns.reduce((sum, spawn) => sum + spawn.z, 0) / spawns.length,
    };
  return {
    id: quest.id, title: quest.title, position,
    labelBelow: type === "seal" || type === "snowWolf",
    alignEnd: position.x > 230,
  };
});

const MapContent = () => {
  const { mobile } = useMobileDevice();
  const [view, setView] = React.useState(() => ({ zoom: mobile ? 1.5 : 1, x: 0, y: 0 }));
  const [selectedWaypointId, setSelectedWaypointId] = React.useState(null);
  const [activeMarkerId, setActiveMarkerId] = React.useState(null);
  const [legendOpen, setLegendOpen] = React.useState(false);
  const viewportRef = React.useRef(null);
  const mapContentRef = React.useRef(null);
  const pointers = React.useRef(new Map());
  const gesture = React.useRef(null);
  const markerPlacement = React.useRef(null);
  const localPlayer = useMinimapStore((state) => state.localPlayer);
  const customMarker = useMinimapStore((state) => state.customMarker);
  const setCustomMarker = useMinimapStore((state) => state.setCustomMarker);
  const clearCustomMarker = useMinimapStore((state) => state.clearCustomMarker);
  const location = useDungeonStore((state) => state.location);
  const dungeonId = useDungeonStore((state) => state.dungeonId);
  const dungeon = location === "dungeon";
  const dungeonConfig = getDungeonConfig(dungeonId);
  const travelToWaypoint = useWaypointStore((state) => state.travel);
  const waypointTraveling = useWaypointStore((state) => state.traveling);
  const closeModal = useHudStore((state) => state.closeModal);
  const character = useTracker(() => {
    const id = Meteor.user()?.profile?.currentCharacterId;
    return id ? Characters.findOne(id) : null;
  });
  const unlockedWaypoints = getUnlockedWaypoints(character?.unlockedWaypoints);
  const undiscoveredWaypoints = WAYPOINTS.filter((point) => !point.isDefault && !unlockedWaypoints.includes(point));
  const selectedWaypoint = unlockedWaypoints.find((point) => point.id === selectedWaypointId);
  const selectMarker = (id) => {
    const waypoint = unlockedWaypoints.some((point) => `waypoint-${point.id}` === id);
    if (mobile && activeMarkerId !== id) {
      setActiveMarkerId(id);
      setSelectedWaypointId(null);
      return;
    }
    if (waypoint) setSelectedWaypointId(id.slice("waypoint-".length));
    else setActiveMarkerId(activeMarkerId === id ? null : id);
  };
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
    if (!dungeon && event.pointerType === "mouse" && event.ctrlKey) {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      markerPlacement.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
      return;
    }
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
    if (markerPlacement.current?.pointerId === event.pointerId) {
      const start = markerPlacement.current;
      markerPlacement.current = null;
      if (event.type === "pointerup" && Math.hypot(event.clientX - start.x, event.clientY - start.y) < 5) {
        const bounds = mapContentRef.current?.getBoundingClientRect();
        if (bounds) {
          const left = (event.clientX - bounds.left) / bounds.width * 100;
          const top = (event.clientY - bounds.top) / bounds.height * 100;
          if (left >= 0 && left <= 100 && top >= 0 && top <= 100) {
            setCustomMarker(percentToWorld({ left, top }));
          }
        }
      }
      return;
    }
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
        onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}
        onClick={() => { setActiveMarkerId(null); setSelectedWaypointId(null); }}>
        <div ref={mapContentRef} className="absolute inset-0 origin-center" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }}>
        <img src={dungeon ? "/maps/dungeon.svg" : "/maps/forest.svg"}
          alt={dungeon ? "Top-down dungeon map" : "Top-down Neverfall world map"}
          className="block h-full w-full" draggable={false} />
        {!dungeon && ["edge-forests", "highlands", "snowy-mountains"].map((region) => (
          <img key={region} src={`/maps/${region}.svg`} alt="" aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full" draggable={false} />
        ))}
        {!dungeon && WORLD_LABELS.map((position, index) => (
          <span key={index} className="absolute -translate-x-1/2 -translate-y-1/2 text-xs text-[#f1eed7] text-shadow-lg"
            style={worldToPercent(position)}>{position.label}</span>
        ))}
        {!dungeon && getUnlockedSpawnPoints(character?.unlockedSpawnPoints).map((point) => (
          <WorldMapMarker key={`spawn-${point.id}`} id={`spawn-${point.id}`} kind="spawn"
            label={`${point.name} · Respawn Point · Unlocked`} position={worldToPercent(point.position)}
            mobile={mobile} selected={activeMarkerId === `spawn-${point.id}`} onSelect={selectMarker} />
        ))}
        {!dungeon && unlockedWaypoints.map((point) => (
          <WorldMapMarker key={`waypoint-${point.id}`} id={`waypoint-${point.id}`} kind="waypoint"
            label={`${point.name} · Waypoint`} position={worldToPercent(point.position)}
            offsetX={isStandaloneWaypoint(point) ? 0 : mobile ? 50 : 34}
            mobile={mobile} selected={activeMarkerId === `waypoint-${point.id}`} onSelect={selectMarker} />
        ))}
        {!dungeon && undiscoveredWaypoints.map((point) => (
          <WorldMapMarker key={`undiscovered-${point.id}`} id={`undiscovered-${point.id}`} kind="undiscovered"
            label={`${point.name} · Undiscovered`} position={worldToPercent(point.position)}
            offsetX={isStandaloneWaypoint(point) ? 0 : mobile ? 50 : 34}
            mobile={mobile} selected={activeMarkerId === `undiscovered-${point.id}`} onSelect={selectMarker} />
        ))}
        {!dungeon && LANDMARKS.map((landmark) => (
          <WorldMapMarker key={landmark.id} id={landmark.id} kind="landmark" label={landmark.name}
            position={worldToPercent(landmark.position)} mobile={mobile}
            selected={activeMarkerId === landmark.id} onSelect={selectMarker} />
        ))}
        {!dungeon && (
          <WorldMapMarker id="tower-puzzle" kind="puzzle" label="Tower Jumping Puzzle"
            position={worldToPercent(BASIC_TOWER_POSITION)} mobile={mobile}
            selected={activeMarkerId === "tower-puzzle"} onSelect={selectMarker} />
        )}
        {!dungeon && (
          <div className="absolute z-10" style={worldToPercent(SOUTHWEST_LAKE.center)} title="Southwest Lake">
            <span className="world-map-point absolute -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full border border-white bg-sky-500" />
            <span className="world-map-marker-label absolute bottom-2 left-0 -translate-x-1/2 whitespace-nowrap text-xs text-[#f1eed7] drop-shadow-[0_1px_2px_black]">
              Southwest Lake (Level 15)
            </span>
          </div>
        )}
        {!dungeon && HUNT_MARKERS.map((hunt) => (
          <div key={hunt.id} className="pointer-events-none absolute z-10" style={worldToPercent(hunt.position)} title={hunt.title}>
            <span className="world-map-point absolute -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full border border-white bg-amber-400 shadow" />
            <span className={`world-map-marker-label absolute whitespace-nowrap rounded bg-black/75 px-1 text-[10px] font-semibold text-amber-200 ${hunt.alignEnd ? "right-0" : "left-0 -translate-x-1/2"} ${hunt.labelBelow ? "top-2" : "bottom-2"}`}>
              {hunt.title}
            </span>
          </div>
        ))}
        {!dungeon && DUNGEONS.map((entry) => (
          <WorldMapMarker key={entry.id} id={`dungeon-${entry.id}`} kind="dungeon"
            label={`${entry.name} · Level ${entry.recommendedLevel}`} position={worldToPercent(entry.entrance)}
            mobile={mobile} selected={activeMarkerId === `dungeon-${entry.id}`} onSelect={selectMarker} />
        ))}
        {!dungeon && customMarker && (
          <WorldMapMarker id="custom-marker" kind="custom" label="Custom Marker"
            position={worldToPercent(customMarker)} mobile={mobile}
            selected={activeMarkerId === "custom-marker"} onSelect={(id, event) => {
              if (event.ctrlKey && event.button === 0) {
                clearCustomMarker();
                setActiveMarkerId(null);
              } else selectMarker(id);
            }} />
        )}
        {dungeon && dungeonConfig && (
          <WorldMapMarker id={`dungeon-${dungeonConfig.id}`} kind="dungeon" label={dungeonConfig.name}
            position={worldToPercent(dungeonConfig.spawn, DUNGEON_MAP_RADIUS)} mobile={mobile}
            selected={activeMarkerId === `dungeon-${dungeonConfig.id}`} onSelect={selectMarker} />
        )}
        <div className="absolute z-20" title="You" aria-label="Your position" style={{
          ...worldToPercent(localPlayer, dungeon ? DUNGEON_MAP_RADIUS : undefined),
          transform: `translate(-50%, -50%) rotate(${localPlayer.rotationY - Math.PI / 4}rad)`,
        }}>
          <Icon icon="locationArrow" className="world-map-player-point h-4 w-4 text-white drop-shadow-[0_1px_3px_black]" />
        </div>
        </div>
        <div className="absolute bottom-2 left-2 z-40"
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}>
          {legendOpen && (
            <div id="world-map-legend" className="mb-1 rounded-box bg-black/85 p-2 text-xs text-white shadow-lg">
              {LEGEND.map(({ kind, label }) => (
                <div key={kind} className="flex items-center gap-2 py-0.5">
                  <span className="flex h-5 w-5 items-center justify-center"><WorldMapMarkerIcon kind={kind} /></span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          )}
          <button type="button" className="btn btn-sm bg-black/85 text-white" aria-expanded={legendOpen}
            aria-controls="world-map-legend" onClick={() => setLegendOpen((open) => !open)}>
            Legend {legendOpen ? "▴" : "▾"}
          </button>
        </div>
      </div>
      {!mobile && !dungeon && <p className="mt-1 text-xs text-base-content/60">Ctrl + Click to place marker · Ctrl + Click the marker to remove</p>}
      {selectedWaypoint && !dungeon && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-box bg-base-200 p-3">
          <span>Travel to {selectedWaypoint.name}?</span>
          <div className="flex gap-2">
            <button type="button" className="btn btn-sm" onClick={() => setSelectedWaypointId(null)}>Cancel</button>
            <button type="button" className="btn btn-sm btn-primary" disabled={waypointTraveling} onClick={() => {
              travelToWaypoint(selectedWaypoint.id);
              closeModal("map");
            }}>Travel</button>
          </div>
        </div>
      )}
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
