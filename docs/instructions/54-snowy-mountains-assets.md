# Snowy Mountains Environment Assets

## Goal

Use the existing environment assets in:

```text
game/public/models/environment
```

to give the new **Snowy Mountains** region a clear alpine / cold-weather identity.

Do not add new external assets for this task.

## Main Assets

Use these as the primary Snowy Mountains environment assets:

```text
pine_1.glb
pine_2.glb

fir_1.glb
fir_2.glb
fir_3.glb

dry_tree_1.glb
dry_tree_2.glb

rock_1.glb
rock_2.glb
rock_3.glb
rock_4.glb

grass_1.glb
grass_2.glb

stump_1.glb
stump_2.glb

log_1.glb
log_2.glb
```

## Optional Lower-Slope Assets

Use these only in the lower transition area of the Snowy Mountains:

```text
birch_1.glb
birch_2.glb
birch_3.glb

bush_1.glb
bush_2.glb
bush_3.glb
```

## Avoid

Do not use these as regular Snowy Mountains assets:

```text
cherry_blossom.glb
acacia_1.glb
acacia_2.glb
acacia_3.glb
sequoia.glb
oak_1.glb
oak_2.glb
oak_3.glb
beech_1.glb
beech_2.glb
flowers_1.glb
flowers_2.glb
mushroom_1.glb
mushroom_2.glb
```

These fit the Forest / warmer biomes better.

## Placement by Elevation

### Lower Snowy Mountains

Use:

- Birch
- Pine
- Fir
- Rocks
- Sparse grass
- A few bushes

This should act as the transition from the existing world into the Snowy Mountains.

### Mid Mountain

Use mostly:

- Pine
- Fir
- Rock clusters
- Dry trees
- Occasional logs / stumps

Tree density should decrease as elevation increases.

### Upper Mountain

Use mostly:

- Rocks / boulders
- Sparse pine / fir
- Dry trees
- Stumps

Use very little grass or bushes.

The upper mountain should feel exposed, cold, and harsh.

## Placement Rules

- Do not distribute props evenly.
- Create small natural clusters.
- Use larger rock groups on slopes.
- Keep trees more concentrated in lower / mid elevations.
- Reduce vegetation toward the top.
- Vary rotation and scale slightly.
- Avoid obvious repetition.
- Keep combat areas readable.
- Keep traversal paths open for players and mounts.

## Region Identity

The Snowy Mountains should visually read as:

```text
Forest / Highlands
→ birch + pine transition
→ fir + rocks + slopes
→ sparse alpine vegetation
→ exposed rocky upper mountain
```

The area should not look like the Forest with different terrain color.

## Gameplay Safety

Do not block:

- Snowy Mountains enemy areas
- boss arena
- paths
- waypoint / spawn locations
- quest / Hunt areas
- World Map landmarks
- player / mount traversal

## Performance

- Reuse existing environment loading helpers.
- Use clones / instances where supported.
- Preserve existing culling and distance-based rendering.
- Avoid excessive unique meshes.

## Acceptance Criteria

- Snowy Mountains uses the listed Pine / Fir / Rock assets as its main visual language.
- Vegetation becomes sparser with elevation.
- Lower, mid, and upper mountain areas feel visually different.
- Existing Forest / Highlands assets remain visually distinct.
- Important gameplay areas remain accessible.
- Performance remains reasonable.

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the existing Snowy Mountains and environment placement code first.
3. Inspect the assets in `game/public/models/environment`.
4. Use the exact asset filenames listed in this spec where available.
5. Reuse existing environment placement helpers.
6. Keep placement deterministic if the current world generation is deterministic.
7. Use JavaScript only.
8. Avoid unrelated refactors.
9. Run relevant checks after implementation.
10. In the final response, list every changed file with its exact path.
