import { DUNGEONS, getDungeonConfig } from "../../game/dungeonConfig";
import { ENEMY_TYPES } from "../../game/enemyConfig";
import { WORLD_EVENTS } from "../../game/worldEvents";
import { useDungeonStore } from "../stores/useDungeonStore";
import { useWorldEventStore } from "../stores/useWorldEventStore";
import React, { useState } from "react";
import { useMobileDevice } from "../hooks/useMobileDevice";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../api/characters/characters";
import { getNpcQuestMarkers } from "../../game/npcs/questMarkers";
import { WorldMapMarkerIcon } from "./modals/WorldMapMarker";
import { Icon } from "./Icon";
import { FantasyBadge, FantasyPanel, FantasySectionHeader } from "./fantasy/FantasyUI";

import { DUNGEON_MAP_RADIUS, WORLD_RADIUS, worldToPercent } from "../../game/worldMap";

import {
  useMinimapStore,
} from "../stores/useMinimapStore";

const getEnemyColor = (
  type
) => {
  if (
    ENEMY_TYPES[type]?.bossMechanics
  ) {
    return "var(--fantasy-warning)";
  }

  return "var(--fantasy-danger)";
};

const DotMarker = ({
  x,
  z,
  color,
  size = 8,
  className = "",
  outlined = false,
}) => {
  const location = useDungeonStore((state) => state.location);
  const position =
    worldToPercent({ x, z }, location === "dungeon" ? DUNGEON_MAP_RADIUS : undefined);

  return (
    <div
      className={[
        `absolute rounded-full ${outlined ? "border-2 border-white shadow-[0_0_5px_rgba(0,0,0,0.95)]" : ""} -translate-x-1/2 -translate-y-1/2`,
        className,
      ].join(" ")}
      style={{
        left:
          position.left,

        top:
          position.top,

        width: size,
        height: size,

        backgroundColor:
          color,
      }}
    />
  );
};

const LocalPlayerMarker = ({
  x,
  z,
  rotationY,
}) => {
  const location = useDungeonStore((state) => state.location);
  const position =
    worldToPercent({ x, z }, location === "dungeon" ? DUNGEON_MAP_RADIUS : undefined);

  return (
    <div
      className="absolute z-40 drop-shadow-[0_1px_3px_rgba(0,0,0,1)]"
      style={{
        left:
          position.left,

        top:
          position.top,

        transform:
          `translate(-50%, -50%) rotate(${rotationY - Math.PI / 4}rad)`,
      }}
    >
      <Icon
        icon="locationArrow"
        className="h-4 w-4 text-white"
        stroke="#0f172a"
        strokeWidth={30}
        style={{ paintOrder: "stroke" }}
        aria-hidden="true"
      />
    </div>
  );
};

const Legend = ({ location, activeEvent, showLabels }) => {
  const ITEMS = [
    {
      label:
        "You",
      color:
        "var(--fantasy-text)",
    },
    {
      label:
        "Players",
      color:
        "var(--fantasy-success)",
    },
    {
      label:
        "Enemy",
      color:
        "var(--fantasy-danger)",
    },
    {
      label:
        "Boss",
      color:
        "var(--fantasy-warning)",
    },
    ...(location === "world" ? [{
      label: "Dungeon",
      color: "var(--fantasy-magic)",
      outlined: false,
    }] : []),
    ...(activeEvent ? [{ label: "Event", color: "var(--fantasy-warning)", outlined: false }] : []),
    ...(location === "world" ? [
      { label: "Available quest", kind: "questAvailable" },
      { label: "Quest in progress", kind: "questActive" },
      { label: "Quest ready to turn in", kind: "questReady" },
    ] : []),
  ];

  return (
    <div className="fantasy-minimap-legend mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px]">
      {ITEMS.map(
        (item) => (
          <div
            key={
              item.label
            }
            className="flex items-center gap-1"
            title={showLabels ? item.label : undefined}
          >
            {item.kind ? <WorldMapMarkerIcon kind={item.kind} /> : <span
              className={`h-2 w-2 rounded-full ${item.outlined === false ? "" : "shadow"}`}
              style={{
                backgroundColor:
                  item.color,
              }}
            />}

            <span className={showLabels ? undefined : "hidden"}>
              {
                item.label
              }
            </span>
          </div>
        )
      )}
    </div>
  );
};

export const Minimap =
  () => {
    const { mobile } = useMobileDevice();
    const [mobileLabels, setMobileLabels] = useState(false);
    const showLabels = !mobile || mobileLabels;
    const location = useDungeonStore((state) => state.location);
    const character = useTracker(() => {
      const id = Meteor.user()?.profile?.currentCharacterId;
      return id ? Characters.findOne(id) : null;
    });
    const questMarkers = getNpcQuestMarkers(character);
    const dungeonId = useDungeonStore((state) => state.dungeonId);
    const dungeonConfig = getDungeonConfig(dungeonId);
    const event = useWorldEventStore((state) => state.event);
    const eventId = event?.id;
    const activeEvent = location === "world" ? WORLD_EVENTS.find((event) => event.id === eventId) : null;
    const eventPosition = activeEvent && worldToPercent(activeEvent.center);
    const eventDiameter = activeEvent && `${activeEvent.participationRadius / WORLD_RADIUS * 100}%`;
    const localPlayer =
      useMinimapStore(
        (state) =>
          state.localPlayer
      );
    const customMarker = useMinimapStore((state) => state.customMarker);

    const remotePlayers =
      useMinimapStore(
        (state) =>
          Object.values(
            state.remotePlayers
          )
      );

    const enemies =
      useMinimapStore(
        (state) =>
          Object.values(
            state.enemies
          )
      );

    return (
      <FantasyPanel
        id="onboarding-map"
        role={mobile ? "button" : undefined}
        tabIndex={mobile ? 0 : undefined}
        aria-label={mobile ? `${showLabels ? "Hide" : "Show"} minimap labels` : undefined}
        aria-pressed={mobile ? showLabels : undefined}
        onPointerDown={mobile ? (event) => event.stopPropagation() : undefined}
        onClick={mobile ? (event) => {
          event.stopPropagation();
          setMobileLabels((visible) => !visible);
        } : undefined}
        onKeyDown={mobile ? (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            setMobileLabels((visible) => !visible);
          }
        } : undefined}
        className="hud-minimap fantasy-minimap max-w-[256px] p-3 backdrop-blur-sm"
      >
        <div className="mb-2 flex items-center justify-between">
          <FantasySectionHeader as="h3" className="fantasy-heading-inline text-sm">Minimap</FantasySectionHeader>
          <FantasyBadge className="fantasy-minimap-north" tone="neutral">N</FantasyBadge>
        </div>

        <div
          className="fantasy-minimap-lens relative mx-auto overflow-hidden rounded-full border-4 shadow-inner"
          style={{
            width:
              "var(--minimap-size, 220px)",
            height:
              "var(--minimap-size, 220px)",
          }}
        >
          {/*
           * Background rings / grid
           */}
          <div className="fantasy-minimap-ground absolute inset-0 rounded-full" />

          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/10" />
          <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/10" />

          <div className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
          <div className="absolute left-1/2 top-1/2 h-[38%] w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />

          {activeEvent && (
            <div
              className="fantasy-minimap-event absolute -translate-x-1/2 -translate-y-1/2 rounded-full border"
              title={showLabels ? activeEvent.name : undefined}
              aria-label={`Active event: ${activeEvent.name}`}
              style={{ ...eventPosition, width: eventDiameter, height: eventDiameter }}
            />
          )}
          {activeEvent && <DotMarker x={event.objectiveX} z={event.objectiveZ}
            color="var(--fantasy-warning)" size="var(--minimap-dot-size, 10px)" className="z-[15]" outlined />}

          {location === "dungeon" && dungeonConfig &&
            <DotMarker {...dungeonConfig.exit} color="var(--fantasy-magic)" size="var(--minimap-dot-size, 10px)" className="z-10" outlined />}
          {location === "world" && DUNGEONS.map((entry) =>
            <DotMarker key={entry.id} {...entry.entrance} color="var(--fantasy-magic)" size="var(--minimap-dot-size, 10px)" className="z-10" />)}
          {location === "world" && customMarker && (
            <div className="fantasy-minimap-custom absolute z-[15] -translate-x-1/2 -translate-y-1/2"
              style={worldToPercent(customMarker)} title={showLabels ? "Custom Marker" : undefined} aria-label="Custom Marker">
              <Icon icon="mapPin" className="h-4 w-4 drop-shadow-[0_1px_2px_black]" />
            </div>
          )}

          {/*
           * Remote players
           */}
          {remotePlayers.map(
            (
              remote
            ) => (
              <DotMarker
                key={
                  remote.id
                }
                x={
                  remote.x
                }
                z={
                  remote.z
                }
                outlined={false}
                color="var(--fantasy-success)"
                size={7}
                className="z-10"
              />
            )
          )}

          {/*
           * Enemies
           */}
          {enemies.map(
            (
              enemy
            ) => (
              <DotMarker
                key={
                  enemy.id
                }
                x={
                  enemy.x
                }
                z={
                  enemy.z
                }
                color={getEnemyColor(
                  enemy.type
                )}
                outlined={false}
                size={ENEMY_TYPES[enemy.type]?.bossMechanics ? 8 : 5}
                className="z-10"
              />
            )
          )}

          {/*
           * Local player
           */}
          {location === "world" && questMarkers.map((npc) => (
            <div key={npc.id} className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
              style={worldToPercent(npc.position)}
              title={showLabels ? `${npc.name} · ${npc.label}` : undefined}
              aria-label={`${npc.name}: ${npc.label}`}>
              <WorldMapMarkerIcon kind={npc.kind} />
            </div>
          ))}
          <LocalPlayerMarker
            x={
              localPlayer.x
            }
            z={
              localPlayer.z
            }
            rotationY={
              localPlayer.rotationY
            }
          />
        </div>

        {showLabels && <Legend location={location} activeEvent={activeEvent} showLabels={showLabels} />}
        {mobile && <p className="mt-1 text-center"><FantasyBadge tone="magic" className="fantasy-minimap-hint">Tap to {showLabels ? "hide" : "show"} labels</FantasyBadge></p>}
      </FantasyPanel>
    );
  };
