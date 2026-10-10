import { LOOT_RANGE } from "./inventory";
import { DUNGEONS, getDungeonConfig, nearDungeonObject } from "./dungeonConfig";
import { enterDungeon, leaveDungeon, traceDungeonExitRequested } from "./gameSession";
import { useDungeonStore } from "../ui/stores/useDungeonStore";
import { useHudStore } from "../ui/stores/useHudStore";
import { BASIC_TOWER_CHEST_POSITION } from "./basicTowerConfig";
import { FROZEN_DISTURBANCE_POINTS } from "./quests";
import { Characters } from "../api/characters/characters";
import { getNearbyHiddenCache } from "./hiddenCaches";
import { NPC_QUESTS, NPC_QUEST_LOCATIONS, getNpcQuestState } from "./npcs/npcQuests";

export const createDungeonInteractions = ({ room, player, visuals, cacheVisuals, dungeon }) => {
  const config = dungeon ? getDungeonConfig(useDungeonStore.getState().dungeonId) : null;
  const nearbyQuestSeal = (local) => {
    if (dungeon || !local?.characterId) return null;
    const progress = Characters.findOne(local.characterId)?.questProgress?.["frozen-disturbance"] || 0;
    const point = FROZEN_DISTURBANCE_POINTS[progress - 1];
    return nearDungeonObject(player.position, point, 4) ? point : null;
  };
  let elapsed = 100;
  const nearbyQuestLocation = (local) => {
    if (dungeon || !local?.characterId || !NPC_QUEST_LOCATIONS.length) return null;
    const character = Characters.findOne(local.characterId);
    return NPC_QUEST_LOCATIONS.find((point) =>
      nearDungeonObject(player.position, point, point.interactionRange) && NPC_QUESTS.some((quest) =>
        getNpcQuestState(quest, character) === "active" &&
        (quest.objectives || [quest.objective]).some((objective) => objective.type === "Interact" && objective.target === point.id)));
  };
  const nearbyCache = (local) => {
    if (dungeon || local?.inDungeon || !local?.characterId) return null;
    const character = Characters.findOne(local.characterId);
    return character && getNearbyHiddenCache(player.position, character.lootedCacheIds);
  };
  const update = (deltaTime) => {
    if (useDungeonStore.getState().location !== (dungeon ? "dungeon" : "world")) return;
    elapsed += deltaTime;
    if (elapsed < 100) return;
    elapsed %= 100;
    const state = room.state;
    const local = state?.players?.get(room.sessionId);
    if (local?.characterId) cacheVisuals?.update(Characters.findOne(local.characterId)?.lootedCacheIds);
    const completed = dungeon && Boolean(state?.completed);
    const nearbyEntrance = !dungeon && DUNGEONS.find((entry) =>
      nearDungeonObject(player.position, entry.entrance, entry.interactionDistance));
    const challengeModeEnabled = dungeon && Boolean(state?.challengeModeEnabled);
    const challengeModeLocked = dungeon && Boolean(state?.challengeModeLocked);
    visuals?.setCompleted(completed);
    visuals?.setChallengeState(challengeModeEnabled, challengeModeLocked);
    let prompt = null;
    if (local?.health > 0) {
      if (nearbyEntrance && !local.inDungeon) prompt = "enter";
      const chest = BASIC_TOWER_CHEST_POSITION;
      if (!dungeon && !local.towerChestClaimed &&
        Math.hypot(player.position.x - chest.x, player.position.y - chest.y,
          player.position.z - chest.z) <= 3) prompt = "towerChest";
      if (dungeon && nearDungeonObject(player.position, config.challengeMote.position, config.interactionDistance)) {
        prompt = challengeModeLocked ? "challengeLocked" : "challengeMote";
      }
      if (dungeon && completed && !local.dungeonRewardClaimed && state.loot.has(`chest-${local.characterId}`)
        && nearDungeonObject(player.position, config.chest, LOOT_RANGE)) prompt = "reward";
      if (dungeon && nearDungeonObject(player.position, config.exit, config.interactionDistance)) prompt = "exit";
      if (!prompt && nearbyQuestSeal(local)) prompt = "riftSeal";
      if (!prompt && nearbyCache(local)) prompt = "hiddenCache";
      if (!prompt && nearbyQuestLocation(local)) prompt = "questLocation";
    }
    useDungeonStore.getState().update({
      prompt, stage: dungeon ? state?.stage || 0 : 0, completed,
      challengeModeEnabled, challengeModeLocked,
      dungeonId: dungeon ? config.id : nearbyEntrance?.id || null,
    });
  };

  const interact = (action) => {
    const local = room.state?.players?.get(room.sessionId);
    if (!local || local.health <= 0) return false;
    if (action === "leave") {
      if (!dungeon || useDungeonStore.getState().busy) return false;
      leaveDungeon();
      return true;
    }
    update(100);
    const state = useDungeonStore.getState();
    if (!state.prompt) return false;
    if (state.busy || useHudStore.getState().activeModal) return true;
    if (state.prompt === "enter") enterDungeon(state.dungeonId);
    if (state.prompt === "towerChest") room.send("claimTowerChest");
    if (state.prompt === "hiddenCache") {
      const cache = nearbyCache(local);
      if (cache) room.send("claimHiddenCache", cache.id);
    }
    if (state.prompt === "riftSeal") {
      const point = nearbyQuestSeal(local);
      if (point) room.send("interactQuestPoint", point.id);
    }
    if (state.prompt === "questLocation") {
      const point = nearbyQuestLocation(local);
      if (point) room.send("interactQuestPoint", point.id);
    }
    if (state.prompt === "challengeMote") room.send("dungeonChallengeToggle");
    if (state.prompt === "reward") room.send("dungeonReward");
    if (state.prompt === "exit") {
      traceDungeonExitRequested("portal");
      useDungeonStore.getState().setBusy(true);
      room.send("dungeonExit");
    }
    return true;
  };
  useDungeonStore.getState().setActionHandler(interact);
  return {
    update,
    interact,
    destroy() {
      useDungeonStore.getState().setActionHandler(null);
      useDungeonStore.getState().update({ prompt: null, stage: 0, completed: false, challengeModeEnabled: false, challengeModeLocked: false });
    },
  };
};
