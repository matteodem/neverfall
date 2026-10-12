import { Meteor } from "meteor/meteor";
import { GameSessions } from "../../imports/api/analytics/gameSessions";
import { withCharacterSlots } from "../characterSlots";

export const SESSION_HEARTBEAT_MS = 60 * 1000;
const sessions = new Map();

export const startGameSession = (userId, connectionId) => withCharacterSlots([userId], async () => {
  const now = new Date();
  let session = sessions.get(userId);
  if (session?.expiry) {
    Meteor.clearTimeout(session.expiry);
    session.expiry = null;
  }
  if (!session) {
    const id = await GameSessions.insertAsync({ userId, startedAt: now, lastSeenAt: now });
    session = { id, connections: new Set(), expiry: null };
    sessions.set(userId, session);
  } else {
    await GameSessions.updateAsync(session.id, { $set: { lastSeenAt: now }, $unset: { endedAt: 1 } });
  }
  session.connections.add(connectionId);
});

export const endGameSession = (userId, connectionId) => withCharacterSlots([userId], async () => {
  const session = sessions.get(userId);
  if (!session || !session.connections.delete(connectionId) || session.connections.size) return;
  const now = new Date();
  // Keep the entry briefly so a reload/reconnect resumes this same session.
  // Persist the actual departure time immediately, even if the process then exits.
  session.expiry = Meteor.setTimeout(() => {
    if (sessions.get(userId) === session && !session.connections.size) sessions.delete(userId);
  }, SESSION_HEARTBEAT_MS);
  await GameSessions.updateAsync(session.id, { $set: { lastSeenAt: now, endedAt: now } });
});

export const initializeGameSessions = () => {
  Meteor.setInterval(() => {
    for (const [userId, session] of sessions) {
      if (!session.connections.size) continue;
      void withCharacterSlots([userId], async () => {
        if (sessions.get(userId) !== session || !session.connections.size) return;
        await GameSessions.updateAsync(session.id, { $set: { lastSeenAt: new Date() } });
      }).catch((error) => console.error("[Analytics] Could not update session activity", error));
    }
  }, SESSION_HEARTBEAT_MS);
};
