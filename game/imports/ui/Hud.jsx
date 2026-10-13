import { FantasyButton, FantasyHudCard, FantasyKey, FantasyMeter, FantasyNotificationStack } from "./components/fantasy/FantasyUI";
import { TargetFrame } from "./components/TargetFrame";
import { BossHealthBar } from "./components/BossHealthBar";
import { Chat } from "./components/Chat";
import { WorldMapModal } from "./components/modals/WorldMapModal";
import { FeedbackModal } from "./components/modals/FeedbackModal";
import { AdminAnalyticsModal } from "./components/modals/AdminAnalyticsModal";
import { ItemsModal, HeroModal } from "./components/modals/GroupedHudModals";
import { SocialModal } from "./components/modals/SocialModal";
import { PotionBuffs } from "./components/PotionBuffs";
import { useMobileDevice } from "./hooks/useMobileDevice";
import { MobileJoystick } from "./components/MobileJoystick";
import { actionButtonHandlers } from "./components/actionButtonHandlers";
import { BossNotice } from "./components/BossNotice";
import { QuestCompletionOverlay } from "./components/QuestCompletionOverlay";
import { WorldEventTracker } from "./components/WorldEventTracker";
import { TrackedQuestHud } from "./components/TrackedQuestHud";
import { AchievementToast } from "./components/modals/AchievementModal";
import { QuestProgressToast } from "./components/QuestProgressToast";
import { SKILL_CODES } from "../game/skills";
import { useSkillsStore } from "./stores/useSkillsStore";
import { getTalentSkill } from "../game/talents";
import { STATUS_EFFECTS } from "../game/statusEffects";
import { useDungeonStore } from "./stores/useDungeonStore";
import { DungeonPrompt } from "./components/DungeonPrompt";
import { NpcDialogue } from "./components/NpcDialogue";
import { GroupInvitationModal } from "./components/GroupInvitationModal";
import { GroupPanel } from "./components/GroupPanel";
import { LootPrompt } from "./components/LootPrompt";
import { ItemReceivedToast } from "./components/ItemReceivedToast";
import React, {
  useEffect,
  useState,
} from "react";

import {
  useHudStore,
  hasBlockingModal,
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


const getActionSlots = (currentLevel, equipment, gameClass, species, talents, equippedSkills) => {
  const stats = getPlayerStats(currentLevel, equipment, gameClass, species, talents);
  return SKILL_CODES.map((code, index) => {
    const skill = getTalentSkill(gameClass, code, currentLevel, talents, equippedSkills);
    let tooltip = skill.heal ? `Heal yourself for ${stats.healAmount} HP` : skill.buff ? skill.name :
      `${skill.name} (Causes ${parseInt(stats.damage * skill.damageMultiplier * (skill.aoe ? stats.aoeDamageMultiplier : 1), 10)} damage${skill.aoe ? " to nearby enemies" : ""})`;
    for (const [field, verb] of [["selfStatus", "Grants"], ["hitStatus", "Applies"]]) {
      const effect = STATUS_EFFECTS[skill[field]];
      if (effect) tooltip += ` ${verb} ${effect.name} for ${effect.duration / 1000}s: ${effect.description}`;
    }
    return { key: String(index + 1), code, icon: skill.icon, cooldown: skill.cooldown, heal: skill.heal, tooltip };
  });
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

  { id: "items", icon: "backpack", label: "Items", shortcut: "I / C", defaultTab: "inventory" },

  { id: "hero", icon: "sword", label: "Hero", shortcut: "G / Q / Z / T", defaultTab: "gear" },

  { id: "social", icon: "social", label: "Social", shortcut: "E" },

  { id: "map", icon: "map", label: "Map", shortcut: "M" },

  {
    id:
      "help",

    icon:
      "question",

    label:
      "Help",

    shortcut:
      "U",
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

        fantasy-cooldown
      "
      style={{
        backgroundImage:
          `conic-gradient(
            var(--fantasy-cooldown-cover)
            ${progress * 360}deg,
            var(--fantasy-cooldown-track) 0deg
          )`,
      }}
    >
      <span className="fantasy-cooldown-count">{seconds}</span>
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
      <FantasyHudCard
        className="
          hud-menu
          absolute
          left-4
          top-4

          px-4
          py-3

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
              <FantasyButton
                key={
                  id
                }
                id={id === "items" ? "onboarding-inventory" : id === "hero" ? "onboarding-quests" : undefined}
                variant="secondary"
                aria-pressed={openModals.includes(id)}
                type="button"
                title={
                  shortcut ? `${label} (Press ${shortcut})` : label
                }
                aria-label={shortcut ? `${label} (Press ${shortcut})` : label}
                onClick={
                  () => openModals.includes(id) ? closeModal(id) : defaultTab ? openSection(id, defaultTab) : openModal(id)
                }
                className="
                  btn-circle
                  cursor-pointer
                "
              >
                <Icon
                  icon={
                    icon
                  }
                />
              </FantasyButton>
            )
          )}
        </div>
      </FantasyHudCard>
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
    <FantasyHudCard id="onboarding-health" className="fantasy-resource w-72">
      <div className="mb-1 flex justify-between gap-2 text-sm">
        <span>Health</span>
        <span>{parseInt(health, 10)} / {maxHealth}</span>
      </div>
      <FantasyMeter value={health} max={maxHealth} percentage={percentage} label="Player health" className="h-4" />
    </FantasyHudCard>
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
    slot.heal
      ? Math.max(healCooldownUntil || 0, skillCooldownUntil)
      : skillCooldownUntil;


  return (
    <div className="fantasy-tooltip tooltip tooltip-top" data-tip={slot.tooltip}>
      <FantasyButton variant="secondary" aria-label={`${slot.tooltip} (Press ${slot.key})`}
        {...actionButtonHandlers(() => onTrigger(slot.code), mobile)}
        className="fantasy-skill relative flex h-14 w-14 flex-col items-center justify-center">
        <FantasyKey className="absolute right-1 top-1">{slot.key}</FantasyKey>
        {slot.icon && <Icon icon={slot.icon} className="h-5 w-5" />}
        {slot.cooldown && <CooldownOverlay until={cooldownUntil} duration={slot.cooldown} />}
      </FantasyButton>
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


  const equippedSkills = useSkillsStore((state) => state.equippedSkills);
  const blockingModalOpen = useHudStore(hasBlockingModal);
  if (blockingModalOpen) return null;
  const actionSlots =
    getActionSlots(
      currentLevel,
      equipment,
      gameClass,
      species,
      talents,
      equippedSkills
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
          <FantasyButton variant="secondary" className="btn-sm" disabled={isDead} {...actionButtonHandlers(() => useActionBarStore.getState().triggerSkill("Space"), true)}>Jump</FantasyButton>
          <FantasyButton variant="secondary" className="btn-sm" disabled={isDead || inDungeon || (inCombat && !mounted)} {...actionButtonHandlers(() => useActionBarStore.getState().triggerSkill("KeyV"), true)}>
            {mounted ? "Dismount" : "Mount"}
          </FantasyButton>
        </div>
        <ActionBar mobile gameClass={gameClass} species={species} talents={talents} currentLevel={currentLevel} equipment={equipment} healCooldownUntil={healCooldownUntil} />
      </div>
      <div className="mobile-player-bars absolute bottom-2 left-1/2 z-40 flex flex-col items-center gap-1">
        <div className="relative">
          <PlayerHealthBar health={playerHealth.health} maxHealth={playerHealth.maxHealth} />
          <PotionBuffs mobile buffs={potionBuffs} isDead={isDead} />
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
          className="fantasy-tooltip tooltip tooltip-top absolute left-[-60px] h-[45px] top-0"
          data-tip={mounted ? "Dismount" : inCombat ? "Cannot mount in combat" : "Mount"}
        >
          <FantasyButton
            variant="secondary"
            aria-label={mounted ? "Dismount (V)" : "Mount (V)"}
            type="button"
            disabled={isDead || inDungeon || (inCombat && !mounted)}
            onClick={() => useActionBarStore.getState().triggerSkill("KeyV")}
            className={`btn-sm relative h-[45px] w-[55px] disabled:pointer-events-auto ${isDead || inDungeon || (inCombat && !mounted) ? "cursor-not-allowed" : ""}`}
          >
            <Icon icon="horse" />
            <FantasyKey className="absolute right-1 top-1">V</FantasyKey>
          </FantasyButton>
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
  const [showObjectives, setShowObjectives] = useState(() => !mobile);
  useEffect(() => setShowObjectives(!mobile), [mobile]);
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
      <FantasyNotificationStack>
        <BossNotice />
        <QuestProgressToast />
        <QuestCompletionOverlay />
        <ItemReceivedToast />
        <LevelUpOverlay />
        <AchievementToast />
      </FantasyNotificationStack>
      <LootPrompt />
      <DungeonPrompt />
      <NpcDialogue />
      <GroupPanel />
      <GroupInvitationModal />

      <CombatBorder />


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
        <div className="hud-trackers flex flex-col items-end gap-2">
          {inDungeon && (
            <FantasyButton variant="danger" className="btn-sm" disabled={dungeonBusy} onClick={leaveDungeon}>
              Leave Dungeon
            </FantasyButton>
          )}
          {mobile && <FantasyButton variant="secondary" className="btn-xs" aria-expanded={showObjectives} aria-controls="hud-objectives"
            onClick={(event) => { setShowObjectives((visible) => !visible); event.currentTarget.blur(); }}>
            {showObjectives ? "Hide Objectives" : "Show Objectives"}
          </FantasyButton>}
          <div id="hud-objectives" className="flex flex-col items-end gap-2" style={{ display: !mobile || showObjectives ? "flex" : "none" }}>
            {!inDungeon && <WorldEventTracker />}
            <TrackedQuestHud />
          </div>
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
      <SocialModal />

      <HelpModal />
      <FeedbackModal />
      <AdminAnalyticsModal />


      <SettingsModal />
    </>
  );
};
