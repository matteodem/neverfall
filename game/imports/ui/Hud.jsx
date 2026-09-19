import React from "react";

import {
  useHudStore,
} from "./stores/useHudStore";

import {
  DeathOverlay,
} from "./DeathOverlay";
import {
  HelpModal,
} from "./components/modals/HelpModal";
import { InventoryModal } from "./components/modals/InventoryModal";
import { Icon } from "./components/Icon";
import { SettingsModal } from "./components/modals/SettingsModal";

const ACTION_SLOTS = [
  { key: "1", label: "Attack" },
  { key: "2", label: "" },
  { key: "3", label: "" },
  { key: "4", label: "" },
];

const HUD_BUTTONS = [
  {
    id: "settings",
    icon: "gear",
    label: "Settings",
  },
  {
    id: "inventory",
    icon: "backpack",
    label: "Inventory",
  },
  {
    id: "help",
    icon: "question",
    label: "Help",
  },
];

const ActionBar = () => {
  return (
    <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
      {ACTION_SLOTS.map((slot) => (
        <div
          key={slot.key}
          className="flex h-14 w-14 flex-col items-center justify-center rounded border border-white/20 bg-black/70 text-white"
        >
          <span className="text-sm font-bold">
            {slot.key}
          </span>

          {slot.label && (
            <span className="text-[10px] text-gray-300">
              {slot.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

const MenuButtons = () => {
  const openModal =
    useHudStore(
      (state) =>
        state.openModal
    );

  return (
    <div className="absolute left-4 top-4 rounded-lg bg-black/70 px-4 py-3 text-white">
      <div className="flex gap-4">
        {HUD_BUTTONS.map(
          ({
            id,
            icon,
            label,
          }) => (
            <button
              key={id}
              className="btn btn-circle"
              title={label}
              onClick={() =>
                openModal(id)
              }
            >
              <Icon icon={icon} />
            </button>
          )
        )}
      </div> 
    </div>
  );
};

const PlayerHealthBar = ({
  health,
  maxHealth,
}) => {
  const percentage =
    Math.max(
      0,
      Math.min(
        100,
        (
          health /
          maxHealth
        ) * 100
      )
    );

  return (
    <div className="absolute bottom-6 left-6 w-64 rounded bg-black/70 p-3 text-white">
      <div className="mb-1 flex justify-between text-sm">
        <span>
          Health
        </span>

        <span>
          {health} / {maxHealth}
        </span>
      </div>

      <div className="h-4 overflow-hidden rounded bg-gray-700">
        <div
          className="h-full bg-green-500 transition-all"
          style={{
            width:
              `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
};

export const Hud = ({
  playerHealth,
}) => {
  const isDead =
    playerHealth.health <= 0;

  return (
    <>
      <MenuButtons />

      <PlayerHealthBar
        health={
          playerHealth.health
        }
        maxHealth={
          playerHealth.maxHealth
        }
      />
      <ActionBar />

      {isDead && (
        <DeathOverlay />
      )}

      <HelpModal />
      <InventoryModal />
      <SettingsModal />
    </>
  );
};