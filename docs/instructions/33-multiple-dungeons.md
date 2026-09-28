# Multiple Dungeon Config + Dungeon #2

## Goal

Refactor the current dungeon system so it supports multiple dungeons, then add a second dungeon in the **north of the world map**.

Keep the current dungeon working exactly as before.

## Part 1 — Multiple Dungeon Config

Introduce a central dungeon config instead of hardcoding one dungeon.

Each dungeon should have at least:

```js
{
  id: "forest-dungeon",
  name: "Forest Dungeon",
  roomName: "dungeon",
  entrance: {
    x: 0,
    y: 0,
    z: 0,
  },
  recommendedLevel: 5,
  enemies: [],
  miniBoss: null,
  finalBoss: null,
  rewards: {},
}
```

The exact structure can follow the existing architecture.

The important part is that dungeon-specific values are no longer scattered through the code.

## Required Changes

The dungeon flow should use a `dungeonId`.

Example:

```text
Player enters dungeon portal
→ selected dungeonId is sent
→ server loads matching dungeon config
→ correct dungeon content is created
→ UI shows the correct dungeon name
```

Support:

- unique dungeon `id`
- dungeon `name`
- entrance position
- enemy setup
- mini-boss / boss setup
- reward configuration
- recommended level
- dungeon-specific UI name
- joining the correct dungeon through `dungeonId`

Reuse the existing Colyseus dungeon room / instancing system where possible.

Do not create a completely separate room implementation for every dungeon.

## Part 2 — Dungeon #2

Add a second dungeon entrance in the **north of the world map**.

Suggested name:

```text
Northern Ruins
```

The exact position should be chosen by inspecting the existing world layout and placing the entrance in a sensible northern location.

Do not break existing terrain, camps, bosses, events, or spawn areas.

## Northern Ruins

Make the second dungeon feel different from the first while reusing existing systems and assets.

Suggested structure:

```text
Entrance
↓
Enemy Pack
↓
Enemy Pack
↓
Mini-Boss
↓
Final Area
↓
Final Boss
↓
Reward
↓
Exit
```

Use existing enemy / boss assets where practical.

No new asset pipeline is required.

## Dungeon #2 Content

Keep the first version lightweight.

Suggested:

- 2–3 enemy groups
- 1 mini-boss
- 1 final boss
- dungeon completion reward
- solo + party support
- existing death / respawn behavior
- existing exit / return-to-world behavior

Reuse existing combat, loot, boss, party, and reward systems.

## World Map / Minimap

The new northern dungeon entrance should be visible where the existing dungeon entrance is currently represented.

Reuse the existing map marker system.

Do not create a separate map implementation.

## Quest System

The new dungeon should work with Quest System 2.0.

It must be possible to target it using something like:

```js
{
  type: "CompleteDungeon",
  target: "northern-ruins",
  amount: 1,
}
```

Do not require a new quest implementation specifically for this dungeon.

## Out of Scope

Do not add:

- procedural dungeon generation
- dungeon finder / matchmaking
- difficulty modes
- heroic / mythic versions
- raid system
- dungeon keys
- complex dungeon progression
- new networking architecture

## Acceptance Criteria

- Existing dungeon still works.
- Dungeon system supports more than one dungeon through config.
- Dungeon-specific logic uses a `dungeonId`.
- UI displays the correct dungeon name.
- A second dungeon called `Northern Ruins` exists.
- Its entrance is placed in the north of the world map.
- Northern Ruins supports solo and party play.
- Northern Ruins has enemy groups, a mini-boss, and a final boss.
- Rewards use the existing reward / loot systems.
- Minimap / world map can show the new dungeon entrance.
- `CompleteDungeon` quests can distinguish between dungeon IDs.
- Existing open-world and dungeon functionality remains intact.

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current dungeon implementation before changing anything.
3. Identify all places where the current dungeon is hardcoded.
4. Refactor only what is necessary to support multiple dungeon configs.
5. Keep the existing dungeon behavior unchanged.
6. Add `Northern Ruins` using the shared dungeon architecture.
7. Reuse existing Colyseus room, combat, party, reward, map, and quest systems.
8. Use JavaScript only.
9. Avoid unrelated refactors.
10. Run relevant checks after implementation.
11. In the final response, list every changed file with its exact path and briefly explain what changed.
