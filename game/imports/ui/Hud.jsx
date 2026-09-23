import React, {
  useEffect,
  useState,
} from "react";

import {
  useHudStore,
} from "./stores/useHudStore";

import {
  useActionBarStore,
} from "./stores/useActionBarStore";

import {
  DeathOverlay,
} from "./DeathOverlay";

import {
  HelpModal,
} from "./components/modals/HelpModal";

import {
  InventoryModal,
} from "./components/modals/InventoryModal";

import {
  SettingsModal,
} from "./components/modals/SettingsModal";

import {
  Icon,
} from "./components/Icon";

import {
  XpBar,
} from "./components/XpBar";

import {
  QuestTracker,
} from "./components/QuestTracker";

import {
  CombatBorder,
} from "./components/CombatBorder";

import {
  LevelUpOverlay,
} from "./components/LevelUpOverlay";

import {
  getPlayerStats,
} from "../game/playerStats";


const HEAL_AMOUNT =
  40;


const HEAL_COOLDOWN =
  15000;


/*
 * =========================================================
 * ACTION SLOTS
 * =========================================================
 *
 * Damage is derived from the
 * player's current level.
 *
 * This keeps the tooltip in sync
 * with the actual player stat
 * calculation.
 */

const getActionSlots = (
  currentLevel
) => {
  const playerStats =
    getPlayerStats(
      currentLevel
    );


  return [
    {
      key:
        "1",

      code:
        "Digit1",

      icon:
        "sword",

      tooltip:
        `Attack enemy (Causes ${playerStats.damage} damage)`,
    },

    {
      key:
        "2",

      code:
        "Digit2",

      tooltip:
        "No ability assigned",
    },

    {
      key:
        "3",

      code:
        "Digit3",

      tooltip:
        "No ability assigned",
    },

    {
      key:
        "4",

      code:
        "Digit4",

      icon:
        "healthCapsule",

      tooltip:
        `Heal yourself for ${HEAL_AMOUNT} HP`,

      cooldown:
        HEAL_COOLDOWN,
    },
  ];
};


/*
 * =========================================================
 * HUD BUTTONS
 * =========================================================
 */

const HUD_BUTTONS = [
  {
    id:
      "settings",

    icon:
      "gear",

    label:
      "Settings",
  },

  {
    id:
      "inventory",

    icon:
      "backpack",

    label:
      "Inventory",
  },

  {
    id:
      "help",

    icon:
      "question",

    label:
      "Help",
  },
];


/*
 * =========================================================
 * COOLDOWN OVERLAY
 * =========================================================
 */

const CooldownOverlay = ({
  until,
  duration,
}) => {
  const [
    progress,
    setProgress,
  ] = useState(
    0
  );


  const [
    seconds,
    setSeconds,
  ] = useState(
    0
  );


  useEffect(
    () => {
      if (!until) {
        setProgress(
          0
        );


        setSeconds(
          0
        );


        return;
      }


      const update =
        () => {
          const remaining =
            Math.max(
              0,
              until -
                Date.now()
            );


          setProgress(
            remaining /
              duration
          );


          setSeconds(
            Math.ceil(
              remaining /
                1000
            )
          );
        };


      update();


      const interval =
        setInterval(
          update,
          100
        );


      return () => {
        clearInterval(
          interval
        );
      };
    },
    [
      until,
      duration,
    ]
  );


  if (
    progress <=
    0
  ) {
    return null;
  }


  return (
    <div
      className="
        pointer-events-none
        absolute
        inset-0

        flex
        items-center
        justify-center

        rounded
      "
      style={{
        backgroundImage:
          `conic-gradient(
            rgba(0, 0, 0, 0.8)
            ${progress * 360}deg,
            rgba(0, 0, 0, 0.25) 0deg
          )`,
      }}
    >
      <span
        className="
          rounded

          bg-black/70

          px-1.5
          py-0.5

          text-sm
          font-bold
          text-cyan-300

          shadow
        "
      >
        {seconds}
      </span>
    </div>
  );
};


/*
 * =========================================================
 * MENU BUTTONS
 * =========================================================
 */

const MenuButtons =
  () => {
    const openModal =
      useHudStore(
        (
          state
        ) =>
          state.openModal
      );


    return (
      <div
        className="
          absolute
          left-4
          top-4

          rounded-lg

          bg-black/70

          px-4
          py-3

          text-white
        "
      >
        <div
          className="
            flex
            gap-4
          "
        >
          {HUD_BUTTONS.map(
            ({
              id,
              icon,
              label,
            }) => (
              <button
                key={
                  id
                }
                type="button"
                title={
                  label
                }
                onClick={
                  () =>
                    openModal(
                      id
                    )
                }
                className="
                  btn
                  btn-circle
                  cursor-pointer
                "
              >
                <Icon
                  icon={
                    icon
                  }
                />
              </button>
            )
          )}
        </div>
      </div>
    );
  };


/*
 * =========================================================
 * PLAYER HEALTH BAR
 * =========================================================
 */

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
        ) *
          100
      )
    );


  return (
    <div
      className="
        w-72

        rounded

        bg-black/70

        p-2

        text-white
      "
    >
      <div
        className="
          mb-1

          flex
          justify-between

          text-sm
        "
      >
        <span>
          Health
        </span>


        <span>
          {parseInt(
            health,
            10
          )}{" "}
          /{" "}
          {maxHealth}
        </span>
      </div>


      <div
        className="
          h-4

          overflow-hidden

          rounded

          bg-gray-700
        "
      >
        <div
          className="
            h-full

            bg-green-500

            transition-all
          "
          style={{
            width:
              `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
};


/*
 * =========================================================
 * ACTION SLOT
 * =========================================================
 */

const ActionSlot = ({
  slot,
  healCooldownUntil,
  onTrigger,
}) => {
  const cooldownUntil =
    slot.code ===
    "Digit4"
      ? healCooldownUntil
      : 0;


  return (
    <div
      className="
        tooltip
        tooltip-top
      "
      data-tip={
        slot.tooltip
      }
    >
      <button
        type="button"
        onClick={
          () =>
            onTrigger(
              slot.code
            )
        }
        className="
          relative

          flex
          h-14
          w-14

          cursor-pointer

          flex-col
          items-center
          justify-center

          rounded

          border
          border-white/20

          bg-black/70

          text-white

          transition

          hover:bg-black/90

          active:scale-95
        "
      >
        <span
          className="
            absolute
            right-[5px]
            top-[2px]

            text-sm
            font-bold
          "
        >
          {slot.key}
        </span>


        {slot.icon && (
          <Icon
            icon={
              slot.icon
            }
            className="
              h-5
              w-5
            "
          />
        )}


        {slot.cooldown && (
          <CooldownOverlay
            until={
              cooldownUntil
            }
            duration={
              slot.cooldown
            }
          />
        )}
      </button>
    </div>
  );
};


/*
 * =========================================================
 * ACTION BAR
 * =========================================================
 */

const ActionBar = ({
  currentLevel,
  healCooldownUntil,
}) => {
  const triggerSkill =
    useActionBarStore(
      (
        state
      ) =>
        state.triggerSkill
    );


  const actionSlots =
    getActionSlots(
      currentLevel
    );


  return (
    <div
      className="
        flex
        gap-2
      "
    >
      {actionSlots.map(
        (
          slot
        ) => (
          <ActionSlot
            key={
              slot.code
            }
            slot={
              slot
            }
            healCooldownUntil={
              healCooldownUntil
            }
            onTrigger={
              triggerSkill
            }
          />
        )
      )}
    </div>
  );
};


/*
 * =========================================================
 * BOTTOM HUD
 * =========================================================
 */

const BottomHud = ({
  currentLevel,
  playerHealth,
  healCooldownUntil,
}) => {
  return (
    <div
      className="
        absolute
        bottom-6
        left-1/2
        z-[10000]

        flex
        -translate-x-1/2
        flex-col
        items-center
        gap-2
      "
    >
      <ActionBar
        currentLevel={
          currentLevel
        }
        healCooldownUntil={
          healCooldownUntil
        }
      />


      <PlayerHealthBar
        health={
          playerHealth.health
        }
        maxHealth={
          playerHealth.maxHealth
        }
      />


      <XpBar />
    </div>
  );
};


/*
 * =========================================================
 * HUD
 * =========================================================
 */

export const Hud = ({
  currentLevel = 1,
  playerHealth,
  healCooldownUntil,
}) => {
  const isDead =
    playerHealth.health <=
    0;


  return (
    <>
      <CombatBorder />


      <LevelUpOverlay />


      <MenuButtons />


      <div
        className="
          absolute
          right-10
          top-5
        "
      >
        <QuestTracker />
      </div>


      <BottomHud
        currentLevel={
          currentLevel
        }
        playerHealth={
          playerHealth
        }
        healCooldownUntil={
          healCooldownUntil
        }
      />


      {isDead && (
        <DeathOverlay />
      )}


      <HelpModal />


      <InventoryModal />


      <SettingsModal />
    </>
  );
};