# Highlands Environment Pass

## Goal

Make the Highlands feel clearly different from the Forest while reusing the existing AmiPolygon environment assets already being implemented.

Do not add another nature asset pack for this task.

## Visual Direction

The Highlands should feel:

- more open
- more elevated
- more rocky
- less densely forested
- slightly harsher / windier than the Forest

## Asset Usage

Use the existing AmiPolygon assets as the visual base.

Prioritize:

- Pine Trees
- Dead Trees
- Rocks
- Boulders
- Bushes
- Grass
- Logs where appropriate

## Placement Rules

Compared to the Forest:

- use fewer trees
- use more pines / dead trees
- place more rocks and boulders
- keep larger open spaces
- use small grass / bush clusters
- avoid dense forest-like placement
- vary rotation and scale slightly
- avoid obvious repetition

## Terrain

Highlands should have stronger vertical variation.

Add:

- large hills
- elevated plateaus
- ridges
- slopes
- shallow valleys / lower sections
- a few natural passes between higher areas

Keep traversal comfortable for players and mounts.

## Region Identity

Keep important Highlands locations visually distinct:

- Northern Camp
- dungeon entrance
- Hunt areas
- Wolf Invasion area
- spawn point
- existing landmarks

Use terrain height and prop density to help separate these areas visually.

## Forest → Highlands Transition

Make the transition gradual.

Suggested progression:

```text
Forest
→ fewer dense trees
→ more rocks / pines
→ stronger elevation
→ open Highlands terrain
```

Avoid an abrupt biome border.

## Gameplay Safety

Do not block or break:

- Northern Camp
- dungeon entrance
- World Event area
- Hunt markers / Hunt areas
- spawn point
- enemy spawn locations
- important paths
- player / mount movement

## Performance

Keep the environment lightweight.

- reuse existing asset loading helpers
- use instances / clones where supported
- avoid excessive unique meshes
- preserve current culling / optimization logic

## Acceptance Criteria

- Highlands look visually distinct from the Forest.
- AmiPolygon assets are reused consistently.
- Highlands use fewer trees and more rocks / open spaces.
- Vertical variation is clearly stronger.
- Forest → Highlands transition feels gradual.
- Existing Highlands gameplay remains accessible.
- Performance remains reasonable.

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current Highlands and environment generation code first.
3. Reuse the AmiPolygon assets already under the project environment assets.
4. Do not add another nature asset pack.
5. Focus on composition, density, and terrain differences.
6. Keep important gameplay areas accessible.
7. Use JavaScript only.
8. Avoid unrelated refactors.
9. Run relevant checks after implementation.
10. In the final response, list every changed file with its exact path.
