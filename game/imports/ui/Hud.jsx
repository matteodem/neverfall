import { useDungeonStore } from "./stores/useDungeonStore";
import { DungeonPrompt } from "./components/DungeonPrompt";
import { GroupInvitationModal } from "./components/GroupInvitationModal";
import { GroupPanel } from "./components/GroupPanel";
import { LootPrompt } from "./components/LootPrompt";
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
  GearModal,
} from "./components/modals/GearModal";

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
  Minimap,
} from "./components/Minimap";

import {
  getPlayerStats,
} from "../game/playerStats";


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
  currentLevel,
  equipment
) => {
  const playerStats =
    getPlayerStats(
      currentLevel,
      equipment
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
        `Heal yourself for ${playerStats.healAmount} HP`,

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
      "gear",

    icon:
      "sword",

    label:
      "Gear",
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
  equipment,
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
      currentLevel,
      equipment
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
  equipment,
  playerHealth,
  healCooldownUntil,
  mounted,
  isDead,
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
        equipment={equipment}
        healCooldownUntil={
          healCooldownUntil
        }
      />


      <div className="flex items-center gap-2 relative">
        <div
          className="tooltip tooltip-top absolute left-[-60px] h-[45px]"
          data-tip={mounted ? "Dismount" : "Mount"}
        >
          <button
            type="button"
            disabled={isDead}
            onClick={() => useActionBarStore.getState().triggerSkill("KeyV")}
            className="btn btn-sm relative h-[45px] w-[55px] border-white/20 bg-black/70 text-white hover:bg-black/90 disabled:opacity-40"
          >
            <Icon icon="horse" />
            <span className="
              absolute 
              right-[5px]
              top-[2px]

              text-xs
              font-bold">
              V
            </span>
          </button>
        </div>
        <PlayerHealthBar
          health={playerHealth.health}
          maxHealth={playerHealth.maxHealth}
        />
      </div>


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
  equipment,
  playerHealth,
  healCooldownUntil,
  mounted = false,
}) => {
  const inDungeon = useDungeonStore((state) => state.location === "dungeon");
  const [hitFeedback, setHitFeedback] = useState(false);
  const previousHealth = React.useRef(playerHealth.health);

  useEffect(() => {
    if (playerHealth.health < previousHealth.current) {
      setHitFeedback(true);
      const timeout = setTimeout(() => setHitFeedback(false), 220);
      previousHealth.current = playerHealth.health;
      return () => clearTimeout(timeout);
    }
    previousHealth.current = playerHealth.health;
  }, [playerHealth.health]);

  const isDead =
    playerHealth.health <=
    0;


  return (
    <>
      <div className={`pointer-events-none fixed inset-0 z-[9998] border-[10px] border-red-400/70 transition-opacity duration-200 ${hitFeedback ? "opacity-100" : "opacity-0"}`} />
      <LootPrompt />
      <DungeonPrompt />
      <GroupPanel />
      <GroupInvitationModal />

      <CombatBorder />


      <LevelUpOverlay />


      <MenuButtons />


      <div
        className="
          absolute
          right-6
          top-5
          z-[10000]

          flex
          flex-col
          items-end
          gap-3
        "
      >
        <Minimap />

        {!inDungeon && <QuestTracker />}
      </div>


      <BottomHud
        currentLevel={
          currentLevel
        }
        equipment={equipment}
        playerHealth={
          playerHealth
        }
        healCooldownUntil={
          healCooldownUntil
        }
        mounted={mounted}
        isDead={isDead}
      />


      {isDead && (
        <DeathOverlay />
      )}


      <HelpModal />


      <InventoryModal />


      <GearModal />


      <SettingsModal />
    </>
  );
};
