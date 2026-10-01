# Snowy Mountains Area

## Goal

Add a new world area called **Snowy Mountains** to the **east side of the map**.

The area should feel like a large mountain slope that rises toward the eastern edge of the world and naturally prevents players from travelling beyond the map boundary.

Keep the implementation focused on world expansion, enemies, boss content, and map labeling.

## Area Layout

Create a large mountain / hill covering the eastern section of the world.

Requirements:

- terrain should gradually slope upward as the player travels east
- elevation should become much steeper near the eastern map edge
- the eastern edge should rise vertically / become impassable so players cannot leave the world
- keep traversal playable in the lower and middle sections
- avoid awkward invisible walls where terrain can provide the boundary naturally

The area should clearly feel different from Forest and Highlands.

## Visual Direction

Snowy Mountains should use a cold mountain theme.

Suggested direction:

- snowy / pale terrain
- rocky slopes
- sparse vegetation
- open mountain spaces
- stronger verticality than Highlands
- clear mountain silhouettes
- enough open combat space for enemies and boss encounters

Reuse existing compatible environment assets where possible.

Do not require a new asset pipeline for the first version.

## Enemies

Add two new enemy types to the Snowy Mountains.

Requirements:

```text
Enemy Type 1
Level 10

Enemy Type 2
Level 12
```

Reuse existing enemy architecture, AI, combat, loot, rare variants, death, respawn, and map systems where possible.

Choose existing models / assets that fit the area if suitable assets already exist.

Keep enemy placement inside the Snowy Mountains region.

## Boss

Add one boss to the Snowy Mountains.

Requirements:

```text
Boss Level: 14
```

The boss should:

- spawn in a clear landmark / elevated boss area
- use the existing boss system
- use existing boss health bar behavior
- reuse existing boss mechanics where appropriate
- provide stronger rewards than normal Snowy Mountains enemies

Do not create a completely new boss framework.

## World Map

Update the existing World Map to include a region label:

```text
Snowy Mountains
```

Place the label over the eastern section of the map.

If the World Map currently uses static region labels / coordinates, follow the existing pattern.

## Gameplay Safety

Do not break or block:

- Central Camp
- Northern Camp
- Highlands
- Lake area
- existing dungeon entrances
- Hunt areas
- World Events
- spawn points
- waypoints
- important travel routes

Create a clear transition from the existing world into Snowy Mountains.

## Performance

Keep the new area compatible with existing performance systems.

- reuse current environment loading helpers
- preserve entity culling
- preserve distance-based rendering
- avoid excessive unique meshes
- reuse materials / instances where practical

## Acceptance Criteria

- Snowy Mountains exists in the east of the world.
- Terrain slopes upward toward the east.
- Eastern map boundary is naturally blocked by steep / vertical mountain terrain.
- Area is clearly visually distinct from Forest and Highlands.
- Two enemy types exist at Levels 10 and 12.
- One boss exists at Level 14.
- Enemies and boss use existing combat / reward systems.
- World Map shows the `Snowy Mountains` label.
- Existing world content remains accessible.
- Performance remains reasonable.

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current world generation, region layout, enemy config, boss system, and World Map first.
3. Reuse existing terrain / vertical world helpers where possible.
4. Add the Snowy Mountains area to the east without rewriting the world system.
5. Keep enemy and boss definitions config-driven.
6. Reuse existing AI, combat, loot, boss, and map systems.
7. Use JavaScript only.
8. Avoid unrelated refactors.
9. Run relevant checks after implementation.
10. In the final response, list every changed file with its exact path.
