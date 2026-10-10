# Basic Quest System

## Goal

Implement a small, reusable quest system for Neverfall that integrates with the existing NPC system, enemies, bosses, character progression, gold, and the existing Hero Panel.

The MVP should support simple quests with clear objectives and rewards without introducing complex quest chains or additional main-HUD clutter.

## Scope

### Required Quest Objective Types

Support these objective types:

- Kill enemies
- Defeat a boss
- Interact with an NPC
- Interact with a world location/object

### Required Rewards

Support:

- XP
- Gold

### Required Quest States

Each quest should support:

- `available`
- `active`
- `completed`
- `rewarded`

Adapt naming to existing project conventions if similar states already exist.

## Suggested Quest Shape

Use a configurable structure similar to:

```js
{
  id: "forest-boars",
  title: "Boar Problem",
  description: "The forest paths are becoming dangerous. Defeat 5 boars.",
  giverNpcId: "forest-guard-01",

  objectives: [
    {
      type: "killEnemy",
      targetId: "boar",
      required: 5,
    },
  ],

  rewards: {
    xp: 100,
    gold: 1,
  },
}
```

Boss quest example:

```js
{
  id: "forest-mini-boss",
  title: "A Greater Threat",
  giverNpcId: "forest-guard-01",

  objectives: [
    {
      type: "killBoss",
      targetId: "forest-ogre",
      required: 1,
    },
  ],

  rewards: {
    xp: 250,
    gold: 1,
  },
}
```

Interaction quest example:

```js
{
  id: "speak-with-mage",
  title: "A Strange Discovery",
  giverNpcId: "forest-guard-01",

  objectives: [
    {
      type: "interactNpc",
      targetId: "wandering-mage",
      required: 1,
    },
  ],

  rewards: {
    xp: 50,
    gold: 0,
  },
}
```

## Player Quest Data

Store only player-specific progress on the character/user.

Suggested shape:

```js
quests: {
  active: [
    {
      questId: "forest-boars",
      progress: {
        "0": 3,
      },
    },
  ],

  completed: [
    "forest-boars",
  ],
}
```

Do not duplicate full quest definitions into character records.

Use the existing project data model and persistence patterns.

## Quest Flow

The basic flow should be:

```text
NPC offers quest
    ↓
Player accepts quest
    ↓
Quest becomes active
    ↓
Gameplay events update objective progress
    ↓
Objectives complete
    ↓
Quest becomes ready to turn in
    ↓
Player talks to quest NPC
    ↓
XP + Gold awarded
    ↓
Quest marked completed/rewarded
```

## NPC Integration

Extend the existing NPC system so a quest NPC can:

- Offer an available quest
- Show active quest progress
- Allow quest completion / reward collection
- Display different simple dialogue depending on quest state

Example states:

```text
Available:
"Could you help us with the boars?"

Active:
"You have defeated 3 / 5 boars."

Ready:
"You did it. Thank you."

Completed:
"Thanks again for your help."
```

Keep dialogue simple and deterministic.

Do not implement branching conversations.

## Quest UI

Do not add a quest tracker to the main HUD.

The main HUD should remain focused on existing systems such as:

- World Event
- Adventure Guide

Quest information should live inside the existing Hero Panel under the `Quests` section/tab.

### Hero Panel → Quests

Add or extend the `Quests` section in the Hero Panel to display:

- Active quests
- Quest title
- Description
- Objective progress
- Rewards
- Completion status

Example:

```text
Boar Problem

The forest paths are becoming dangerous.

Objectives
✓ Defeat Boars: 5 / 5

Rewards
100 XP
1 Gold
```

For incomplete quests:

```text
Boar Problem

Objectives
Defeat Boars: 3 / 5
```

Completed quests may either appear in a separate subsection or be visually marked as completed, depending on the current Hero Panel structure.

Keep the UI minimal and consistent with existing React / Tailwind / DaisyUI patterns.

Do not add another persistent HUD element for quests.

### NPC Quest UI

When interacting with a quest NPC, show:

- Quest title
- Description
- Objectives
- Rewards
- Accept button
- Complete button when ready

Use the existing NPC dialogue/modal patterns instead of creating a separate large quest window if practical.

## Gameplay Event Integration

Quest progress should update from shared gameplay events instead of tightly coupling quest logic to every system.

At minimum, handle:

```text
enemy killed
boss killed
NPC interacted
location interacted
```

Prefer a reusable quest progress API such as:

```js
recordQuestEvent({
  type: "killEnemy",
  targetId: "boar",
})
```

Exact implementation should follow the current architecture.

Avoid duplicating quest-specific checks inside enemy, boss, and NPC code.

## Multiplayer / Authority

Quest progress and rewards must be validated on the server.

Do not trust client-supplied XP, gold, or completed objective counts.

The client may trigger gameplay events, but the server should determine whether:

- The player has the quest
- The objective matches
- Progress should increase
- The quest is complete
- Rewards may be granted

Reuse the existing Meteor / Colyseus architecture where appropriate.

Avoid unnecessary networking complexity for the MVP.

## Initial MVP Quests

Add 3 example quests using existing content where possible.

### 1. Boar Problem

Quest giver:
`forest-guard-01`

Objective:

```text
Kill 5 Boars
```

Reward:

```text
100 XP
1 Gold
```

### 2. A Greater Threat

Quest giver:
`forest-guard-01`

Objective:

```text
Defeat the existing forest mini-boss
```

Reward:

```text
250 XP
1 Gold
```

### 3. Speak With the Mage

Quest giver:
`forest-guard-01`

Objective:

```text
Interact with the Wandering Mage NPC
```

Reward:

```text
50 XP
```

Adapt IDs to the actual existing enemy, boss, and NPC IDs.

## Architecture Requirements

Keep these concerns separated:

```text
Quest definitions
      ↓
Quest service / progress logic
      ↓
Server validation + persistence
      ↓
Gameplay event adapters
      ↓
NPC quest UI + Hero Panel quest UI
```

Requirements:

- Keep quest definitions configurable in code.
- Do not hardcode individual quests throughout gameplay files.
- Do not put UI logic in quest domain/service code.
- Do not introduce a heavy quest framework.
- Keep it easy to add new objectives later.
- Preserve existing XP and gold logic if it already exists.
- Reuse existing stores/hooks/patterns where appropriate.
- Reuse the existing Hero Panel rather than creating a third persistent HUD system.

## Not Required Yet

Do not implement:

- Main-HUD quest tracker
- Quest chains
- Daily quests
- Repeatable quests
- Timed quests
- Shared party quest progress
- Escort quests
- Item collection quests
- Quest prerequisites
- Reputation
- Dialogue trees
- Cinematics
- Quest markers on a world map
- Procedural quests
- Admin quest editor

## Acceptance Criteria

The feature is complete when:

- A player can accept a quest from an NPC.
- Active quest progress is persisted.
- Killing the correct enemy updates kill objectives.
- Killing the correct boss updates boss objectives.
- Interacting with the correct NPC updates interaction objectives.
- Location interaction objectives can be triggered through a reusable API.
- Active quest progress is visible in Hero Panel → Quests.
- No additional persistent quest tracker is added to the main HUD.
- Completed quests can be turned in to the correct NPC.
- XP and gold rewards are applied exactly once.
- Completed quests remain completed after reconnect/reload.
- Existing combat, multiplayer, NPCs, character rendering, XP, gold, World Event UI, and Adventure Guide continue to work.
- Adding another simple quest mainly requires adding a quest definition rather than editing core systems.

## Implementation Process

Before implementation:

- Read `AGENTS.md`.
- Read the Basic NPC System implementation and relevant NPC files.
- Inspect the existing Hero Panel and its `Quests` section/tab.
- Read existing character XP, level, and gold logic.
- Inspect enemy death and mini-boss reward flows.
- Follow existing Meteor, Colyseus, Zustand, React, Tailwind, and DaisyUI patterns.
- Mention the exact file path for every created or modified file.

After implementation:

- Run relevant syntax/import checks.
- Run focused server-side quest progress/reward checks.
- Test that rewards cannot be claimed twice.
- Test reconnect/persistence for active and completed quests.
- Test at least one quest of each implemented objective type.
- Verify Hero Panel quest updates without requiring a page reload.
- Verify the main HUD remains unchanged apart from existing World Event and Adventure Guide elements.
- Verify cleanup and UI behavior when changing characters or leaving the world.
- Report any architectural blockers before inventory/loot is added.
