# Register / Login / Logout + Guest Character Transfer

## Goal

Implement a proper account flow on the **Character Overview** screen.

Guest players should be able to:

- click **Login** in the bottom-left
- switch between **Login** and **Register** in a modal
- authenticate through the existing Meteor Accounts setup
- after successful Login or Register, choose whether to transfer all characters from the previous guest account to the authenticated account

Authenticated non-guest players should instead see **Logout** in the same location.

Use JavaScript only. Keep the implementation DRY, secure, server-authoritative, and MVP-sized.

---

## 1. Inspect Existing Architecture First

Before changing anything:

1. Read `AGENTS.md`.
2. Inspect the current Character Overview implementation.
3. Inspect the existing Meteor Accounts setup.
4. Inspect how guest accounts are created and identified.
5. Inspect the `Characters` collection and its ownership field.
6. Inspect `Meteor.userId()` usage for character ownership.
7. Inspect `user.profile.currentCharacterId`.
8. Inspect existing DaisyUI/modal components.
9. Inspect current client auth / character-selection state.
10. Inspect any existing login/logout helpers.

Do not build a second auth system. Reuse Meteor Accounts and the current Neverfall architecture.

---

## 2. Character Overview Auth Button

Add an auth button in the **bottom-left** of Character Overview.

Behavior:

```text
guest account
→ Login

authenticated non-guest account
→ Logout
```

Do not show both at once.

Reuse the real existing guest-account detection logic from the repository. Do not invent a duplicate guest flag if one already exists.

---

## 3. Login / Register Modal

When a guest clicks **Login**, open a modal with two modes:

```text
[ Login ] [ Register ]
```

Reuse the existing DaisyUI modal pattern if available.

### Login

Use the identity format already supported by the repository, for example:

```text
username or email
password
```

Requirements:

- validate required fields
- disable duplicate submits while pending
- use Meteor Accounts APIs
- show concise errors
- never store or log passwords

### Register

Use the minimum fields required by the current Meteor Accounts setup.

If compatible, use:

```text
username
email
password
confirm password
```

Validate required fields and password confirmation.

Do not add OAuth, password reset, email verification, or account settings in this task.

---

## 4. Preserve Guest Transfer Context

This is critical.

Before Login/Register changes `Meteor.userId()`, preserve enough secure context to identify the previous guest account for a later character transfer.

Conceptually:

```text
guestUserId
guest-owned characters
```

However, **do not trust arbitrary client-provided IDs**.

The server must verify:

- the source really was the guest account associated with this auth transition
- the source account is a guest account
- the characters really belong to that guest account
- the destination is the currently authenticated non-guest account

Prefer a short-lived server-issued transfer token or an equivalent secure temporary mechanism if necessary.

Do not expose a generic method that allows moving arbitrary characters between arbitrary users.

---

## 5. Post-Auth Character Transfer Modal

After a guest successfully:

```text
logs into an existing account
OR
registers a new account
```

show another modal if the previous guest account owns at least one character.

Suggested text:

```text
Do you want to transfer your guest characters to this account?
```

Actions:

```text
Transfer Characters
Keep Separate
```

The modal should only appear when:

- the previous session was a guest account
- guest characters exist
- the user is now authenticated as a non-guest account

If the user chooses **Keep Separate**, do not transfer anything.

---

## 6. Server-Authoritative Character Transfer

Implement or reuse a Meteor method for the transfer.

For MVP, transfer **all characters** owned by the previous guest account.

The server must derive and validate the source and destination safely.

Do not trust client-provided:

```text
arbitrary source user IDs
arbitrary destination user IDs
arbitrary character IDs
```

Update only the existing ownership field used by the Character schema.

Do not duplicate characters.

Preserve all existing Character data, including:

```text
name
species
class
level
XP
appearance
inventory
equipment
gold
quests
achievements
waypoints
spawn points
Adventure Guide progress
mounts
other persistent progression
```

The destination account's existing characters must remain intact.

---

## 7. Idempotency and Safety

The transfer must be safe against repeated clicks or retries.

A repeated request must not:

```text
duplicate characters
re-award anything
move unrelated characters
corrupt ownership
```

If all eligible characters were already transferred, return a safe result.

Do not automatically delete the old guest Meteor user in this task.

---

## 8. currentCharacterId

Inspect both the previous guest account and destination account's:

```text
profile.currentCharacterId
```

After transfer:

- do not leave an invalid reference
- preserve a valid existing destination selection where reasonable
- otherwise select a sensible transferred character or clear selection according to current app behavior

Do not overwrite a valid destination selection unnecessarily.

Document the chosen behavior in Codex's final response.

---

## 9. Character Slot Limits

Inspect whether Neverfall already has a maximum character count.

If a limit exists:

- respect it
- do not silently exceed it
- do not delete destination characters
- show a clear transfer error if the transfer cannot proceed

Do not invent a new slot limit.

---

## 10. Logout Flow

For authenticated non-guest users, the bottom-left button should be:

```text
Logout
```

Clicking it opens a confirmation modal:

```text
Do you really want to logout?
```

Actions:

```text
Logout
Cancel
```

### Cancel

Close the modal and change nothing.

### Confirm

Use Meteor's normal logout flow.

Preserve persistent account and character data.

If Neverfall already creates a new guest account after logout, reuse that existing behavior.

Do not invent a separate logged-out screen unless one already exists.

If `profile.isPlaying` or selected-character state needs cleanup before logout, reuse the existing server-authoritative pattern.

---

## 11. Character Overview Refresh

After:

```text
login
register
transfer
logout
```

Character Overview must reflect the currently authenticated account.

Prefer existing Meteor reactivity over manual full-page reloads.

---

## 12. UI State and Errors

Use existing modal/state patterns.

Possible components:

```text
AuthModal
TransferGuestCharactersModal
LogoutConfirmModal
```

Keep local state local unless the existing architecture already centralizes modal state in Zustand.

Handle at minimum:

```text
wrong password
unknown account
duplicate username
duplicate email
invalid registration input
network failure
transfer failure
character-slot limit if one exists
```

Do not expose raw stack traces in the UI.

---

## 13. Acceptance Criteria

The task is complete when:

- guest users see `Login` bottom-left on Character Overview
- non-guest authenticated users see `Logout`
- Login opens a Login/Register modal
- Login works through Meteor Accounts
- Register works through Meteor Accounts
- errors are shown clearly
- after guest → authenticated Login/Register, a transfer modal appears when guest characters exist
- user can transfer all guest characters
- user can choose not to transfer
- transfer is server-authoritative
- destination account's existing characters are preserved
- transferred characters preserve all progression and inventory data
- transfer is idempotent
- logout opens a confirmation modal
- logout can be cancelled
- confirmed logout uses Meteor's existing logout flow
- Character Overview updates correctly after auth changes
- no passwords are persisted outside Meteor Accounts
- unrelated gameplay systems remain unchanged

---

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect Character Overview, Meteor Accounts, guest-account creation, Character ownership, `currentCharacterId`, modal patterns, and auth state before coding.
3. Reuse the real guest-account detection logic.
4. Add `Login` bottom-left for guests and `Logout` in the same place for non-guests.
5. Implement a Login/Register modal using the existing DaisyUI/modal pattern.
6. Use Meteor Accounts APIs only for password auth.
7. Never persist or log passwords.
8. Preserve secure guest-transfer context before the auth identity changes.
9. After guest Login/Register succeeds, show a transfer modal if the previous guest account has characters.
10. Implement the transfer server-side and make it impossible to move arbitrary users' characters.
11. Transfer existing Character documents by changing their real ownership field; do not duplicate them.
12. Preserve destination characters and all transferred character progression.
13. Respect any existing character-slot limit.
14. Make transfer idempotent.
15. Do not delete the old guest account in this task.
16. Handle `profile.currentCharacterId` safely and document the chosen rule.
17. Implement Logout confirmation with `Do you really want to logout?`, plus confirm/cancel.
18. Reuse Meteor logout and existing post-logout guest bootstrap behavior.
19. Do not add OAuth, password reset, email verification, account deletion, or unrelated account features.
20. Use JavaScript only.
21. Keep the implementation DRY and MVP-sized.
22. Do not rewrite unrelated combat, world, inventory, quest, or multiplayer systems.
23. Run relevant checks.
24. Test:
    - guest → register → transfer
    - guest → register → keep separate
    - guest → existing-account login → transfer
    - guest → existing-account login → keep separate
    - destination account already has characters
    - invalid login
    - duplicate registration
    - logout cancel
    - logout confirm
25. Verify transferred characters retain level, XP, inventory, equipment, gold, quests, achievements, appearance, waypoints, spawn points, mounts, and Adventure Guide progress.
26. In the final response, list every changed file with its exact path.
27. Also report:
    - how guest accounts are detected
    - which Meteor Accounts APIs are used
    - transfer Meteor method name
    - how transfer authorization is secured
    - how `currentCharacterId` is handled
    - whether a character-slot limit exists
    - any schema/migration changes
