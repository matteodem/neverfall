# Central Camp Vegetation + Ground Polish

## Goal

Polish only the **Central Camp** environment so it visually moves toward the provided reference image.

Focus on:

- denser forest vegetation,
- more grass and flowers,
- richer ground variation,
- a more natural transition from green forest ground into brown dirt paths.

Do not change the wider world yet.

## Visual Direction

Use the provided reference image as the target style direction.

The Central Camp should feel:

- lush,
- colorful,
- dense,
- handcrafted,
- warm and inviting,
- clearly part of a fantasy forest.

Avoid large empty green areas.

## Grass

Grass should be much more present around Central Camp.

Requirements:

- Add frequent low-poly grass clusters.
- Use varied cluster sizes and rotations.
- Avoid perfectly uniform spacing.
- Keep paths and NPC interaction zones readable.
- Grass should be especially dense:
  - around tents,
  - beside fences,
  - near rocks,
  - around trees,
  - near riverbanks,
  - along path edges.

Prefer instances/thin instances or the existing optimized vegetation system where practical.

## Flowers

Flowers should appear frequently in the forest and around Central Camp.

Use small clusters rather than single isolated flowers.

Suggested mix:

- white flowers,
- yellow flowers,
- purple / blue accents,
- occasional pink flowers.

Keep the palette natural and consistent with the low-poly fantasy style.

Do not place flowers directly in the middle of main paths.

## Ground Color

The current forest floor should feel less like a flat green plane.

Introduce subtle variation:

```text
main forest ground
→ medium natural green

vegetation-heavy patches
→ slightly darker / richer green

near paths and camp activity
→ warmer, slightly worn earth tones
```

Keep the variation subtle.

Do not make the terrain noisy or patchy.

## Path Transition

The transition from green ground to brown dirt path is especially important.

The path should:

- stay clearly readable,
- use a warm dirt/sand brown,
- blend naturally into the surrounding forest ground,
- avoid hard rectangular edges,
- avoid heavy blur across the whole path.

Use a narrow, soft, irregular edge blend.

Suggested visual behavior:

```text
forest green
→ grass/flower edge
→ slightly worn earth
→ main brown dirt path
```

Only the path edges should blend.

The center of the path should remain crisp and readable.

## Central Camp Focus

Apply this pass only around:

- Central Camp tents,
- Wandering Mage area,
- Forest Guard checkpoint,
- nearby bridge/path entrances,
- nearby riverbank,
- immediate surrounding forest.

Do not propagate the same vegetation density to Highlands, Snowy Mountains, or Southwest Lake yet.

## Performance

Keep the pass lightweight.

Prefer:

- reused meshes,
- instances / thin instances,
- reused materials,
- low-poly grass and flower assets,
- limited shadow casting on small vegetation.

Avoid adding hundreds of unique draw calls.

## Scope

Do not:

- redesign terrain generation,
- change quests,
- move NPCs significantly,
- move camps,
- alter combat,
- change river logic,
- add new gameplay systems,
- polish other regions yet.

## Acceptance Criteria

The task is complete when:

- Central Camp no longer feels like a mostly empty green field.
- Grass is frequent and visually dense around camp areas.
- Flowers are common in the forest and near paths.
- Ground color has subtle natural variation.
- Green-to-brown path transitions look organic.
- Path centers remain crisp.
- NPCs, tents, paths, bridge access, and quest interactions remain unobstructed.
- No noticeable FPS regression is introduced.

## Implementation Notes

- Read `AGENTS.md`.
- Use the provided reference image as visual direction.
- Inspect the current Central Camp vegetation, terrain material, and path rendering code first.
- Reuse existing vegetation and material systems where possible.
- Keep the implementation limited to Central Camp.
- Run focused desktop/mobile browser checks.
- Report the exact files changed and any remaining visual gaps.
