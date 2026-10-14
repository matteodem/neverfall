# World lighting and shadows

`createWorldLighting.js` owns the world and dungeon sunlight, ambient light and
one dynamic PCF shadow map. Babylon falls back to Poisson filtering on WebGL 1.
Lighting is shared across regions; existing dungeon sky/fog colors are preserved.

Every enabled, visible mesh with lit opaque or alpha-tested geometry is considered,
including imported GLBs, structures, landmarks, towers, platforms, stairs, bridges,
vegetation, props, NPCs, enemies and mounts. Grouped GLB children are scene meshes
and are considered individually. No asset-specific registration is required.
The scene's mesh list is refreshed before rendering when meshes are added/removed,
every 250 ms for visibility/material changes, and immediately after large moves.
The render list is replaced only when its contents change. Existing casters have
an eight-unit retention margin at the distance cutoff to avoid boundary toggling.
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

Standard desktop quality uses a 2048 map with a 50.4-unit projection half-width and medium PCF
filtering for moderately soft edges without a blocker-search step. PCSS was
reverted: its sparse 16-sample search over a broad area missed narrow modular
character silhouettes, returning fully lit pixels inside their shadows.
Low quality and touch devices use a 1024 map with a 37.8-unit projection half-width and medium
PCF filtering. Texture size is capped by the
engine's hardware limit. This retains one shadow map/pass and bounded nearby
coverage rather than increasing map resolution or adding cascades. The projection
has a fixed 5% margin over the original 48/36-unit coverage to gently soften the
3x3 PCF footprint without switching to a wider filter. Caster culling keeps its
original range: 1.5 times 48/36 units (plus their bounds), to include nearby
offscreen blockers. The depth interval is 1–240 units, centered 120 units upstream
of the player. Depth bias is 0.00005 and normal bias is 0.01 world units. The
smaller offsets limit inward silhouette shrinkage and gaps at the feet while
retaining protection against self-shadow acne. A 3x3 PCF footprint preserves thin
lower-body details better than the former desktop 5x5 footprint, with fewer
texture samples and unchanged map resolution. Darkness is 0.07: full shadow keeps
7% of the direct sunlight, lifting excessive darkness while leaving silhouettes
clearly visible. Warm ambient illumination stays at intensity 0.55, and sun
intensity stays at 1.05. Direction is normalized from
(-1, -1.5, 1), lowering elevation from about 55 to 47 degrees so a standing body's
projection is less compressed. The modest projection margin remains fixed during
gameplay; map resolution, culling ranges and contact bias are unchanged.
All three light-space position axes are snapped to shadow texels; the sun position
is updated only when that snapped position changes. Projection size, depth bounds,
bias and sunlight intensity stay fixed and do not depend on camera orbit or the
current caster list. Edge falloff softens the map boundary. Camp lights keep a
constant intensity so shadow contrast does not pulse; procedural flames still animate
but explicitly neither cast nor receive shadows.
The smaller coverage also reduces the number of nearby casters; distant geometry
still receives the shared lighting but has no dynamic shadows beyond this range.

For a future exception, set `mesh.metadata.worldShadows = { cast: false,
receive: false }` (either field can be omitted). For instances, reception is shared
by the source material/mesh, so set reception policy consistently on the source.
These flags do not override the transparent/unlit exclusions.

Visual review should cover the forest, Basic Tower and jumping platforms, frozen
arch, camp buildings, bridges/ruins, and dungeon walls/pillars, followed by travel
to a region with assets that were not initially loaded. Compare standard/low
quality and mobile, including shadows while characters move and jump.

The PCSS rollback was visually reviewed in an isolated browser scene with the
actual Amir character, horse mount, camp GLBs and Basic Tower asset. A same-pose
PCSS/PCF comparison reproduced the missing character-shadow pixels with PCSS and
showed a continuous silhouette with PCF. All eight visible character parts were
casters and receivers; unchanged rendered frames were pixel-identical, and the
preview reported no browser errors.

The subsequent silhouette tuning was compared on frozen player/Forest Guard poses,
a running pose, the horse and imported camp/tower meshes. All eight visible player
parts and nine visible guard parts cast and received shadows. The lower sun angle
and smaller filter/offsets preserved more of the lower-body silhouette; unchanged
scene frames remained pixel-identical, with no browser errors.

The final 5% projection margin and 0.07 darkness adjustment were compared on the
same frozen poses, then reviewed with mounted/running characters, camp props,
the tower and camera/character movement. Static frames stayed pixel-identical;
camera orbit left sunlight position/direction unchanged, and the browser reported
no errors. These isolated reviews do not measure production-world FPS or replace
hardware/mobile gameplay review.
