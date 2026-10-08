import { connectGroups } from "./groups";
import { useActionBarStore } from "../ui/stores/useActionBarStore";
import { Client } from "@colyseus/sdk";
import { Meteor } from "meteor/meteor";
import { ensureGuestUser } from "../auth/guest";
import { useDungeonStore } from "../ui/stores/useDungeonStore";
import { useQuestCompletionStore } from "../ui/stores/useQuestCompletionStore";
import { useQuestStore } from "../ui/stores/useQuestStore";
import { useTargetStore } from "../ui/stores/useTargetStore";
import { createDungeonExitTrace } from "./dungeonExitTrace";

let session = null;
let connecting = null;

export const getDungeonExitTrace = () => session?.exitTrace;
export const clearDungeonExitTrace = (trace) => {
  if (session && session.exitTrace === trace) session.exitTrace = null;
};
export const traceDungeonExitRequested = (reason) => {
  const current = session;
  if (!current || current.room === current.worldRoom) return null;
  if (!current.exitTrace) {
    current.exitTrace = createDungeonExitTrace({
      side: "client", reason,
      dungeonRoomId: current.room.roomId,
      dungeonSessionId: current.room.sessionId,
      worldRoomId: current.worldRoom.roomId,
      worldSessionId: current.worldRoom.sessionId,
    });
    current.exitTrace("leave requested");
  }
  return current.exitTrace;
};

const leaveRoom = (room) => room?.connection?.isOpen ? room.leave() : Promise.resolve();

const showHuntProgress = ({ title, count, target, completed }) => {
  const quests = useQuestStore.getState();
  if (completed) quests.hideHuntProgress();
  else quests.showHuntProgress(title, count, target);
};

const recordEnemyAttack = ({ id, level }) => useTargetStore.getState().recordAttack(id, level);

const waitForState = (room, ready) => {
  if (ready(room.state)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const finish = (error) => {
      clearTimeout(timeout);
      room.onStateChange.remove(check);
      room.onLeave.remove(left);
      if (error) reject(error);
      else resolve();
    };
    const check = (state) => { if (ready(state)) finish(); };
    const left = () => finish(new Error("Connection closed."));
    const timeout = setTimeout(() => finish(new Error("The server did not respond. Please try again.")), 15000);
    room.onStateChange(check);
    room.onLeave(left);
  });
};

const finishEntry = async (current, { roomId, worldSessionId, dungeonId }) => {
  if (session !== current || !current.entering) return;
  clearTimeout(current.entryTimeout);
  try {
    current.client.auth.token = await Meteor.callAsync("colyseus.authToken");
    const room = await current.client.joinById(roomId, { worldSessionId });
    if (session !== current) { await leaveRoom(room); return; }
    room.onMessage("questCompleted", (quest) => useQuestCompletionStore.getState().show(quest));
    room.onMessage("huntProgress", showHuntProgress);
    room.onMessage("enemyEngaged", recordEnemyAttack);
    current.pendingRoom = room;
    await waitForState(room, (state) => state?.players?.has(room.sessionId));
    if (session !== current) { await leaveRoom(room); return; }
    current.pendingRoom = null;
    current.room = room;
    room.onMessage("dungeonError", (message) => useDungeonStore.getState().setError(message));
    room.onMessage("dungeonExitReady", () => {
      traceDungeonExitRequested("portal")?.("exit portal accepted by server");
      return finishExit(current);
    });
    room.onDrop((code) => current.exitTrace?.("DungeonRoom transport dropped", { code }));
    room.onReconnect(() => current.exitTrace?.("DungeonRoom transport reconnected"));
    room.onLeave((code) => {
      current.exitTrace?.("DungeonRoom socket closed", { code });
      if (session !== current || current.exiting) return;
      current.room = current.worldRoom;
      useDungeonStore.getState().setLocation("world");
      useDungeonStore.getState().setError("You left the dungeon.");
    });
    useDungeonStore.getState().setLocation("dungeon", dungeonId);
  } catch (error) {
    await leaveRoom(current.pendingRoom);
    current.pendingRoom = null;
    if (session === current) useDungeonStore.getState().setError(error.message || "Could not enter the dungeon.");
  } finally {
    current.entering = false;
  }
};

const finishExit = async (current) => {
  if (session !== current || current.exiting || current.room === current.worldRoom) return;
  const trace = traceDungeonExitRequested("manual");
  let worldReturned = false;
  const observeWorldReturn = (state) => {
    const player = state?.players?.get(current.worldRoom.sessionId);
    if (worldReturned || player?.inDungeon !== false) return;
    worldReturned = true;
    trace?.("WorldRoom return state received", { x: player.x, y: player.y, z: player.z, health: player.health });
  };
  current.worldRoom.onStateChange(observeWorldReturn);
  observeWorldReturn(current.worldRoom.state);
  current.exiting = true;
  useDungeonStore.getState().setBusy(true);
  try {
    // Production can report the close as 1005 (no status). This room is being
    // deliberately retired: do not let SDK retries postpone its leave promise.
    // Unexpected drops and the retained WorldRoom keep their normal recovery.
    current.room.reconnection.enabled = false;
    trace?.("DungeonRoom leave started", { socketOpen: Boolean(current.room.connection?.isOpen) });
    await leaveRoom(current.room);
    trace?.("DungeonRoom leave completed");
    current.room = current.worldRoom;
    trace?.("WorldRoom resume started", { reusedConnection: true, socketOpen: Boolean(current.worldRoom.connection?.isOpen) });
    await waitForState(current.worldRoom, (state) => state?.players?.get(current.worldRoom.sessionId)?.inDungeon === false);
    trace?.("WorldRoom resume completed");
    if (session === current) {
      trace?.("world scene transition requested");
      useDungeonStore.getState().setLocation("world");
    }
  } catch (error) {
    trace?.("exit failed", { message: error.message });
    if (session === current) {
      current.room = current.worldRoom;
      useDungeonStore.getState().setLocation("world");
      useDungeonStore.getState().setError(error.message);
    }
  } finally {
    current.worldRoom.onStateChange.remove(observeWorldReturn);
    current.exiting = false;
  }
};

export const getGameSession = async () => {
  if (session) return session;
  if (connecting) return connecting;
  connecting = (async () => {
    await ensureGuestUser();

    const protocol =
      window.location.protocol ===
      "https:"
        ? "wss:"
        : "ws:";

    const endpoint =
      `${protocol}//${window.location.host}/colyseus`;

    const client =
      new Client(
        endpoint
      );

    client.auth.token = await Meteor.callAsync("colyseus.authToken");
    const worldRoom = await client.joinOrCreate("world");
    worldRoom.onMessage("questCompleted", (quest) => useQuestCompletionStore.getState().show(quest));
    worldRoom.onMessage("huntProgress", showHuntProgress);
    worldRoom.onMessage("enemyEngaged", recordEnemyAttack);
    try {
      await waitForState(worldRoom, (state) => state?.players?.has(worldRoom.sessionId));
    } catch (error) { await leaveRoom(worldRoom); throw error; }
    const current = { client, room: worldRoom, worldRoom, entering: false, exiting: false, disconnectGroups: connectGroups(worldRoom) };
    session = current;
    // The party connection receives combat broadcasts while its scene is inactive.
    for (const type of ["attack", "enemyAttack", "playerHeal", "healCooldown", "skillCooldown", "projectileEnd"]) worldRoom.onMessage(type, () => {});
    worldRoom.onMessage("dungeonReady", (data) => finishEntry(current, data));
    worldRoom.onMessage("dungeonError", (message) => {
      clearTimeout(current.entryTimeout);
      current.entering = false;
      useDungeonStore.getState().setError(message);
    });
    worldRoom.onDrop((code) => current.exitTrace?.("WorldRoom transport dropped", { code }));
    worldRoom.onReconnect(() => current.exitTrace?.("WorldRoom transport reconnected"));
    worldRoom.onLeave((code) => {
      current.exitTrace?.("WorldRoom socket closed", { code });
      if (session !== current) return;
      session = null;
      current.disconnectGroups();
      clearTimeout(current.entryTimeout);
      if (current.room !== worldRoom) leaveRoom(current.room);
      useDungeonStore.getState().reset();
      useQuestCompletionStore.getState().reset();
      useDungeonStore.getState().setError("World connection closed.");
    });
    return current;
  })();
  try { return await connecting; }
  finally { connecting = null; }
};

export const enterDungeon = (dungeonId) => {
  const current = session;
  if (!dungeonId || !current || current.entering || current.room !== current.worldRoom) return;
  current.entering = true;
  useDungeonStore.getState().setBusy(true);
  current.entryTimeout = setTimeout(() => {
    current.entering = false;
    useDungeonStore.getState().setError("Could not enter the dungeon. Please try again.");
  }, 15000);
  current.worldRoom.send("dungeonEnter", dungeonId);
};

export const leaveDungeon = () => {
  if (!session || session.room === session.worldRoom || useDungeonStore.getState().busy) return;
  return finishExit(session);
};

export const closeGameSession = async () => {
  const current = session;
  session = null;
  useActionBarStore.getState().resetCooldowns();
  useQuestCompletionStore.getState().reset();
  if (!current) return;
  clearTimeout(current.entryTimeout);
  current.disconnectGroups();
  useDungeonStore.getState().reset();
  const rooms = new Set([current.room, current.worldRoom, current.pendingRoom]);
  await Promise.allSettled([...rooms].filter(Boolean).map(leaveRoom));
};
