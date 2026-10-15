# Terrain Variation + Southern River

## Goal

Make the overworld feel less flat by adding subtle procedural terrain height variation and a prominent river through the southern third of the map.

Use the attached reference image only as visual direction for gentle hills, readable paths, riverbanks, and natural elevation changes.

## Terrain Variation

Add small procedural height differences across the overworld.

Requirements:

- Keep elevation changes subtle and walkable.
- Avoid extreme mountains or steep terrain.
- Preserve important camps, NPCs, enemies, landmarks, roads, dungeon entrances, and quest locations.
- Keep major gameplay areas reasonably flat.
- Use smooth noise / blended height variation rather than random sharp bumps.
- Make paths and open areas remain readable.
- Keep terrain generation deterministic from config/seed if practical.

Suggested direction:

```text
flat gameplay areas
+ gentle hills
+ small slopes
+ occasional raised terrain
+ natural depressions near the river
```

## River

Add a stylized river that runs through the southern third of the world from one side of the map to the other.

Requirements:

- Use a slightly winding path instead of a straight line.
- Add a visible water surface.
- Create shallow riverbanks / terrain depressions around it.
- Keep the river width and water level configurable.
- Preserve existing traversal where possible.
- Leave clear candidate locations for future bridges.
- Do not add bridges yet.

## Configuration

Keep the new environment values easy to tune in the existing world/environment config.

Suggested configurable values:

```js
terrainHeightAmplitude
terrainNoiseScale
terrainSeed

riverWidth
riverWaterLevel
riverPath
riverBankWidth
```

Adapt naming to existing project conventions.

## Scope

Do not:

- rebuild the entire terrain system,
- move existing regions unnecessarily,
- add bridges yet,
- add waterfalls yet,
- add large new environment assets,
- change gameplay systems unrelated to terrain.

## Acceptance Criteria

- The world no longer feels completely flat.
- Height changes are subtle and traversable.
- Important existing content still works.
- The southern river is clearly visible and feels naturally integrated.
- Riverbanks follow the terrain instead of looking like a flat water plane placed on top.
- Terrain and river settings can be tuned without rewriting the system.
- Desktop/mobile performance remains acceptable.

## Implementation Notes

- Read `AGENTS.md`.
- Inspect the current terrain/world generation and water systems first.
- Keep the implementation MVP-sized.
- Reuse Babylon.js systems already present in the project.
- Run focused browser checks for traversal, collisions, existing content, and performance.
- Report any locations that would benefit from a bridge afterward.
