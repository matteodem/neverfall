import { LOOT_RANGE } from "./inventory";
import { DUNGEON, nearDungeonObject } from "./dungeonConfig";
import { enterDungeon } from "./gameSession";
import { useDungeonStore } from "../ui/stores/useDungeonStore";
import { useHudStore } from "../ui/stores/useHudStore";

export const createDungeonInteractions = ({ room, player, visuals, dungeon }) => {
  let elapsed = 100;
  const update = (deltaTime) => {
    elapsed += deltaTime;
    if (elapsed < 100) return;
    elapsed %= 100;
    const state = room.state;
    const local = state?.players?.get(room.sessionId);
    const completed = dungeon && Boolean(state?.completed);
    visuals?.setCompleted(completed);
    let prompt = null;
    if (local?.health > 0) {
      if (!dungeon && !local.inDungeon && nearDungeonObject(player.position, DUNGEON.entrance)) prompt = "enter";
      if (dungeon && completed && !local.dungeonRewardClaimed && state.loot.has(`chest-${local.characterId}`)
        && nearDungeonObject(player.position, DUNGEON.chest, LOOT_RANGE)) prompt = "reward";
      if (dungeon && nearDungeonObject(player.position, DUNGEON.exit)) prompt = "exit";
    }
    useDungeonStore.getState().update({ prompt, stage: dungeon ? state?.stage || 0 : 0, completed });
  };

  const interact = () => {
    update(100);
    const state = useDungeonStore.getState();
    if (!state.prompt) return false;
    if (state.busy || useHudStore.getState().activeModal) return true;
    if (state.prompt === "enter") enterDungeon();
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
