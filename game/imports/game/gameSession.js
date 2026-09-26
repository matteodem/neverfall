import { connectGroups } from "./groups";
import { Client } from "@colyseus/sdk";
import { Meteor } from "meteor/meteor";
import { ensureGuestUser } from "../auth/guest";
import { useDungeonStore } from "../ui/stores/useDungeonStore";

let session = null;
let connecting = null;

const leaveRoom = (room) => room?.connection?.isOpen ? room.leave() : Promise.resolve();

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

const finishEntry = async (current, { roomId, worldSessionId }) => {
  if (session !== current || !current.entering) return;
  clearTimeout(current.entryTimeout);
  try {
    current.client.auth.token = await Meteor.callAsync("colyseus.authToken");
    const room = await current.client.joinById(roomId, { worldSessionId });
    if (session !== current) { await leaveRoom(room); return; }
    current.pendingRoom = room;
    await waitForState(room, (state) => state?.players?.has(room.sessionId));
    if (session !== current) { await leaveRoom(room); return; }
    current.pendingRoom = null;
    current.room = room;
    room.onMessage("dungeonError", (message) => useDungeonStore.getState().setError(message));
    room.onMessage("dungeonExitReady", () => finishExit(current));
    room.onLeave(() => {
      if (session !== current || current.exiting) return;
      current.room = current.worldRoom;
      useDungeonStore.getState().setLocation("world");
      useDungeonStore.getState().setError("You left the dungeon.");
    });
    useDungeonStore.getState().setLocation("dungeon");
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
  current.exiting = true;
  useDungeonStore.getState().setBusy(true);
  try {
    await leaveRoom(current.room);
    current.room = current.worldRoom;
    await waitForState(current.worldRoom, (state) => state?.players?.get(current.worldRoom.sessionId)?.inDungeon === false);
    if (session === current) useDungeonStore.getState().setLocation("world");
  } catch (error) {
    if (session === current) {
      current.room = current.worldRoom;
      useDungeonStore.getState().setLocation("world");
      useDungeonStore.getState().setError(error.message);
    }
  } finally {
    current.exiting = false;
  }
};

export const getGameSession = async () => {
  if (session) return session;
  if (connecting) return connecting;
  connecting = (async () => {
    await ensureGuestUser();
    const client = new Client("ws://localhost:2567");
    client.auth.token = await Meteor.callAsync("colyseus.authToken");
    const worldRoom = await client.joinOrCreate("world");
    try {
      await waitForState(worldRoom, (state) => state?.players?.has(worldRoom.sessionId));
    } catch (error) { await leaveRoom(worldRoom); throw error; }
    const current = { client, room: worldRoom, worldRoom, entering: false, exiting: false, disconnectGroups: connectGroups(worldRoom) };
    session = current;
    // The party connection receives combat broadcasts while its scene is inactive.
    for (const type of ["attack", "enemyAttack", "playerHeal", "healCooldown"]) worldRoom.onMessage(type, () => {});
    worldRoom.onMessage("dungeonReady", (data) => finishEntry(current, data));
    worldRoom.onMessage("dungeonError", (message) => {
      clearTimeout(current.entryTimeout);
      current.entering = false;
      useDungeonStore.getState().setError(message);
    });
    worldRoom.onLeave(() => {
      if (session !== current) return;
      session = null;
      current.disconnectGroups();
      clearTimeout(current.entryTimeout);
      if (current.room !== worldRoom) leaveRoom(current.room);
      useDungeonStore.getState().reset();
      useDungeonStore.getState().setError("World connection closed.");
    });
    return current;
  })();
  try { return await connecting; }
  finally { connecting = null; }
};

export const enterDungeon = () => {
  const current = session;
  if (!current || current.entering || current.room !== current.worldRoom) return;
  current.entering = true;
  useDungeonStore.getState().setBusy(true);
  current.entryTimeout = setTimeout(() => {
    current.entering = false;
    useDungeonStore.getState().setError("Could not enter the dungeon. Please try again.");
  }, 15000);
  current.worldRoom.send("dungeonEnter");
};

export const leaveDungeon = () => {
  if (!session || session.room === session.worldRoom || useDungeonStore.getState().busy) return;
  return finishExit(session);
};

export const closeGameSession = async () => {
  const current = session;
  session = null;
  if (!current) return;
  clearTimeout(current.entryTimeout);
  current.disconnectGroups();
  useDungeonStore.getState().reset();
  const rooms = new Set([current.room, current.worldRoom, current.pendingRoom]);
  await Promise.allSettled([...rooms].filter(Boolean).map(leaveRoom));
};
