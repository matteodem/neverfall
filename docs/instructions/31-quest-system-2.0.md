# Quest System 2.0

## Goal

Expand the current quest / hunt system into a small, reusable quest system.

Keep it config-driven, simple, and compatible with the existing gameplay systems.

## Quest Types

Support these quest objective types:

- `Kill`
- `Boss`
- `ReachLocation`
- `Interact`
- `CompleteEvent`
- `CompleteDungeon`

## Examples

```text
Wolf Problem
→ Kill 10 Wolves
```

```text
Into the Depths
→ Complete the dungeon
```

```text
Explore the Highlands
→ Reach the Highlands lookout
```

```text
Awakened Threat
→ Complete Forest Giant Awakening
```

## Behavior

- Existing Hunt Quests must keep working.
- Quest progress should update automatically from existing game systems.
- Completed quests give existing rewards such as XP, Gold, and Loot where appropriate.
- Progress must persist per character.
- Quests should remain visible in the existing quest UI / quest log.

## Architecture

Keep quests config-driven.

Example shape:

```js
{
  id: "into-the-depths",
  title: "Into the Depths",
  objective: {
    type: "CompleteDungeon",
    target: "dungeon-01",
    amount: 1,
  },
  rewards: {
    xp: 250,
    gold: 20,
  },
}
```

Reuse existing systems instead of duplicating logic.

Examples:

- enemy death → updates `Kill` / `Boss`
- player enters area → updates `ReachLocation`
- interaction → updates `Interact`
- world event completion → updates `CompleteEvent`
- dungeon completion → updates `CompleteDungeon`

## NPCs

Do not add NPC quest givers yet.

Quest System 2.0 should work without NPCs.

Later, NPCs should be able to start quests by using the same quest system without changing the core architecture.

## Out of Scope

Do not add:

- NPC dialogue system
- quest chains
- branching quests
- reputation
- daily quests
- quest currencies
- complex cutscenes

## Acceptance Criteria

- Existing Hunt Quests still work.
- New quest types are supported.
- Quest progress updates from existing gameplay systems.
- Quest progress persists per character.
- Quest completion gives existing rewards.
- Quest UI continues to work.
- No NPC system is required.
- Adding a new quest should mostly require config, not custom logic.

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current quest / hunt system first.
3. Reuse existing quest UI and persistence where possible.
4. Reuse existing combat, event, dungeon, reward, and interaction systems.
5. Keep the implementation small and DRY.
6. Avoid unrelated refactors.
7. Use JavaScript only.
8. Run relevant checks after implementation.
