# Guilds Light MVP

## Goal

Add a lightweight Guild system suitable for the current stage of Neverfall.

Keep it simple, social, and MVP-sized.

Do **not** build a full MMO guild framework yet.

Use JavaScript only.

## MVP Features

Implement:

```text
Create Guild
Join Guild
Leave Guild
Guild Name
Guild Tag
Member List
Leader / Member roles
Invite Member
Kick Member
Guild Chat
```

That is the full MVP scope.

## 1. Guild Data

Create a simple persistent Guild model.

Each Guild should contain at minimum:

```text
id
name
tag
leaderCharacterId or leaderUserId
members
createdAt
```

Each member should have a role:

```text
leader
member
```

Do not add complex permission matrices yet.

## 2. Create Guild

Allow a player to create a Guild.

Requirements:

- player must not already be in a Guild
- Guild name is required
- Guild tag is required
- Guild name must be unique
- Guild tag must be unique
- creator becomes Guild Leader
- persist the Guild server-side
- persist Guild membership on the player / character using the existing data model patterns

Keep validation server-authoritative.

Suggested constraints:

```text
Guild Name: 3–24 characters
Guild Tag: 2–5 characters
```

Use the existing project validation style.

## 3. Join / Invite

Guild Leaders can invite players.

Preferred MVP flow:

```text
Leader selects / enters player
→ sends invite
→ invited player accepts or declines
→ on accept: player joins Guild
```

Reuse existing player / online-player selection patterns if available.

Do not build a searchable guild browser yet.

Do not add applications / approval queues.

## 4. Leave Guild

Members can leave their Guild.

Rules:

```text
Member
→ can leave immediately

Leader
→ cannot leave while still Leader
```

For MVP, if the Leader wants to leave:

```text
transfer leadership first
```

If leadership transfer is too large for the current architecture, the smaller fallback is:

```text
Leader can disband Guild
```

Prefer the simplest clean solution supported by the current code.

## 5. Kick Member

Guild Leader can remove normal members.

Rules:

- Leader cannot kick themselves
- normal members cannot kick anyone
- kicked player loses Guild membership immediately
- update Guild member list and player state server-side

## 6. Roles

Only two roles for MVP:

```text
Leader
Member
```

Leader permissions:

```text
invite
kick
disband
optional leadership transfer
```

Member permissions:

```text
view Guild
Guild Chat
leave Guild
```

Do not add officers / ranks / custom permissions yet.

## 7. Guild Chat

Add a simple Guild Chat channel.

Requirements:

- only Guild members receive Guild Chat
- messages are synchronized in real time
- reuse the existing chat system
- do not create a parallel chat framework
- identify Guild messages clearly in the existing chat UI

Example:

```text
[Guild] Bob: Hello
```

Do not persist long-term Guild Chat history for MVP unless the current chat architecture already supports it trivially.

## 8. Social UI

Add Guilds under the new / existing:

```text
Social
```

HUD menu.

Preferred tabs:

```text
Friends
Guild
```

If Friends is not implemented yet, it is acceptable for Social to contain only:

```text
Guild
```

for now.

Guild tab states:

### No Guild

Show:

```text
Create Guild
Join via Invite
```

### In Guild

Show:

```text
Guild Name
Guild Tag
Leader
Member List
Invite button (Leader only)
Kick action (Leader only)
Leave Guild
Guild Chat access
```

Keep the UI compact.

Reuse DaisyUI / existing modal / tabs components.

## 9. Persistence

Guilds and memberships must survive:

```text
reconnect
relogin
server restart
```

Use Meteor / MongoDB and existing server patterns.

Do not store Guild membership only in client state.

## 10. Multiplayer Sync

Guild membership changes should update correctly for online players.

Examples:

```text
invite accepted
→ member list updates

member leaves
→ member disappears

member kicked
→ member loses Guild state

Guild disbanded
→ all members lose Guild state
```

Reuse existing Meteor publication / method / reactive patterns where possible.

Do not add a separate realtime framework.

## 11. Disband Guild

Leader can disband the Guild.

Requirements:

- confirmation required
- remove Guild entity
- clear Guild membership for all members
- update online clients
- do not leave stale Guild IDs on characters / users

Keep it server-authoritative.

## 12. Out of Scope

Do **not** implement yet:

```text
Guild Bank
Guild Leveling
Guild XP
Guild Perks
Guild Hall
Guild Quests
Guild Wars
Rankings
Custom Roles
Complex Permissions
Guild Recruitment Browser
Applications
Alliance System
Shared Storage
Guild Achievements
```

These can come later.

## Acceptance Criteria

The MVP is complete when:

- player can create a Guild
- Guild name / tag are persisted
- creator becomes Leader
- Leader can invite players
- invited player can join
- members can leave
- Leader can kick members
- only Leader has admin actions
- Guild member list updates correctly
- Guild Chat works
- Guild Chat only reaches Guild members
- Guild survives reconnect / relogin
- Guild can be disbanded cleanly
- no stale Guild membership remains after leave / kick / disband
- UI is available under Social
- no large unrelated system is introduced

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect existing:
   - Meteor user / character persistence
   - chat system
   - Social / HUD menu structure
   - multiplayer player lookup
   - server methods / publications
3. Reuse existing architecture wherever possible.
4. Keep the Guild system server-authoritative.
5. Keep roles to:
   - Leader
   - Member
6. Reuse the existing chat system for Guild Chat.
7. Do not create complex permissions.
8. Do not add Guild Bank / leveling / perks / hall / wars.
9. Keep the implementation MVP-sized and DRY.
10. Use JavaScript only.
11. Do not add unnecessary dependencies.
12. Run relevant checks.
13. Test:
    - create Guild
    - invite / accept
    - leave
    - kick
    - Guild Chat
    - relogin persistence
    - disband
14. In the final response, list every changed file with its exact path.
15. Also summarize:
    - Guild data model
    - membership storage
    - invite flow
    - Guild Chat integration
    - disband behavior
