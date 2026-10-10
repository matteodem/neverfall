# NPC Quest Ownership and Level Gating

## Goal

Make NPCs the single source for normal quest acquisition in Neverfall and add configurable level requirements that determine when quests become available.

This should replace any remaining default/automatic quest assignment while preserving existing quest progress and the current quest system architecture.

## Core Rules

- All normal quests must be offered through NPCs in the world.
- Quest definitions remain centralized and reusable.
- NPCs reference quest IDs instead of duplicating full quest definitions.
- Quests may define a configurable minimum level using `requiredLevel`.
- The server must validate both NPC ownership and level requirements before a quest can be accepted.
- Existing characters must keep already-active/completed quest progress.

## Quest Definition Changes

Extend the existing quest definition shape with an optional minimum level.

Example:

```js
{
  id: "highlands-introduction",
  title: "Into the Highlands",
  description: "Travel into the Highlands and speak with the lookout.",

  requiredLevel: 5,

  objectives: [
    {
      type: "interactNpc",
      targetId: "highlands-lookout",
      required: 1,
    },
  ],

  rewards: {
    xp: 250,
    gold: 2,
  },
}
```

Rules:

```text
requiredLevel missing/null -> available at any level
requiredLevel: 1         -> available from level 1
requiredLevel: 5         -> available from level 5
```

Use the existing character level field as the source of truth.

Do not duplicate level requirements inside NPC definitions.

## NPC Quest Configuration

NPCs should reference the quests they offer.

Example:

```js
{
  id: "forest-guard-01",
  name: "Forest Guard",

  offeredQuestIds: [
    "forest-boars",
    "forest-mini-boss",
  ],
}
```

Another example:

```js
{
  id: "highlands-guide",
  name: "Highlands Guide",

  offeredQuestIds: [
    "highlands-introduction",
  ],
}
```

The NPC should not contain full quest definitions.

## Remove Default Quest Assignment

Find and remove any logic that automatically grants/defaults quests when:

- A character is created
- A player joins the world
- A player logs in
- Quest state is initialized

New characters should start without active quests unless a special system quest explicitly requires different behavior.

Do not remove or reset quests already persisted on existing characters.

## Server-Side Quest Acceptance Validation

Quest acceptance must be server validated.

Before accepting a quest, validate:

1. The quest exists.
2. The quest is not already active.
3. The quest has not already been rewarded/completed if it is non-repeatable.
4. The player is currently interacting with the correct NPC.
5. That NPC's `offeredQuestIds` contains the requested quest ID.
6. The player's current level satisfies the quest's `requiredLevel`.

Example logic:

```js
if (character.currentLevel < quest.requiredLevel) {
  throw new Meteor.Error(
    "quest-level-too-low",
    `Requires level ${quest.requiredLevel}`
  );
}
```

Adapt error handling to the existing project conventions.

Never trust the client to decide whether a quest is available.

## Quest Availability

The quest system should expose one reusable availability check.

Conceptually:

```js
canAcceptQuest({
  character,
  quest,
  npc,
})
```

It should account for:

- Player level
- Existing active quest state
- Completed/rewarded state
- NPC ownership
- Any existing quest validation already implemented

Avoid duplicating these checks across NPC UI, quest markers, and server methods.

## NPC Dialogue / Quest UI

When interacting with an NPC:

### Quest available

If:

```text
player level >= requiredLevel
AND quest is not active/completed
```

show the quest normally.

### Level too low

If the NPC offers the quest but the player does not meet the level requirement:

Do not allow the quest to be accepted.

For the MVP, either:

- Hide the quest entirely

or preferably:

```text
Into the Highlands
Requires Level 5
```

Display it as locked/disabled.

Keep the implementation simple.

### Already active

Show existing progress/state through the current quest UI.

### Ready to turn in

Allow the existing completion/reward flow.

## Quest Markers

Update the quest marker logic so level requirements are respected.

### `!`

Show `!` above an NPC and on the minimap/world map only if the NPC has at least one quest that the player can currently accept.

This means:

```text
offered by NPC
+
level requirement satisfied
+
not active
+
not already completed/rewarded
```

A level 3 player should NOT see a `!` for a quest requiring level 5.

### `?`

Keep the current `?` behavior for relevant active or ready-to-turn-in quests.

Level gating should not affect an already accepted quest.

## Highlands Example

Use level gating for region progression.

Example:

```js
{
  id: "highlands-introduction",
  requiredLevel: 5,
}
```

At level 4:

```text
Highlands Guide
Into the Highlands
Requires Level 5
```

No `!` quest marker should be visible.

At level 5:

```text
The quest becomes available.
The NPC receives a `!`.
The minimap/world map also show the `!`.
```

Do not hardcode Highlands-specific level logic into the quest engine.

`requiredLevel` must work for any quest.

## Migration of Existing Quests

Audit all current quest definitions and determine how they are currently acquired.

For every normal quest:

1. Keep the quest in the central quest catalog.
2. Select an appropriate existing NPC.
3. Add the quest ID to that NPC's `offeredQuestIds`.
4. Remove automatic/default assignment for that quest.
5. Add an appropriate `requiredLevel` where needed.

Prefer distributing quests logically between NPCs instead of placing every quest on one NPC.

Example direction:

```text
Forest Guard
- Boar Problem
- Forest mini-boss quest

Mage NPC
- Magic/location-related quests

Highlands NPC
- Highlands quests
- requiredLevel: 5+

Merchant/civilian
- Simple world interaction quests
```

Use the actual existing NPC and quest IDs from the project.

## Backward Compatibility

Do not delete or modify existing player progress unnecessarily.

Existing characters may already contain:

- Active quests
- Objective progress
- Completed quests
- Rewarded quests

These should continue to work even if their quest is now acquired through an NPC.

Only change how new quests are accepted.

If old quest data requires migration, keep it minimal and document exactly what was changed.

## Architecture Requirements

Keep responsibilities separated:

```text
Quest definitions
    ↓
requiredLevel + quest metadata

NPC definitions
    ↓
offeredQuestIds

Quest availability service
    ↓
canAcceptQuest(...)

Server validation
    ↓
accept / complete / reward

UI + quest markers
    ↓
consume availability state
```

Requirements:

- One central source of truth for quest definitions.
- One central source of truth for NPC quest ownership.
- One reusable quest availability check.
- No quest-specific level checks scattered throughout the UI.
- No duplicated quest definitions inside NPC data.
- Keep implementation MVP-sized.
- Avoid unrelated refactors.

## Acceptance Criteria

The feature is complete when:

- New characters no longer receive normal quests automatically.
- Every existing normal quest is assigned to an NPC.
- Interacting with an NPC displays only quests that NPC offers.
- The server rejects accepting a quest from the wrong NPC.
- The server rejects quests below the required level.
- `requiredLevel` is configurable per quest.
- Quests without `requiredLevel` continue to work.
- Level-locked quests cannot be accepted.
- Quest markers respect level requirements.
- A quest becomes available immediately after reaching its required level.
- Existing active/completed quest progress is preserved.
- Existing quest completion and reward logic still works.
- Multiple NPCs can independently offer different quests.
- Adding a future quest mainly requires:
  - adding the quest definition,
  - setting `requiredLevel` if needed,
  - adding its ID to an NPC.

## Implementation Process

Before implementation:

- Read `AGENTS.md`.
- Inspect the completed Basic Quest System.
- Inspect the NPC configuration/definitions.
- Inspect existing quest marker logic.
- Find all current automatic/default quest assignment paths.
- Inspect the current character level field and level-up flow.
- Follow existing Meteor, Colyseus, React, Zustand, and project conventions.
- Mention the exact file path for every created or modified file.

After implementation:

- Test a level 1 quest that is available immediately.
- Test a level-gated quest such as `requiredLevel: 5`.
- Verify a level 4 character cannot accept it.
- Verify the same character can accept it after reaching level 5.
- Verify `!` appears only when the quest becomes available.
- Verify acceptance from the wrong NPC fails.
- Verify existing active quest progress is not lost.
- Verify completed quests are not re-offered.
- Run relevant syntax, import, server-side, and focused browser checks.
- Report all quests migrated to NPCs and their configured `requiredLevel` values.
