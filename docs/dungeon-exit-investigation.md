# Dungeon exit delay investigation

Investigated on 2026-10-08 against https://neverfall-ae1i.onrender.com/ using an isolated guest Character. The repository fix has not been deployed.

## Confirmed blocking step

`finishExit()` in `game/imports/game/gameSession.js` awaits `room.leave()` before switching the scene back to the retained WorldRoom. Installed `@colyseus/sdk` 0.18.2 resolves that promise when `onLeave` fires. In production the dungeon WebSocket closed with **1005 (no status)**, even after a consented LEAVE_ROOM message. The SDK classified this as a transport drop and tried to reconnect to the deliberately retired dungeon instead of immediately invoking `onLeave`.

The first baseline took approximately **84.46 seconds from clicking Leave Dungeon to the usable world**. The dungeon socket had closed within a few seconds, followed by 15 automatic reconnect attempts while the UI remained “Traveling…”. Another capture showed the WorldRoom player already returned to `(0, 0, -86)`, health 140, `inDungeon: false`, just before the dungeon socket closed with 1005. Thus the long wait was after the server had returned the player, inside the SDK leave/reconnect lifecycle, rather than world matchmaking or auth-token generation.

There is no fixed two-minute application timer on this exit path. SDK backoff contributes **56.2 seconds** across 15 attempts (0.2, 0.4, 0.8, 1.6, 3.2, then ten 5-second delays). Connection establishment and failure handling add variable time. A further baseline exceeded 159 seconds with a stalled retry; it overlapped another headless guest session and is not a clean latency benchmark. The reproduced retry loop explains the long, variable production wait; no exact 120-second infrastructure timeout was established.

The public route is browser WSS → Cloudflare/Render → Meteor's `http-proxy` `/colyseus` upgrade handler → internal Colyseus WS on port 2567. The server normally closes a consented leave with code 4000 after cleanup. **Which hop causes the browser to receive 1005 is not proven.** The added server/client close-code diagnostics allow that comparison after deployment. No proxy configuration was changed.

## Complete flow

1. Manual Leave Dungeon invokes `leaveDungeon()` through the existing dungeon interaction handler. Completion marks the dungeon completed; leaving through its exit portal sends `dungeonExit`, which the server validates for a living player near the exit before sending `dungeonExitReady`. Both paths reach `finishExit()`.
2. `finishExit()` guards against duplicate exits, marks the dungeon store busy and calls the existing consented `room.leave()`. The normal world connection remains open throughout the dungeon visit.
3. Colyseus receives LEAVE_ROOM and awaits `DungeonRoom.onLeave()`. That method synchronizes party/player state and copies existing runtime effects/cooldowns to the WorldRoom player. It resets the player to the existing entrance return position, derives terrain height, restores health if necessary and clears `inDungeon`.
4. `DungeonRoom` awaits inherited `WorldRoom.onLeave()`: existing runtime/aggro/projectile/player cleanup followed by `Characters.updateAsync(...lastPlayedAt...)`. This database write can delay socket closure, so it has separate timing markers. The baseline WorldRoom return state and prompt closure do not implicate it in the observed long retry wait. Existing reward/progression persistence is unchanged; the return coordinates are realtime WorldRoom state, not a newly added Character position write.
5. After server cleanup the dungeon client closes. Empty instances dispose and remove their access capability. On the client, the leave promise resolves and `finishExit()` selects the **same WorldRoom**, waits for `inDungeon: false`, and sets location to `world`. Normal exit performs **no `joinOrCreate`, `joinById`, or Meteor auth-token refresh**. The dungeon onLeave fallback is guarded by `current.exiting`, so it does not compete with intentional exit.
6. The `Game.jsx` location effect disposes the dungeon scene while retaining multiplayer connections. It creates world assets/initial chunk, binds multiplayer to the existing WorldRoom, loads the return chunk and nearby enemy visuals, hides the loading UI and renders with controls enabled.

Relevant unchanged supporting code: `game/imports/game/multiplayer.js`, `game/imports/game/worldChunks.js`, `game/imports/ui/stores/useDungeonStore.js`, `game/server/colyseus/dungeonInstances.js`, `game/server/colyseus/index.js`, `game/server/methods/colyseusAuth.js`, and the installed Colyseus SDK/core/transport leave implementation.

## Minimal fix

Immediately before the intentional dungeon leave, set `current.room.reconnection.enabled = false`. Keep the consented leave message, awaited server cleanup and WorldRoom state gate. The dungeon is deliberately being retired, so reconnecting it serves no purpose. Unexpected dungeon drops and the retained WorldRoom retain their existing automatic recovery settings. No timer was shortened and no gameplay, reward, boss, party or persistence logic was changed.

Old: consented leave → close 1005 → reconnect retired dungeon repeatedly → terminal onLeave → resume WorldRoom → reload world scene.

New: disable recovery for this deliberate dungeon exit → consented leave/server cleanup → close/onLeave → resume WorldRoom → reload world scene.

SDK API reference: https://docs.colyseus.io/sdk/connection . Installed source was checked against the versions in `game/package.json` (SDK 0.18.2, core and WS transport 0.18.14).

## Timers inspected

| Value | Location / relevance |
| --- | --- |
| 15 retries, 100 ms exponential base, 5,000 ms cap | SDK automatic reconnect; observed source of the long wait. First scheduled delay is 200 ms. |
| 5,000 ms minimum uptime | SDK only attempts automatic reconnect for rooms old enough. Explains why very short visits may mask the bug. |
| 15,000 ms | Existing client entry/state wait. The exit state wait starts **after** `room.leave()`, so it never bounded the stuck leave promise. Unchanged. |
| 6,000 ms heartbeat, 4 retries | Existing server WS transport liveness detection; unchanged. |
| 15 seconds by default | Colyseus seat reservation; no fresh world reservation on normal exit. |
| 30 seconds by default | Installed WS close handshake timeout; not observed as the blocking step in the captured prompt-close run. |
| 5 minutes | Meteor-generated auth JWT lifetime; refreshed for entry/initial join, not normal exit. |

No application reconnect grace period or `allowReconnection()` was found in these rooms. No 60,000 / 90,000 / 120,000 ms exit timer or explicit proxy timeout was found in the inspected transition path.

## Verification and limits

To compare the fix without deploying, the isolated production browser set the actual SDK dungeon room's `reconnection.enabled` to false immediately before its original `leave()` call, matching the repository change. It did not alter server state, rewards or completion logic.

| Production browser check | Result |
| --- | --- |
| Manual Leave Dungeon | Leave promise resolved in **469 ms** despite close 1005; no reconnect retries. Usable world observed approximately **8.47 seconds after clicking** (includes click scheduling and headless scene/asset loading). |
| Completion exit handler | Dispatched `dungeonExitReady` through the actual SDK client message handler; leave resolved in **521 ms**, usable world observed approximately **6.76 seconds after dispatch**. This checks the shared handler, **not a completed boss run or server portal validation**. |
| WorldRoom/state | Same world room/session retained across both cycles; health 140, `inDungeon: false`, return `(0, terrain height, -86)`. Movement changed the server-reported z position after each return. |
| Dungeon cleanup | Re-entry with the same solo Character produced a new dungeon room ID; existing instance lookup replaces the cached room only when the previous room is no longer local. Server disposal logs still need confirmation after deployment. |
| Recovery configuration | WorldRoom remained `reconnection.enabled: true`; the newly entered dungeon also started with recovery enabled. Actual network-loss recovery was not exercised. |
| Loading | Cleared successfully in both controlled cycles. No global guarantee against unrelated stalled asset/network requests is claimed. |

No repository tests or Meteor build were run. Relevant syntax/import and whitespace checks were used. The controlled browser check does not replace verification of the deployed source change.

## Temporary diagnostics and Render follow-up

Filter browser console and Render server logs by `[dungeon-exit]`. Logs include ISO timestamps, per-trace elapsed milliseconds and room/session IDs, never auth/reconnect tokens. Compare elapsed times within one process; correlate different clocks by IDs and stage order.

Client stages cover request, portal acceptance, leave start/completion, world-return state receipt, WorldRoom resume, world scene/assets/binding/chunks/enemies, loading clear and first rendered frame. Server stages cover onLeave, world state return, shared cleanup, lastPlayedAt write, cleanup completion, socket close and disposal. Drop/reconnect/leave codes are recorded during an exit.

After deploying, specifically verify:

1. Stay in a dungeon more than five seconds, manually leave, and confirm no retired-room reconnect attempts. Compare client leave timing with server cleanup and close codes.
2. Complete a dungeon normally, claim its existing reward, use the real exit portal, and confirm prompt return with unchanged completion/reward behavior.
3. Confirm valid entrance terrain position, health, movement and the same WorldRoom session; confirm loading clears and the first world frame renders. Repeat in a second region/quality setting if scene loading remains slow.
4. Confirm an empty dungeon logs disposal and re-entry creates a new instance. In a party, verify one player leaving does not dispose the instance used by remaining players.
5. Interrupt network access separately in the world and during a dungeon visit, **without requesting exit**, and compare recovery with existing behavior. Recovery was not removed by this fix; the pre-existing server reconnection behavior has not been expanded.
6. If a return remains slow, use the last completed timing marker to distinguish server database cleanup, transport close, world state delivery and scene/asset loading before changing further behavior.

Remove the temporary trace hooks/helper after production confirmation; retain the scoped intentional-leave fix.
