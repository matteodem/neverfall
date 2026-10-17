# Central Camp / Forest Vegetation Density Pass

## Goal

Use the provided BEFORE / AFTER reference (docs/inspiration/fantasy-central-camp.png) as visual direction and make the Central Camp / nearby forest feel denser, richer, and more handcrafted.

Focus only on vegetation and natural ground dressing:

- grass
- flowers
- bushes / undergrowth
- tree density and clustering
- small natural rock/plant groupings

Do not redesign the whole region.

## Visual Direction

The target should feel closer to the AFTER image:

- fewer empty green areas
- denser vegetation around paths and camps
- more layered foreground / midground / background
- stronger forest identity
- colorful but still readable
- low-poly fantasy style
- handcrafted rather than uniformly procedural

## Grass

Increase grass density significantly around Central Camp and the nearby forest.

Prioritize grass around:

- path edges
- tents / camp props
- fences
- rocks
- bridge approaches
- riverbanks
- tree bases
- NPC areas

Use varied cluster size, scale, and rotation.

Avoid placing dense grass directly in the middle of main paths, NPC interaction zones, or combat spaces.

## Flowers

Add more flower clusters throughout the forest.

Suggested palette:

- white
- yellow
- purple / blue
- occasional pink

Prefer small patches instead of isolated single flowers.

Flowers should be especially visible:

- beside paths
- around camps
- near fences
- beside rocks
- near the river
- in open forest clearings

Do not make the distribution perfectly uniform.

## Bushes / Undergrowth

Increase low-level vegetation so the forest floor has more depth.

Use existing:

- bushes
- shrubs
- fern-like props
- small plants
- low rock + plant combinations

Cluster them near larger objects instead of placing them randomly everywhere.

## Trees

Improve tree placement so the forest feels denser and more natural.

Requirements:

- create small tree clusters instead of evenly spaced trees,
- keep readable open spaces around Central Camp,
- preserve paths and important sightlines,
- avoid blocking landmarks or NPCs,
- use varied scale / rotation where the current tree system allows it.

The area should feel forested without becoming visually or physically cluttered.

## Layering

Create visual layers:

```text
Foreground
- flowers
- grass
- bushes
- small rocks

Midground
- fences
- shrubs
- tree clusters

Background
- denser tree silhouettes
- occasional larger rock groups
```

The goal is to reduce large empty areas while keeping the player route readable.

## Central Camp Focus

Apply this pass only to:

- Central Camp
- Wandering Mage area
- Forest Guard area
- bridge approaches
- nearby forest paths
- nearby riverbank
- immediate Central Forest surroundings

Do not apply the same density to Highlands, Snowy Mountains, or Southwest Lake yet.

## Performance

Keep performance as a hard constraint.

Prefer:

- thin instances / instances
- reused meshes
- reused materials
- low-poly vegetation
- limited shadow casting on small plants
- distance-based visibility if already supported

Avoid large increases in unique draw calls.

## Preserve

Do not change:

- quests
- NPC positions unless absolutely necessary
- enemy spawns
- bridge placement
- river layout
- path routing
- collision logic
- gameplay systems

## Acceptance Criteria

The pass is complete when:

- Central Camp feels significantly less empty.
- Grass is frequent along path and camp edges.
- Flower clusters are visible throughout the forest.
- Tree placement feels grouped and natural instead of evenly spaced.
- Bushes / undergrowth add depth to the forest floor.
- Main paths, NPCs, enemies, and landmarks remain readable.
- No important interaction area is blocked.
- No noticeable FPS regression is introduced.
- The result visually moves toward the AFTER reference without copying it literally.

## Implementation Notes

- Read `AGENTS.md`.
- Inspect the existing vegetation / environment placement systems first.
- Reuse current vegetation assets before introducing new ones.
- Keep the implementation MVP-sized and limited to this area.
- Run focused desktop/mobile browser checks.
- Report:
  - files changed,
  - vegetation types added/increased,
  - density / placement approach,
  - any remaining visually empty areas.
