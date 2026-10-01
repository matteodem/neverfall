import { TargetFrame } from "./components/TargetFrame";
import { BossHealthBar } from "./components/BossHealthBar";
import { Chat } from "./components/Chat";
import { WorldMapModal } from "./components/modals/WorldMapModal";
import { ItemsModal, HeroModal } from "./components/modals/GroupedHudModals";
import { PotionBuffs } from "./components/PotionBuffs";
import { useMobileDevice } from "./hooks/useMobileDevice";
import { MobileJoystick } from "./components/MobileJoystick";
import { actionButtonHandlers } from "./components/actionButtonHandlers";
import { BossNotice } from "./components/BossNotice";
import { QuestCompletionOverlay } from "./components/QuestCompletionOverlay";
import { HuntProgressPopup } from "./components/HuntProgressPopup";
import { WorldEventTracker } from "./components/WorldEventTracker";
import { AdventureGuide } from "./components/AdventureGuide";
import { AchievementToast } from "./components/modals/AchievementModal";
import { getTalentSkill } from "../game/talents";
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
  SettingsModal,
} from "./components/modals/SettingsModal";

import {
  Icon,
} from "./components/Icon";

import {
  XpBar,
} from "./components/XpBar";

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
  equipment,
  gameClass,
  species,
  talents
) => {
  const skills = Object.fromEntries(["Digit1", "Digit2", "Digit3"].map((code) =>
    [code, getTalentSkill(gameClass, code, currentLevel, talents)]));
  const playerStats =
    getPlayerStats(
      currentLevel,
      equipment,
      gameClass,
      species,
      talents
    );


  return [
    {
      key:
        "1",

      code:
        "Digit1",

      icon:
        skills.Digit1.icon,

      tooltip:
        `${skills.Digit1.name} (Causes ${parseInt(playerStats.damage * skills.Digit1.damageMultiplier, 10)} damage)`,
    },

    {
      key:
        "2",

      code:
        "Digit2",

      icon: skills.Digit2?.icon,
      cooldown: skills.Digit2?.cooldown,
      tooltip:
        skills.Digit2 ? `${skills.Digit2.name} (Causes ${parseInt(playerStats.damage * skills.Digit2.damageMultiplier, 10)} damage)` : "No ability assigned",
    },

    {
      key:
        "3",

      code:
        "Digit3",

      icon: skills.Digit3?.icon,
      cooldown: skills.Digit3?.cooldown,
      tooltip:
        skills.Digit3 ? `${skills.Digit3.name} (Causes ${parseInt(playerStats.damage * skills.Digit3.damageMultiplier * (skills.Digit3.aoe ? playerStats.aoeDamageMultiplier : 1), 10)} damage${skills.Digit3.aoe ? " to nearby enemies" : " per enemy"})` : "No ability assigned",
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

  { id: "items", icon: "backpack", label: "Items", shortcut: "I / B", defaultTab: "inventory" },

  { id: "hero", icon: "sword", label: "Hero", shortcut: "G / Q / H / Z / T", defaultTab: "gear" },

  { id: "map", icon: "map", label: "Map", shortcut: "M" },

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


    const openModals = useHudStore((state) => state.openModals);
    const closeModal = useHudStore((state) => state.closeModal);
    const openSection = useHudStore((state) => state.openSection);

    return (
      <div
        className="
          hud-menu
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
              shortcut,
              defaultTab,
            }) => (
              <button
                key={
                  id
                }
                id={id === "items" ? "onboarding-inventory" : id === "hero" ? "onboarding-quests" : undefined}
                type="button"
                title={
                  shortcut ? `${label} (Press ${shortcut})` : label
                }
                aria-label={shortcut ? `${label} (Press ${shortcut})` : label}
                onClick={
                  () => openModals.includes(id) ? closeModal(id) : defaultTab ? openSection(id, defaultTab) : openModal(id)
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
      id="onboarding-health"
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
  mobile = false,
}) => {
  const skillCooldownUntil = useActionBarStore((state) => state.cooldownUntil[slot.code] || 0);
  const cooldownUntil =
    slot.code ===
    "Digit4"
      ? healCooldownUntil
      : skillCooldownUntil;


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
        {...actionButtonHandlers(() => onTrigger(slot.code), mobile)}
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
  gameClass,
  species,
  talents,
  healCooldownUntil,
  mobile = false,
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
      equipment,
      gameClass,
      species,
      talents
    );


  return (
    <div
      id="onboarding-action-bar"
      className="
        hud-action-bar
        flex
        gap-2
      "
    >
      {actionSlots.map(
        (
          slot
        ) => (
          <ActionSlot
            mobile={mobile}
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
  mobile = false,
  currentLevel,
  equipment,
  gameClass,
  species,
  talents,
  playerHealth,
  potionBuffs,
  healCooldownUntil,
  mounted,
  isDead,
  inDungeon,
  inCombat,
}) => {
  if (mobile) return (
    <>
      <div className="absolute bottom-3 right-3 z-[10000]">
        <div className="mb-3 flex gap-2">
          <button type="button" className="btn btn-sm" disabled={isDead} {...actionButtonHandlers(() => useActionBarStore.getState().triggerSkill("Space"), true)}>Jump</button>
          <button type="button" className="btn btn-sm" disabled={isDead || inDungeon || (inCombat && !mounted)} {...actionButtonHandlers(() => useActionBarStore.getState().triggerSkill("KeyV"), true)}>
            {mounted ? "Dismount" : "Mount"}
          </button>
        </div>
        <ActionBar mobile gameClass={gameClass} species={species} talents={talents} currentLevel={currentLevel} equipment={equipment} healCooldownUntil={healCooldownUntil} />
      </div>
      <div className="mobile-player-bars absolute bottom-2 left-1/2 z-40 flex flex-col items-center gap-1">
        <div className="relative">
          <PlayerHealthBar health={playerHealth.health} maxHealth={playerHealth.maxHealth} />
          <PotionBuffs buffs={potionBuffs} isDead={isDead} />
        </div>
        <XpBar />
      </div>
    </>
  );
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
        gameClass={gameClass}
        species={species}
        talents={talents}
        currentLevel={
          currentLevel
        }
        equipment={equipment}
        healCooldownUntil={
          healCooldownUntil
        }
      />


      <div className="relative">
        <div
          className="tooltip tooltip-top absolute left-[-60px] h-[45px] top-0"
          data-tip={mounted ? "Dismount" : inCombat ? "Cannot mount in combat" : "Mount"}
        >
          <button
            type="button"
            disabled={isDead || inDungeon || (inCombat && !mounted)}
            onClick={() => useActionBarStore.getState().triggerSkill("KeyV")}
            className={`btn btn-sm relative h-[45px] w-[55px] border-white/20 bg-black/70 text-white hover:bg-black/90 disabled:opacity-40 disabled:pointer-events-auto ${isDead || inDungeon || (inCombat && !mounted) ? "cursor-not-allowed" : ""}`}
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
        <PotionBuffs buffs={potionBuffs} isDead={isDead} />
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
  gameClass = "warrior",
  species = "human",
  talents,
  equipment,
  playerHealth,
  potionBuffs,
  healCooldownUntil,
  mounted = false,
  inCombat = false,
}) => {
  const { mobile, portrait } = useMobileDevice();
  const inDungeon = useDungeonStore((state) => state.location === "dungeon");
  const dungeonBusy = useDungeonStore((state) => state.busy);
  const leaveDungeon = useDungeonStore((state) => state.leaveDungeon);
  const isDead =
    playerHealth.health <=
    0;
  const lowHealth = playerHealth.maxHealth > 0 &&
    playerHealth.health / playerHealth.maxHealth < 0.25;


  return (
    <>
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 bg-red-900/30 transition-opacity duration-300 ${lowHealth ? "opacity-100" : "opacity-0"}`}
      />
      <Chat />
      <LootPrompt />
      <DungeonPrompt />
      <GroupPanel />
      <GroupInvitationModal />

      <CombatBorder />


      <LevelUpOverlay />
      <HuntProgressPopup />
      <QuestCompletionOverlay />
      <BossNotice />
      <BossHealthBar />
      <TargetFrame currentLevel={currentLevel} />


      <MenuButtons />
      {mobile && <MobileJoystick portrait={portrait} disabled={isDead} />}


      <div
        className="
          absolute
          hud-world-panel
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
        {inDungeon && (
          <button type="button" className="btn btn-sm btn-error" disabled={dungeonBusy} onClick={leaveDungeon}>
            Leave Dungeon
          </button>
        )}

        <div className="hud-trackers contents">
          {!inDungeon && <WorldEventTracker />}
          <AdventureGuide currentLevel={currentLevel} />
        </div>
      </div>


      <BottomHud
        mobile={mobile}
        gameClass={gameClass}
        species={species}
        talents={talents}
        currentLevel={
          currentLevel
        }
        equipment={equipment}
        playerHealth={
          playerHealth
        }
        potionBuffs={potionBuffs}
        healCooldownUntil={
          healCooldownUntil
        }
        mounted={mounted}
        inCombat={inCombat}
        isDead={isDead}
        inDungeon={inDungeon}
      />


      {isDead && (
        <DeathOverlay />
      )}


      <WorldMapModal />
      <ItemsModal />
      <HeroModal />
      <AchievementToast />

      <HelpModal />


      <SettingsModal />
    </>
  );
};
