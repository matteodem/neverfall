# Vertical World Pass

## Goal

Improve the open world by adding stronger vertical variation such as large hills, elevated areas, slopes, and lower valleys.

Keep the world readable and playable while making the terrain feel less flat.

## Tasks

- Add several **large hills** across the open world.
- Create more noticeable elevation differences between regions.
- Add a few smaller ridges / slopes to break up flat terrain.
- Use lower areas / shallow valleys between major elevated sections.
- Keep important locations visually distinct through height differences.

## Placement Guidelines

Use vertical variation intentionally.

Examples:

- Forest Giant area on a larger hill
- Highlands generally more elevated than the starting area
- Central Camp remains on relatively accessible terrain
- Northern areas may use more hills / ridges
- Lake area should remain lower than surrounding terrain

Avoid making the whole map mountainous.

Leave enough flatter terrain for:

- combat
- camps
- world events
- enemy groups
- dungeon entrances
- movement on foot and mount

## Paths & Traversal

Important routes should remain easy to follow.

Do not create terrain that forces awkward climbing or blocks normal movement.

Where hills intersect important routes:

- use gentle slopes
- create natural passes
- keep paths wide enough for players and mounts

## Gameplay Safety

Do not bury, block, or break:

- Central Camp
- Northern Camp
- spawn points
- dungeon entrances
- Hunt areas
- World Events
- enemy spawn locations
- quest / interaction areas

Adjust nearby terrain only where it remains compatible with existing gameplay.

## Collision

Make sure newly added terrain / hill geometry behaves correctly with existing player and enemy movement.

Reuse the current terrain / collision system instead of introducing a separate physics solution.

## Performance

Keep the vertical pass lightweight.

- reuse existing terrain generation helpers
- avoid excessive unique meshes
- keep geometry simple
- preserve existing culling / optimization logic

## Important

This is a **world-shape / terrain pass** only.

Do not change:

- combat
- quests
- enemy AI
- rewards
- progression
- world event logic

## Acceptance Criteria

- The world no longer feels mostly flat.
- Several large hills are clearly visible.
- Forest and Highlands have stronger vertical identity.
- Important gameplay locations remain accessible.
- Paths remain traversable on foot and mount.
- Existing gameplay systems still work.
- Performance remains reasonable.

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the existing world / terrain generation code first.
3. Reuse current terrain helpers and collision logic where possible.
4. Add vertical variation intentionally rather than randomly.
5. Keep important gameplay locations and routes accessible.
6. Use JavaScript only.
7. Keep the implementation small and DRY.
8. Avoid unrelated refactors.
9. Run relevant checks after implementation.
10. In the final response, list every changed file with its exact path.
