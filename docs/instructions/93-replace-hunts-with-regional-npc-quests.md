# Replace Hunts with Regional NPC Quests

## Goal

Remove the separate Hunt system and consolidate all PvE progression into the existing Quest system.

The Adventure Guide should be updated to guide players toward regional NPC quest givers instead of acting as a parallel Hunt/progression system.

Each major region should have at least one NPC that offers quests relevant to that area.

## Core Direction

Use one clear progression hierarchy:

```text
Adventure Guide
    ↓
points the player toward the correct region / NPC

Regional NPC
    ↓
offers quests for that area

Quest System
    ↓
tracks objectives, progress, completion, and rewards
```

Do not keep Hunts as a separate gameplay system.

If the word "Hunt" is useful for flavor later, it may exist only as a quest title/tag/category, not as separate persistence, UI, or progression logic.

## Remove the Hunt System

Audit the current Hunt implementation and remove it after equivalent quest content exists.

This includes, where applicable:

- Hunt definitions
- Hunt-specific persistence
- Hunt progress state
- Hunt-specific UI
- Hunt-specific HUD or Hero Panel sections
- Hunt-specific server methods
- Hunt-specific reward logic
- Hunt-specific event tracking
- Hunt-specific initialization/default assignment

Do not remove shared enemy kill/event logic if the Quest system already uses it.

Prefer migrating useful logic into the Quest system rather than duplicating or deleting functionality blindly.

## Migrate Existing Hunts into Quests

Every existing Hunt should be reviewed and converted into a normal quest where appropriate.

Example:

```text
Old Hunt:
Boar Hunt
Kill 5 boars
Reward: 100 XP

New Quest:
Boar Hunt
Defeat 5 boars near Central Camp.
Reward: 100 XP
Quest giver: Forest Guard
```

The quest title may still contain "Hunt" if desired.

The important change is that it uses the standard Quest system and is acquired from an NPC.

## Regional Quest Structure

Each major region should have at least one NPC quest giver.

Required regions:

- Central Forest
- Highlands
- Snowy Mountains
- Southwest Lake

Use existing NPCs where suitable. Add a simple regional NPC only when no appropriate NPC already exists.

Each NPC should offer quests related to the region where they are placed.

Do not put every quest on one global NPC.

## Suggested Regional NPCs

These names/roles are suggestions only. Prefer existing NPC definitions where possible.

### Central Forest

Suggested role:

```text
Forest Guard
```

Example quests:

- Defeat boars
- Defeat wolves
- Defeat the Forest Giant / regional mini-boss
- Speak to another local NPC
- Visit a nearby location

This should act as the first quest hub.

### Highlands

Suggested role:

```text
Highlands Scout
or
Highlands Guard
```

Example quests:

- Defeat Highlands enemies
- Reach / interact with the lookout
- Investigate a landmark
- Defeat a regional elite or boss

Use level requirements where appropriate, for example:

```js
requiredLevel: 5
```

### Snowy Mountains

Suggested role:

```text
Expedition Scout
or
Mountain Researcher
```

Example quests:

- Defeat snowy-region enemies
- Investigate the Frozen Rift
- Reach a mountain landmark
- Defeat the regional boss / elite

These quests should use configurable level gating rather than hardcoded region checks.

### Southwest Lake

Suggested role:

```text
Lake Ranger
Fisher
or
Local Scout
```

Example quests:

- Defeat lake-area enemies
- Explore / interact with lake locations
- Help with a local threat
- Defeat a regional elite or boss

## Quest Ownership

All normal regional quests should be owned/offered by NPCs through the existing NPC quest configuration.

Example:

```js
{
  id: "forest-guard-01",
  name: "Forest Guard",

  offeredQuestIds: [
    "boar-hunt",
    "wolf-hunt",
    "forest-giant-hunt",
  ],
}
```

Quest definitions remain centralized.

NPCs should reference quest IDs only.

Do not duplicate full quest definitions inside NPC data.

## Level Progression

Use the existing configurable `requiredLevel` property on quests.

Example:

```js
{
  id: "highlands-introduction",
  requiredLevel: 5,
}
```

Regional progression should be data-driven.

Example direction:

```text
Central Forest
Level 1+

Highlands
Level 5+

Snowy Mountains
Later progression level

Southwest Lake
Later progression level
```

Do not hardcode exact region unlock logic into the Adventure Guide or NPC renderer.

The quest definition remains the source of truth for level availability.

## Adventure Guide Revamp

The Adventure Guide should no longer duplicate Hunt or Quest tracking.

Its role should be:

> Tell the player where they should go next.

It should present regional progression and direct the player toward the appropriate NPC.

Example:

```text
Adventure Guide

Level 1–4
Central Forest

Help secure the forest around Central Camp.

Speak with:
Forest Guard


Level 5+
Highlands

Travel north into the Highlands and help the local scouts.

Speak with:
Highlands Scout


Later Adventures

Snowy Mountains
Southwest Lake
```

Adapt the presentation to the existing Adventure Guide UI.

## Adventure Guide Behavior

The guide may use:

- Current player level
- Region availability
- Relevant regional NPC
- Whether the player has already completed key regional quests

Keep the logic simple for the MVP.

It should NOT:

- Track individual kill counts
- Replace the Quest UI
- Contain a second copy of quest progress
- Grant quest rewards
- Automatically accept quests
- Become a second quest journal

The Hero Panel → Quests remains the source for actual quest progress.

## UI Responsibilities

Use these responsibilities:

### Main HUD

Keep:

- World Event
- Adventure Guide

Do not reintroduce:

- Hunt tracker
- Persistent quest tracker

### Hero Panel → Quests

Show:

- Active quests
- Objective progress
- Rewards
- Completion state

### NPC Dialogue

Used to:

- Discover quests
- Accept quests
- Review NPC-related quest state
- Turn in completed quests

### Minimap / World Map

Continue using existing quest markers:

```text
! = available quest
? = active / return / turn-in quest
```

Regional NPCs should therefore naturally appear as quest hubs on the map.

## Migration Strategy

Use a safe migration instead of deleting Hunt data first.

Recommended order:

1. Audit all existing Hunts.
2. Create equivalent Quest definitions.
3. Assign each migrated quest to the correct regional NPC.
4. Verify objective tracking and rewards through the Quest system.
5. Verify existing NPC quest markers.
6. Update the Adventure Guide.
7. Remove Hunt UI.
8. Remove Hunt persistence/server/domain code that is no longer used.
9. Remove obsolete Hunt initialization/default assignment.
10. Run a final search for Hunt-specific production references.

Do not leave two production systems active for the same objectives after migration.

## Existing Player Data

Avoid unnecessarily breaking existing characters.

If characters currently have active Hunt progress:

- Inspect whether it is practical to migrate that progress to the equivalent quest.
- If migration is simple and safe, preserve the progress.
- If the current project is still early enough that migration is unnecessary, document the decision clearly before removing old Hunt state.

Do not silently create duplicate rewards.

Completed Hunt rewards must not become claimable again through migrated quests unless explicitly intended.

## Quest Examples

A possible initial distribution:

### Central Forest — Forest Guard

```text
Boar Hunt
Defeat 5 boars.

Wolf Hunt
Defeat 5 wolves.

Forest Giant Hunt
Defeat the Forest Giant.
```

### Highlands — Highlands Scout

```text
Into the Highlands
Speak with the Highlands Scout / reach the region.

Secure the Highlands
Defeat local enemies.

The Lookout
Reach or interact with the Highlands lookout.
```

### Snowy Mountains — Expedition NPC

```text
Frozen Expedition
Explore the snowy region.

Frozen Rift
Investigate the Frozen Rift.

Mountain Threat
Defeat a snowy-region elite/boss.
```

### Southwest Lake — Lake NPC

```text
Trouble at the Lake
Investigate the lake area.

Lake Creatures
Defeat nearby enemies.

Southwest Threat
Defeat a local elite/boss.
```

Use actual existing enemy, boss, location, and NPC IDs from the project instead of inventing duplicates.

## Architecture Requirements

Keep concerns separated:

```text
Adventure Guide
    ↓
regional guidance only

NPC definitions
    ↓
offeredQuestIds

Quest definitions
    ↓
objectives + requiredLevel + rewards

Quest service
    ↓
progress + validation + persistence
```

Requirements:

- One Quest system for PvE objectives.
- No separate Hunt domain after migration.
- No duplicated quest state in the Adventure Guide.
- Quest definitions remain centralized.
- Regional NPC ownership remains configurable.
- Level requirements remain configurable per quest.
- Reuse existing NPC, Quest, minimap, world-map, XP, and gold systems.
- Avoid unrelated refactors.

## Acceptance Criteria

The migration is complete when:

- The old Hunt system is no longer used in production.
- Existing Hunt content has been converted into normal quests where appropriate.
- Every normal quest is acquired through an NPC.
- Central Forest has at least one quest-giver NPC.
- Highlands has at least one quest-giver NPC.
- Snowy Mountains has at least one quest-giver NPC.
- Southwest Lake has at least one quest-giver NPC.
- Each regional NPC offers quests relevant to its location.
- Level requirements control when later-region quests become available.
- The Adventure Guide points players toward appropriate regions/NPCs.
- The Adventure Guide does not track individual quest objectives.
- Hero Panel → Quests remains the main quest-progress UI.
- `!` / `?` quest markers continue to work on NPCs, minimap, and world map.
- Existing quest rewards and server validation remain correct.
- No Hunt reward can be duplicated through migration.
- Adding a new region later mainly requires:
  - a regional NPC,
  - quest definitions,
  - `requiredLevel` values,
  - NPC `offeredQuestIds`,
  - an Adventure Guide entry.

## Implementation Process

Before implementation:

- Read `AGENTS.md`.
- Inspect the complete current Hunt implementation.
- Inspect the current Quest system.
- Inspect regional NPC definitions.
- Inspect the Adventure Guide implementation.
- Inspect NPC quest ownership and level-gating logic.
- Inspect quest-marker logic.
- Search the repository for Hunt-specific state, methods, UI, and initialization.
- Follow existing Meteor, Colyseus, React, Zustand, Tailwind, DaisyUI, and project conventions.
- Mention the exact file path for every created, modified, or removed file.

After implementation:

- Verify each migrated Hunt works as a Quest.
- Verify each region has a working quest giver.
- Verify level-gated regional quests remain unavailable below their required level.
- Verify `!` appears when a regional quest becomes available.
- Verify `?` works for active/turn-in quests.
- Verify Adventure Guide guidance updates appropriately.
- Verify Hero Panel quest progress works.
- Verify Hunt UI/state no longer appears.
- Verify no duplicate XP/gold rewards are possible.
- Run relevant syntax, import, server-side, persistence, and focused browser checks.
- Report:
  - Hunts removed,
  - quests created/migrated,
  - regional NPC assignments,
  - required level values,
  - obsolete Hunt files/code removed,
  - any player-data migration concerns.
