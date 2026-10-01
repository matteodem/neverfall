import { LOOT_RANGE } from "./inventory";
import { DUNGEONS, getDungeonConfig, nearDungeonObject } from "./dungeonConfig";
import { enterDungeon, leaveDungeon } from "./gameSession";
import { useDungeonStore } from "../ui/stores/useDungeonStore";
import { useHudStore } from "../ui/stores/useHudStore";
import { BASIC_TOWER_CHEST_POSITION } from "./basicTowerConfig";

export const createDungeonInteractions = ({ room, player, visuals, dungeon }) => {
  const config = dungeon ? getDungeonConfig(useDungeonStore.getState().dungeonId) : null;
  let elapsed = 100;
  const update = (deltaTime) => {
    if (useDungeonStore.getState().location !== (dungeon ? "dungeon" : "world")) return;
    elapsed += deltaTime;
    if (elapsed < 100) return;
    elapsed %= 100;
    const state = room.state;
    const local = state?.players?.get(room.sessionId);
    const completed = dungeon && Boolean(state?.completed);
    const nearbyEntrance = !dungeon && DUNGEONS.find((entry) =>
      nearDungeonObject(player.position, entry.entrance, entry.interactionDistance));
    visuals?.setCompleted(completed);
    let prompt = null;
    if (local?.health > 0) {
      if (nearbyEntrance && !local.inDungeon) prompt = "enter";
      const chest = BASIC_TOWER_CHEST_POSITION;
      if (!dungeon && !local.towerChestClaimed &&
        Math.hypot(player.position.x - chest.x, player.position.y - chest.y,
          player.position.z - chest.z) <= 3) prompt = "towerChest";
      if (dungeon && completed && !local.dungeonRewardClaimed && state.loot.has(`chest-${local.characterId}`)
        && nearDungeonObject(player.position, config.chest, LOOT_RANGE)) prompt = "reward";
      if (dungeon && nearDungeonObject(player.position, config.exit, config.interactionDistance)) prompt = "exit";
    }
    useDungeonStore.getState().update({
      prompt, stage: dungeon ? state?.stage || 0 : 0, completed,
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
    if (state.prompt === "reward") room.send("dungeonReward");
    if (state.prompt === "exit") {
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
      useDungeonStore.getState().update({ prompt: null, stage: 0, completed: false });
    },
  };
};
