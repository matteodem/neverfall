import { randomUUID } from "node:crypto";
import { matchMaker } from "colyseus";
import { DUNGEON, DUNGEON_PLAYER_FIELDS, nearDungeonObject } from "../../imports/game/dungeonConfig";
import { recordQuestEvent } from "../quests";

// Server-only capabilities prevent clients from creating an authorized instance.
const accessKeys = new Map();
export const getDungeonAccess = (key) => accessKeys.get(key);
export const removeDungeonAccess = (key) => accessKeys.delete(key);

export const createDungeonInstances = (world) => {
  const instances = new Map();

  return {
    async enter(client) {
      const player = world.state.players.get(client.sessionId);
      if (!player || player.inDungeon || player.health <= 0 || !nearDungeonObject(player, DUNGEON.entrance)) {
        client.send("dungeonError", "Move closer to the dungeon entrance to enter.");
        return;
      }
      void recordQuestEvent(world, player.characterId, "Interact", "dungeon-entrance")
        .catch((error) => console.error("[Quests] Could not save interaction progress", error));
      const groupId = player.groupId;
      const key = groupId ? `party:${groupId}` : `solo:${player.characterId}`;
      try {
        let pending = instances.get(key);
        if (pending && !matchMaker.getLocalRoomById((await pending).roomId)) pending = null;
        if (!pending) {
          const accessKey = randomUUID();
          const access = { world, groupId, soloCharacterId: groupId ? null : player.characterId, roomId: null };
          accessKeys.set(accessKey, access);
          pending = matchMaker.createRoom("dungeon", { accessKey }).catch((error) => {
            accessKeys.delete(accessKey);
            instances.delete(key);
            throw error;
          });
          instances.set(key, pending);
        }
        const instance = await pending;
        if (world.state.players.get(client.sessionId) !== player || player.groupId !== groupId) {
          client.send("dungeonError", "Your group changed. Please enter again.");
          return;
        }
        client.send("dungeonReady", { roomId: instance.roomId, worldSessionId: client.sessionId });
      } catch (error) {
        console.error("[Dungeon] Could not create instance", error);
        client.send("dungeonError", "Could not enter the dungeon. Please try again.");
      }
    },

    syncPlayer(source) {
      for (const [sessionId, player] of world.state.players) {
        if (player !== source) continue;
        const roomId = world.playerRuntime.get(sessionId)?.dungeonRoomId;
        const dungeon = roomId && matchMaker.getLocalRoomById(roomId);
        if (!dungeon) return;
        for (const active of dungeon.state.players.values()) {
          if (active.characterId !== source.characterId) continue;
          for (const key of DUNGEON_PLAYER_FIELDS) active[key] = source[key];
        }
      }
    },

    removePlayer(sessionId) {
      const roomId = world.playerRuntime.get(sessionId)?.dungeonRoomId;
      const dungeon = roomId && matchMaker.getLocalRoomById(roomId);
      const client = dungeon?.clients.find((candidate) => dungeon.state.players.get(candidate.sessionId)?.worldSessionId === sessionId);
      client?.leave();
    },

    dispose() {
      for (const pending of instances.values()) {
        pending.then(({ roomId }) => matchMaker.getLocalRoomById(roomId)?.disconnect()).catch(() => {});
      }
      instances.clear();
    },
  };
};
