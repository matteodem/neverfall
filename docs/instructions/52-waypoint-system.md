# Waypoint System MVP

## Goal

Add a simple waypoint / fast-travel system so players can quickly travel between discovered world locations.

Initial waypoints:

- Central Camp
- Northern Camp
- Lake / Western Waypoint

Keep the system small, config-driven, and server-authoritative.

## Waypoint Config

Create a central waypoint config.

Example:

```js
{
  id: "central-camp",
  name: "Central Camp",
  position: {
    x: 0,
    y: 0,
    z: 0,
  },
  region: "forest",
  isDefault: true,
}
```

Add equivalent entries for:

```text
Northern Camp
Lake Waypoint
```

Do not scatter waypoint coordinates throughout the codebase.

## Unlocking

Waypoints should be unlocked by visiting them.

Requirements:

- Central Camp is unlocked by default.
- Northern Camp unlocks when discovered.
- Lake Waypoint unlocks when discovered.
- Unlock state persists per character.
- Show a small notification when a new waypoint is unlocked.

Example:

```text
Waypoint Unlocked
Northern Camp
```

## World Map

Show all unlocked waypoints on the existing World Map.

Clicking an unlocked waypoint should open a small confirmation action.

Example:

```text
Travel to Northern Camp?

[Cancel] [Travel]
```

Locked waypoints can stay hidden for the MVP.

## Fast Travel

When the player confirms travel:

```text
Client requests travel
→ server validates waypoint is unlocked
→ server moves player to waypoint position
→ client updates normally through existing multiplayer sync
```

Requirements:

- travel must be server-authoritative
- player must not be able to send arbitrary coordinates
- reuse existing player position / teleport logic if available
- keep party / multiplayer state intact

## Restrictions

For MVP, prevent waypoint travel when:

- player is dead
- player is in a dungeon
- player is actively in combat
- player is mounted if that would break current teleport logic

Use the simplest checks that match the existing architecture.

## Spawn Points

Keep spawn points and waypoints as separate concepts.

- Spawn Point = where the player respawns after death
- Waypoint = voluntary fast travel destination

A location may be both a spawn point and a waypoint.

Example:

```text
Central Camp
→ Spawn Point
→ Waypoint
```

## Lake Waypoint

Add a waypoint in the western lake area.

Use a sensible nearby position that:

- is on safe traversable ground
- does not spawn the player inside water
- does not overlap enemies / event spawns
- has enough space for the player and mount

## Out of Scope

Do not add:

- Gold travel cost
- waypoint cooldown
- loading screens
- teleport animations
- party-wide teleport
- dungeon fast travel
- cross-world / cross-server travel

These can be added later.

## Acceptance Criteria

- Central Camp, Northern Camp, and Lake Waypoint exist in config.
- Central Camp is unlocked by default.
- Northern Camp and Lake Waypoint unlock when discovered.
- Unlock state persists per character.
- World Map displays unlocked waypoints.
- Clicking an unlocked waypoint can fast-travel the player there.
- Fast travel is server-authoritative.
- Arbitrary client coordinates are rejected.
- Spawn point logic remains unchanged.
- Dungeon gameplay remains unchanged.

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current spawn point, map, player position, and multiplayer sync systems first.
3. Reuse existing position / teleport helpers where possible.
4. Keep waypoint definitions centralized and config-driven.
5. Keep waypoint unlock state per character.
6. Keep spawn points and waypoints logically separate.
7. Use JavaScript only.
8. Avoid unrelated refactors.
9. Run relevant checks after implementation.
10. In the final response, list every changed file with its exact path.
