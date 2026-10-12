import { Meteor } from "meteor/meteor";
import { GameSessions } from "../../imports/api/analytics/gameSessions";
import { isAnalyticsAdmin } from "../config/adminAnalytics";
import { SESSION_HEARTBEAT_MS } from "../analytics/gameSessions";

Meteor.methods({
  "analytics.isAdmin"() {
    return isAnalyticsAdmin(this.userId);
  },
  async "analytics.getSummary"() {
    if (!isAnalyticsAdmin(this.userId)) throw new Meteor.Error("not-authorized");
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const timedOutBefore = new Date(now.getTime() - 2 * SESSION_HEARTBEAT_MS);
    const [summary] = await GameSessions.rawCollection().aggregate([
      { $set: { activityEnd: { $ifNull: ["$endedAt", "$lastSeenAt"] } } },
      { $facet: {
        unique: [{ $group: { _id: "$userId" } }, { $count: "count" }],
        daily: [
          { $match: { startedAt: { $lte: now }, activityEnd: { $gte: today } } },
          { $group: { _id: "$userId" } }, { $count: "count" },
        ],
        total: [{ $count: "count" }],
        duration: [
          { $match: { $or: [{ endedAt: { $type: "date" } }, { lastSeenAt: { $lte: timedOutBefore } }] } },
          { $match: { startedAt: { $type: "date" }, activityEnd: { $type: "date" } } },
          { $project: { milliseconds: { $subtract: ["$activityEnd", "$startedAt"] } } },
          { $match: { milliseconds: { $gte: 0 } } },
          { $group: { _id: null, milliseconds: { $avg: "$milliseconds" } } },
        ],
      } },
    ]).toArray();
    return {
      uniquePlayers: summary.unique[0]?.count || 0,
      dailyActivePlayers: summary.daily[0]?.count || 0,
      totalSessions: summary.total[0]?.count || 0,
      averageSessionMinutes: Math.round((summary.duration[0]?.milliseconds || 0) / 60000),
      dayTimezone: "UTC",
    };
  },
});
