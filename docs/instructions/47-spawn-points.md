# Spawn Points MVP

## Goal

Add multiple world spawn points so players can respawn at discovered locations instead of always returning to the central camp.

Keep the system small, config-driven, and server-authoritative.

## Initial Spawn Points

Start with:

```text
Central Camp
Northern Camp
```

The Central Camp remains the default spawn for new characters.

## Spawn Point Config

Each spawn point should define at least:

```js
{
  id: "central-camp",
  name: "Central Camp",
  region: "forest",
  position: {
    x: 0,
    y: 0,
    z: 0,
  },
  isDefault: true,
}
```

Keep spawn points centralized in config.

Do not hardcode respawn positions throughout the codebase.

## Unlocking

Spawn points should be unlocked by visiting them.

Requirements:

- Central Camp is unlocked by default.
- Northern Camp unlocks when the player enters its discovery radius.
- Unlocked spawn points are stored per character.
- Show a small notification when a new spawn point is discovered.

Example:

```text
Respawn Point Unlocked
Northern Camp
```

## Respawn Behavior

When the player dies in the open world:

- find the nearest unlocked spawn point
- respawn the player there
- reuse the existing respawn protection behavior

Dungeon respawning should remain separate and continue using the dungeon's existing respawn logic.

## World Map

Show spawn points on the existing World Map.

Requirements:

- use a distinct respawn / camp marker
- show unlocked spawn points clearly
- clicking / hovering should show:
  - spawn point name
  - `Respawn Point`
  - unlocked status
- make sure that it doesn't overlap with existing map markers

Locked spawn points can remain hidden for the MVP.

## Minimap

If practical, reuse the existing map marker system to also show nearby unlocked spawn points on the minimap.

Do not create a separate map implementation.

## Out of Scope

Do not add:

- manual spawn selection on death
- teleporting between spawn points
- fast travel
- resurrection penalties
- complex waypoint networks
- dungeon spawn point refactors

These can be added later.

## Acceptance Criteria

- Central Camp and Northern Camp are configured as spawn points.
- Central Camp is unlocked by default.
- Northern Camp unlocks when discovered.
- Unlock state persists per character.
- Open-world death respawns at the nearest unlocked spawn point.
- Dungeon respawn behavior remains unchanged.
- World Map shows unlocked spawn points.
- Spawn point unlock notification appears once.
- Existing safe-zone and respawn protection logic still works.

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current death, respawn, Character persistence, Northern Camp, and map systems first.
3. Replace scattered world respawn coordinates with a central spawn point config where appropriate.
4. Keep unlock / respawn validation server-authoritative.
5. Reuse existing map marker and notification components.
6. Keep dungeon respawning separate.
7. Use JavaScript only.
8. Keep the implementation small and DRY.
9. Avoid unrelated refactors.
10. Run relevant checks after implementation.
11. In the final response, list every changed file with its exact path.
