# World lighting and shadows

`createWorldLighting.js` owns the world and dungeon sunlight, ambient light and
one dynamic PCF shadow map. Babylon falls back to Poisson filtering on WebGL 1.
Lighting is shared across regions; existing dungeon sky/fog colors are preserved.

Every enabled, visible mesh with lit opaque or alpha-tested geometry is considered,
including imported GLBs, structures, landmarks, towers, platforms, stairs, bridges,
vegetation, props, NPCs and enemies. No asset-specific registration is required.
The scene's mesh list is refreshed before rendering when meshes are added/removed,
every 250 ms for visibility/material changes, and immediately after large moves.
Shadow maps still render every frame so moving/skinned characters cast dynamic shadows.
Instances receive shadows through their source mesh. Distinct instance placements
are registered once each, letting Babylon batch their shadow draws.

Intentional exceptions:

- The main terrain/dungeon floor and `forestPathGround` receive but do not cast:
  this avoids rendering the entire terrain again and near-coplanar path artifacts.
- Hidden collision bodies, disabled chunks and geometry-free GLB roots are skipped.
- Unlit materials, alpha-blended water, nameplates, particles and effect-only meshes
  do not cast or receive. Alpha-tested foliage remains eligible. Mixed-material
  meshes receive shadows, with only solid submeshes casting.
- Distant casters are culled using their world bounding spheres, including large
  structures whose origins lie outside the range. The player-following projection
  gives every region the same local coverage, with a softened boundary rather than
  spending shadow resolution on the entire map at once.

Standard quality uses a 2048 map with an 80-unit half-width. Low quality and touch
devices use a 1024 map with a 60-unit half-width and cheaper filtering. Casters up
to 1.5 times that distance (plus their bounds) are considered to include nearby
offscreen blockers. The depth interval is 1–360 units. Light-space texel snapping,
depth/normal bias and edge falloff reduce shimmering, acne and abrupt map edges.

For a future exception, set `mesh.metadata.worldShadows = { cast: false,
receive: false }` (either field can be omitted). For instances, reception is shared
by the source material/mesh, so set reception policy consistently on the source.
These flags do not override the transparent/unlit exclusions.

Visual review should cover the forest, Basic Tower and jumping platforms, frozen
arch, camp buildings, bridges/ruins, and dungeon walls/pillars, followed by travel
to a region with assets that were not initially loaded. Compare standard/low
quality and mobile, including shadows while characters move and jump. No visual
or FPS measurements are claimed by the implementation's static checks.
