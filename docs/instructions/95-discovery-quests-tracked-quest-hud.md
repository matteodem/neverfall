# Regional Discovery Quests and Tracked Quest HUD

## Goal

Replace the Adventure Guide with normal quests and make the Quest system the single source of truth for PvE progression guidance.

Each major region should have a discovery/breadcrumb quest that leads the player to that region's quest giver, and the player should be able to track exactly one quest in the HUD.

## Core Direction

Use this progression model:

```text
Previous region NPC
    ↓
Discovery quest for next region
    ↓
Travel to region
    ↓
Speak with regional quest giver
    ↓
Discovery quest completes
    ↓
Regional quests become the player's next progression
```

Remove the Adventure Guide after this flow is implemented.

## Regional Discovery Quests

Add normal quests for region discovery.

Examples:

```text
Discover the Highlands
Discover the Snowy Mountains
Discover Southwest Lake
```

Use actual region names from the project.

Each discovery quest should be a normal quest in the existing Quest system.

### Example

```js
{
  id: "discover-highlands",
  title: "Discover the Highlands",
  requiredLevel: 5,

  description:
    "Travel to the Highlands and speak with the Highlands Scout.",

  objective: {
    type: "InteractNpc",
    target: "highlands-scout",
    amount: 1,
    label: "Speak with the Highlands Scout",
  },

  rewards: {
    xp: 250,
    gold: 1,
  },
}
```

Adapt IDs and rewards to the existing project.

## Discovery Quest Ownership

Discovery quests should normally be offered by an NPC in the previous progression area.

Suggested flow:

```text
Central Forest NPC
→ Discover the Highlands

Highlands NPC
→ Discover the Snowy Mountains

Snowy Mountains NPC
→ Discover Southwest Lake
```

Do not auto-grant region discovery quests unless the current architecture requires it.

Use existing NPC `offeredQuestIds`.

## Discovery Quest Completion

A discovery quest completes when the player interacts with the regional quest giver named by the objective.

Example:

```text
Discover the Highlands
→ Speak with Highlands Scout
→ Quest becomes ready to turn in / completed according to existing quest rules
```

If `turnInRequired` is true, keep the existing standard quest lifecycle.

Do not create a separate region-unlock system if the existing level and quest systems already cover progression.

## Remove Adventure Guide

Remove the Adventure Guide as a production UI/progression system.

This includes, where applicable:

- Adventure Guide HUD element
- Adventure Guide progression state
- Adventure Guide region recommendations
- Adventure Guide buttons/actions
- Adventure Guide-specific selectors/helpers
- Adventure Guide-specific persistence

Do not remove shared region, quest, waypoint, or NPC data.

After this change:

```text
World Event HUD
+
Tracked Quest HUD
```

should replace:

```text
World Event HUD
+
Adventure Guide
```

## Tracked Quest

Allow the player to track exactly one active quest.

Use a single field such as:

```js
trackedQuestId: "forest-boars"
```

Do NOT store:

```js
isTracked: true
```

on multiple quests.

There must only be one tracked quest at a time.

## Default Tracking Behavior

When a quest is accepted:

```text
newly accepted quest
→ automatically becomes tracked
```

This means the most recently accepted quest is shown in the HUD by default.

If the player manually tracks another quest later, that quest replaces the previous tracked quest.

## Hero Panel → Quests

Add a simple action for each active quest.

Preferred wording:

```text
Track Quest
```

If currently tracked:

```text
Tracked
```

Do not use the name `Focus Mode`.

The interaction should behave like a radio selection rather than independent checkboxes.

Example:

```text
Boar Problem
[Track Quest]

Discover the Highlands
[Tracked]
```

Only one quest can show `Tracked`.

## Tracked Quest HUD

Show the tracked quest in a compact HUD element directly below the existing World Event HUD element.

Example:

```text
Boar Problem
Defeat Boars: 3 / 5
```

Discovery quest example:

```text
Discover the Highlands
Speak with the Highlands Scout
```

Multi-step quest example:

```text
Frozen Disturbance
Activate frozen rift seal 2 / 3
```

Use existing quest state as the source of truth.

Do not duplicate quest progress.

## Completed / Ready-to-Turn-In State

If the tracked quest objectives are complete but rewards have not been claimed yet, keep the quest visible in the HUD.

Example:

```text
Boar Problem
✓ Finished
Return to Forest Guard
```

If the exact quest giver can be resolved:

```text
Return to Forest Guard
```

Otherwise use:

```text
Return to Quest-Giver
```

After the quest is rewarded/completed, clear `trackedQuestId` if it still points to that quest.

For the MVP, do not automatically select another active quest after turn-in.

## Quest HUD Behavior

The tracked quest HUD should:

- only appear when `trackedQuestId` points to an active or ready-to-turn-in quest,
- update immediately when progress changes,
- update when the player manually tracks another quest,
- remain compact,
- not block gameplay,
- not duplicate the Hero Panel quest list.

Do not show all active quests in the HUD.

## Persistence

Persist `trackedQuestId` on the character if that matches existing character-state patterns.

It should survive:

- reload
- reconnect
- character switching

Validate that the tracked quest still exists and belongs to the character.

If the saved ID is invalid, clear it safely.

## Quest Acceptance

When accepting a quest:

```text
accept quest
→ persist quest progress
→ set trackedQuestId to accepted quest
```

Do this through the existing quest acceptance flow.

Avoid creating separate client-only tracking behavior if persistence already exists.

## Quest Turn-In

When a tracked quest is rewarded:

```text
if trackedQuestId === rewardedQuestId
→ trackedQuestId = null
```

Do not automatically track another quest for now.

## Existing Quest Progress Popup

Keep the existing short quest progress popup behavior.

Example:

```text
Boar Problem: Killed 3 / 5
```

This popup is temporary feedback.

The tracked quest HUD is the persistent view of the selected quest.

These systems should not duplicate state.

## Quest Finished Toast

Keep the existing quest-completion toast behavior.

Example:

```text
Find the Forest Dungeon: Finished
Return to Wandering Mage to Earn Rewards
```

The tracked quest HUD should also update to the finished state.

## Quest Markers

Keep existing quest marker behavior:

```text
! = available quest
? = active / return / turn-in quest
```

Discovery quest NPCs should use the same system.

No special marker system is required.

## Level Gating

Discovery quests should use the existing `requiredLevel` system.

Example:

```js
{
  id: "discover-highlands",
  requiredLevel: 5,
}
```

The NPC should only offer the discovery quest when the level requirement is met.

Do not hardcode region progression into the HUD.

## Suggested Progression

Use existing region/NPC IDs where available.

Example direction:

### Central Forest

Regional NPC:

```text
Forest Guard
```

Offers:

```text
Central Forest quests
Discover the Highlands
```

### Highlands

Regional NPC:

```text
Highlands Scout
```

Completes:

```text
Discover the Highlands
```

Offers:

```text
Highlands quests
Discover the Snowy Mountains
```

### Snowy Mountains

Regional NPC:

```text
Mountain / Expedition NPC
```

Completes:

```text
Discover the Snowy Mountains
```

Offers:

```text
Snowy Mountains quests
Discover Southwest Lake
```

### Southwest Lake

Regional NPC:

```text
Lake Ranger / local NPC
```

Completes:

```text
Discover Southwest Lake
```

Offers:

```text
Southwest Lake quests
```

Use the actual existing NPCs where possible.

## Architecture Requirements

Keep responsibilities separated:

```text
Quest definitions
    ↓
discovery + normal quests

NPC definitions
    ↓
offeredQuestIds

Quest state
    ↓
active/completed/progress

trackedQuestId
    ↓
single selected quest

Hero Panel
    ↓
Track Quest action

HUD
    ↓
render selected quest only
```

Requirements:

- Reuse existing Quest system.
- Reuse existing NPC quest ownership.
- Reuse existing quest progress state.
- Do not create a second progression system.
- Do not duplicate quest progress in HUD state.
- Keep exactly one tracked quest.
- Avoid unrelated refactors.

## Not Required

Do not implement:

- Multiple simultaneously tracked quests
- Quest pinning groups
- Quest sorting
- Automatic next-quest selection
- GPS navigation arrows
- Quest routes
- Separate region unlock persistence
- New quest journal
- Adventure Guide replacement system outside normal quests

## Acceptance Criteria

The feature is complete when:

- Adventure Guide is removed from production UI.
- Each major region has a discovery quest where appropriate.
- Discovery quests lead to the next regional NPC.
- Discovery quest objectives use normal Quest system behavior.
- Level gating works through `requiredLevel`.
- Newly accepted quests automatically become tracked.
- Only one quest can be tracked at a time.
- Hero Panel → Quests exposes `Track Quest`.
- The tracked quest appears below the World Event HUD.
- Progress updates live in the tracked quest HUD.
- Ready-to-turn-in quests remain visible as `Finished`.
- The HUD shows the relevant quest giver when possible.
- Rewarding the tracked quest clears tracking.
- Existing quest progress and completion toasts continue to work.
- Existing `!` / `?` quest markers continue to work.
- No duplicate Adventure Guide progression state remains.

## Implementation Process

Before implementation:

- Read `AGENTS.md`.
- Inspect the current Adventure Guide implementation.
- Inspect the Quest system.
- Inspect Hero Panel → Quests.
- Inspect current NPC `offeredQuestIds`.
- Inspect quest markers.
- Inspect World Event HUD positioning.
- Inspect character persistence for suitable tracked-quest storage.
- Mention the exact file path for every created, modified, or removed file.

After implementation:

- Test accepting a normal quest.
- Verify it becomes tracked automatically.
- Track another quest manually.
- Verify only one quest is shown in the HUD.
- Test kill quest progress updates.
- Test discovery quest interaction completion.
- Test ready-to-turn-in state.
- Test quest reward clearing.
- Test reload/reconnect persistence.
- Test switching characters.
- Verify Adventure Guide no longer appears.
- Verify World Event HUD remains unchanged.
- Run relevant syntax, persistence, server-side, and focused browser checks.
