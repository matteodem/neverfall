import { DungeonRoom } from "./DungeonRoom";
import {
  defineRoom,
  defineServer,
} from "colyseus";

import {
  WebSocketTransport,
} from "@colyseus/ws-transport";

import {
  WorldRoom,
} from "./WorldRoom";

const COLYSEUS_PORT = process.env.NODE_ENV === "production" ? process.env.PORT : 2567;

let server = null;

export const startColyseus = async () => {
  if (server) {
    return;
  }

  server = defineServer({
    transport: new WebSocketTransport({
      pingInterval: 6000,
      pingMaxRetries: 4,
    }),

    rooms: {
      dungeon: defineRoom(DungeonRoom),
      world: defineRoom(
        WorldRoom
      ),
    },
  });

  await server.listen(
    COLYSEUS_PORT
  );

  console.log(
    `[Colyseus] listening on port ${COLYSEUS_PORT}`
  );
};