import { Mongo } from "meteor/mongo";

export const ChatMessages = new Mongo.Collection("chatMessages");
export const CHAT_RETENTION_MS = 12 * 60 * 60 * 1000;
