// Add Meteor user IDs here. While signed in, run Meteor.userId() in the
// browser console to find your ID. This file is imported only by server code.
export const ANALYTICS_ADMIN_USER_IDS = [
  'EMwmKnv99tXnahgJQ',
  'RXs5WWQMQRWvxLon6',
];

export const isAnalyticsAdmin = (userId) => Boolean(userId) && ANALYTICS_ADMIN_USER_IDS.includes(userId);
