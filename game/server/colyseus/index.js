import {
  WebApp,
} from "meteor/webapp";

import httpProxy from "http-proxy";

import {
  DungeonRoom,
} from "./DungeonRoom";

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


const COLYSEUS_PORT = 2567;

const COLYSEUS_PREFIX =
  "/colyseus";

let server = null;

let proxyInitialized = false;


const stripColyseusPrefix = (
  url = ""
) => {
  const stripped =
    url.replace(
      /^\/colyseus/,
      ""
    );

  return stripped || "/";
};


const setupColyseusProxy = () => {
  if (proxyInitialized) {
    return;
  }

  proxyInitialized = true;

  const proxy =
    httpProxy.createProxyServer({
      target:
        `http://127.0.0.1:${COLYSEUS_PORT}`,

      ws:
        true,
    });


  proxy.on(
    "error",
    (
      error,
      req,
      res
    ) => {
      console.error(
        "[Colyseus Proxy]",
        error
      );

      if (
        res &&
        !res.headersSent
      ) {
        res.writeHead(
          502
        );

        res.end(
          "Colyseus unavailable"
        );
      }
    }
  );


  /*
   * HTTP matchmaking:
   *
   * /colyseus/matchmake/...
   *          ↓
   * /matchmake/...
   */
  WebApp.rawHandlers.use(
    COLYSEUS_PREFIX,
    (
      req,
      res
    ) => {
      req.url =
        stripColyseusPrefix(
          req.originalUrl ||
          req.url
        );

      proxy.web(
        req,
        res
      );
    }
  );


  /*
   * WebSocket rooms:
   *
   * /colyseus/<process>/<room>
   *          ↓
   * /<process>/<room>
   */
  WebApp.httpServer.on(
    "upgrade",
    (
      req,
      socket,
      head
    ) => {
      if (
        !req.url?.startsWith(
          `${COLYSEUS_PREFIX}/`
        )
      ) {
        return;
      }

      req.url =
        stripColyseusPrefix(
          req.url
        );

      proxy.ws(
        req,
        socket,
        head
      );
    }
  );
};


export const startColyseus =
  async () => {
    if (server) {
      return;
    }

    server =
      defineServer({
        transport:
          new WebSocketTransport({
            pingInterval:
              6000,

            pingMaxRetries:
              4,
          }),

        rooms: {
          dungeon:
            defineRoom(
              DungeonRoom
            ),

          world:
            defineRoom(
              WorldRoom
            ),
        },
      });


    /*
     * Colyseus listens only
     * internally.
     */
    await server.listen(
      COLYSEUS_PORT
    );


    /*
     * Public access goes through
     * Meteor /colyseus.
     */
    setupColyseusProxy();


    console.log(
      `[Colyseus] internal port ${COLYSEUS_PORT}`
    );

    console.log(
      "[Colyseus] proxied through /colyseus"
    );
  };