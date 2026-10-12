# Admin analytics

Edit `game/server/config/adminAnalytics.js` to add authorized Meteor user IDs.
While signed in, run `Meteor.userId()` in the browser console to find your ID.
The allowlist is server-only; both the eligibility and summary methods use the
authenticated caller. After changing it, let the server reload and reload the client.
Open analytics in game with Ctrl+Shift+E (Cmd+Shift+E on macOS).

Tracking starts with successful authenticated world joins, including guest accounts.
The world connection remains open in dungeons, so dungeon joins/leaves do not
create sessions. Concurrent connections for one user share a session. Reconnecting
within 60 seconds on the same server process resumes that session, including the
short gap. Longer absences and server restarts create a new session.

Activity timestamps update every 60 seconds while connected. Normal departure
stores the departure time; a crash leaves a session ending at its last heartbeat.
Unfinished sessions with no heartbeat for two minutes count as timed out for
average duration. Active sessions are excluded from the average. Duration after a
crash and activity around UTC midnight can be undercounted by about one heartbeat.
Daily active users include sessions crossing UTC midnight, using their recorded
activity interval. An average of zero means either no eligible durations or a mean
of less than half a minute.

Metrics cover records created since this feature was enabled, not historical play.
Connection merging is local to one server process, matching the current embedded
Colyseus deployment; multiple server processes would need shared session coordination.
No session records are published to clients and no additional personal data is stored.
