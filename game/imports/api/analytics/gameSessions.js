import { Mongo } from "meteor/mongo";

// Server-only consumers; session records are never published to clients.
export const GameSessions = new Mongo.Collection("gameSessions");
