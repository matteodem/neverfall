# Feature Specification: Minimal Admin Analytics

## Goal
Implement a **small, admin-only analytics modal** for Heroes of Neverfall, using the existing React, DaisyUI, Meteor.js, MongoDB, and Colyseus architecture.

**Do not add routing, a separate dashboard, a third-party analytics service, or new UI dependencies.** Inspect the existing codebase and follow its patterns. Keep the solution MVP-sized.

## User Experience

- Pressing **Ctrl + Shift + A** opens the **Admin Analytics** modal.
- On macOS, support **Cmd + Shift + A** as well if feasible.
- Handle the shortcut with a single properly cleaned-up `keydown` listener; prevent the browser default only when opening the modal.
- Ignore shortcut presses while typing in an input, textarea, select, or contenteditable element, and ignore key auto-repeat.
- Only allow authorized admins to view analytics. For non-admins, the shortcut must do nothing (or show no analytics UI). Do not leak analytics data through the client.
- Use the existing DaisyUI modal approach with a backdrop; close with Escape, the close button, or backdrop click, consistent with existing modal behavior.
- Load data when the modal opens. Display loading, error, and empty states. No real-time refresh required.
- Show four metrics in a responsive 2-column grid:
  1. **Unique Players** (all-time distinct user IDs with a recorded game session)
  2. **Daily Active Players** (distinct user IDs with game activity **today, UTC**)
  3. **Sessions** (number of game sessions recorded **all-time**)
  4. **Average Session Duration** (mean duration of completed or timed-out sessions, rounded to minutes)
- Clearly label the time windows in the UI. No charts required.

## Configurable Admin Access (Important)

Provide a clearly documented, easy-to-edit **server-side allowlist** of Meteor user IDs, for example:

```js
// imports/server/config/adminAnalytics.js (adjust path to existing conventions)
export const ANALYTICS_ADMIN_USER_IDS = [
  'REPLACE_WITH_MY_METEOR_USER_ID',
];

export function isAnalyticsAdmin(userId) {
  return Boolean(userId) && ANALYTICS_ADMIN_USER_IDS.includes(userId);
}
```

- The developer must be able to change authorized `Meteor.userId()` values **directly in code**, without adding accounts/roles packages or a new admin management UI.
- **Do not use `Meteor.userId()` inside server code outside a Meteor method context**; in a Meteor method, use `this.userId` (or the framework's current secure equivalent). In React client code, `Meteor.userId()` can be used for authentication state.
- Enforce the allowlist **server-side** in the analytics Meteor method. Deny unauthenticated and unauthorized requests with a generic `Meteor.Error('not-authorized')` (or established project error convention).
- Never trust a user ID supplied by a client method argument; derive the user ID from the authenticated server method context.
- Optionally use an admin-eligibility method for the shortcut, but keep the implementation simple and ensure that **all analytics data access is protected server-side**. Never rely solely on hiding the modal in the UI.
- Add a short comment showing how to find the developer's own Meteor user ID, e.g. running `Meteor.userId()` in the browser console **while signed in**, where available.

## Session Data Model

Use a `GameSessions` MongoDB collection (or reuse equivalent existing records if the project already has them):

```js
{
  _id: 'mongo-id',
  userId: 'meteor-user-id',
  startedAt: Date,
  lastSeenAt: Date,
  endedAt: Date // optional until the session ends
}
```

- Create a session when a successfully authenticated player joins the game world (not merely when the site loads).
- End the session when the player disconnects/leaves the game, and update `lastSeenAt` at a **low frequency**, e.g. once every 60 seconds, for active sessions.
- Account for disconnects and crashes: report session duration using `endedAt` when available, otherwise `lastSeenAt`; do not let abandoned sessions grow forever.
- **Avoid duplicate sessions on room changes** (e.g., world ↔ dungeon) and reconnects where possible. Inspect existing Colyseus lifecycle/auth mechanisms first and choose the smallest reliable solution. Do not create a new session for every movement or action.
- Use the server's authenticated Meteor user ID, **not** a client-provided user ID or Colyseus session ID, as the identity key.
- Keep tracking minimal; do not log IP addresses, user agents, chat text, or player movement.
- If full cross-room session lifecycle handling would be disproportionately complex, document the limitation, implement a conservative minimal approach, and avoid claiming that the metrics are more exact than they are.

## Meteor Method

Implement a server-only method such as `analytics.getSummary` that:

1. Checks the **authenticated caller** against the configured admin ID allowlist.
2. Aggregates the four summary metrics from MongoDB.
3. Returns a small JSON-serializable result, e.g.:

```js
{
  uniquePlayers: 42,
  dailyActivePlayers: 12,
  totalSessions: 86,
  averageSessionMinutes: 18,
  dayTimezone: 'UTC'
}
```

For DAU, count users with session activity that intersects the current UTC day (not only sessions started today). For average duration, use available finalized/last-seen timestamps and exclude invalid negative durations.

## React UI

- Create a small component such as `AdminAnalyticsModal.jsx` following existing project component conventions.
- Reuse the existing state-management/modal patterns when present.
- Make the shortcut listener safe: mount once, clean up on unmount, don't interfere with gameplay text input, and avoid duplicate listeners.
- If needed, implement a tiny admin eligibility check, but do not expose the full metrics to the client until the protected method approves the request.
- Never register an extra app route. No changes to the normal player HUD beyond what is needed for the shortcut/modal.

## Acceptance Criteria

- [ ] Ctrl + Shift + A opens the analytics modal for a configured admin.
- [ ] Non-admin and signed-out users cannot retrieve analytics by calling Meteor methods directly.
- [ ] Admin IDs can be edited in **one clearly identified source file**.
- [ ] No router, external analytics service, or new dashboard is introduced.
- [ ] Four metrics render, including loading/empty/error states.
- [ ] Modal closes via close button, Escape, and backdrop.
- [ ] Real game joins are counted; site visits alone aren't.
- [ ] Disconnect/crash behavior and room transitions are handled reasonably for an MVP.
- [ ] No unnecessary personal data is collected.
- [ ] Relevant project checks/tests pass, or any failures are reported.

## Instructions for Codex

1. Read `AGENTS.md` and this file.
2. Inspect the current Meteor/Colyseus auth flow, room lifecycle, MongoDB collections, and React/DaisyUI modal conventions before editing.
3. Implement the smallest working version that matches existing architecture. Prefer reusing existing tracking if available.
4. Keep modifications focused. Do not refactor unrelated code.
5. Run relevant checks, and report exact files changed, the admin allowlist file path, how to set the Meteor user ID, and any known session-counting limitations.
