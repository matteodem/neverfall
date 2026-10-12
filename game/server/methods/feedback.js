import { Meteor } from "meteor/meteor";
import { Feedback } from "../../imports/api/feedback/feedback";

const RATINGS = ["good", "okay", "needs_improvement"];
const WINDOW_MS = 60 * 60 * 1000;
const MAX_SUBMISSIONS = 5;
const submissions = new Map();

Meteor.methods({
  async "feedback.submit"(message, rating = null) {
    if (typeof message !== "string" || !message.trim() || message.trim().length > 2000) {
      throw new Meteor.Error("invalid-feedback", "Enter feedback between 1 and 2,000 characters.");
    }
    if (rating !== null && !RATINGS.includes(rating)) {
      throw new Meteor.Error("invalid-rating", "Choose a valid rating or leave it unselected.");
    }

    // Count before awaiting the save so concurrent calls cannot bypass the limit.
    // Guest accounts use their user ID; anonymous visitors use their connection.
    const keys = [
      this.userId && `user:${this.userId}`,
      this.connection?.id && `connection:${this.connection.id}`,
    ].filter(Boolean);
    const now = Date.now();
    for (const key of keys) {
      const bucket = submissions.get(key);
      if (bucket && bucket.expiresAt > now && bucket.count >= MAX_SUBMISSIONS) {
        throw new Meteor.Error("feedback-rate-limit", "You've sent several messages. Please try again in an hour.");
      }
    }
    for (const key of keys) {
      let bucket = submissions.get(key);
      if (!bucket || bucket.expiresAt <= now) {
        bucket = { count: 0, expiresAt: now + WINDOW_MS };
        submissions.set(key, bucket);
        Meteor.setTimeout(() => {
          if (submissions.get(key) === bucket) submissions.delete(key);
        }, WINDOW_MS);
      }
      bucket.count++;
    }

    await Feedback.insertAsync({
      message: message.trim(), rating, createdAt: new Date(), userId: this.userId || null,
    });
    return true;
  },
});
