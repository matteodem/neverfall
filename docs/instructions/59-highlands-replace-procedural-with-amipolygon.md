# Replace Procedural Highlands Props with AmiPolygon Assets

## Goal

Replace the current procedurally generated / primitive-looking Highlands environment props with the existing **AmiPolygon low-poly environment assets** already available in the project.

The current Highlands contain too many simple procedural shapes such as:

```text
pyramids
stacked rock shapes
rectangular block walls
simple procedural boulders
generic geometric props
```

These should be removed or reduced significantly.

The replacement should use the existing AmiPolygon `.glb` assets so the Highlands visually match the rest of Neverfall better.

Use JavaScript only.

---

# 1. Important Constraints

Do not add a new external asset pack.

Do not add new Meshy assets for this task.

Use the existing AmiPolygon environment models already present in the repository.

Do not change:

- enemy logic
- quest logic
- Hunt logic
- world event logic
- waypoint logic
- spawn point logic
- dungeon logic
- combat
- terrain collision
- region boundaries

This task is primarily a **visual environment replacement / cleanup pass**.

---

# 2. AmiPolygon Assets to Use

Inspect the current environment asset folder first.

Known existing assets include:

```text
game/public/models/environment/pine_1.glb
game/public/models/environment/pine_2.glb

game/public/models/environment/fir_1.glb
game/public/models/environment/fir_2.glb
game/public/models/environment/fir_3.glb

game/public/models/environment/dry_tree_1.glb
game/public/models/environment/dry_tree_2.glb

game/public/models/environment/rock_1.glb
game/public/models/environment/rock_2.glb
game/public/models/environment/rock_3.glb
game/public/models/environment/rock_4.glb

game/public/models/environment/log_1.glb
game/public/models/environment/log_2.glb

game/public/models/environment/stump_1.glb
game/public/models/environment/stump_2.glb

game/public/models/environment/grass_1.glb
game/public/models/environment/grass_2.glb

game/public/models/environment/bush_1.glb
game/public/models/environment/bush_2.glb
game/public/models/environment/bush_3.glb

game/public/models/environment/birch_1.glb
game/public/models/environment/birch_2.glb
game/public/models/environment/birch_3.glb
```

Verify actual filenames before using them.

Do not assume an asset exists if it is not in the repository.

---

# 3. Remove Procedural Highlands Props

Inspect the Highlands environment-generation code.

Identify all props that are currently created from simple Babylon.js procedural geometry or equivalent primitives, such as:

```text
CreateBox
CreateCylinder
CreateSphere
CreatePolyhedron
CreateGround
CreatePlane
CreateDisc
CreateTorus
custom pyramids
stacked blocks
simple rock piles
primitive walls
```

Remove or replace the decorative Highlands-only procedural props.

Do not remove procedural geometry that is required for:

- terrain
- collision
- gameplay boundaries
- trigger volumes
- debug helpers
- invisible interaction volumes

Only remove visible decorative environment props.

---

# 4. Replacement Art Direction

The Highlands should feel:

```text
open
rocky
windy
elevated
sparse
rugged
less forested than the Forest region
```

Do not make the Highlands as dense as the Forest.

Use more open space between prop clusters.

Preferred visual distribution:

```text
open terrain
→ rock cluster
→ sparse pine / fir group
→ open clearing
→ dead tree / stump
→ large boulder cluster
→ another open area
```

Avoid uniform placement like:

```text
tree
rock
tree
rock
tree
rock
```

The environment should look clustered and natural.

---

# 5. Rocks

Use the AmiPolygon rock assets heavily.

Primary:

```text
rock_1.glb
rock_2.glb
rock_3.glb
rock_4.glb
```

Use them as:

- individual boulders
- small rock clusters
- larger visual anchors
- slope decoration
- edge decoration around hills

Vary:

- rotation
- scale
- grouping
- spacing

Do not over-randomize scale to the point that assets look distorted.

Suggested scale variation:

```text
0.8x – 1.3x
```

where visually appropriate.

Create some larger clusters with 2–5 rocks instead of placing every rock independently.

---

# 6. Trees

The Highlands should contain fewer trees than the Forest.

Primary trees:

```text
pine_1.glb
pine_2.glb
fir_1.glb
fir_2.glb
fir_3.glb
dry_tree_1.glb
dry_tree_2.glb
```

Use:

- small pine/fir groups
- isolated trees
- dead trees near rocky areas
- sparse tree lines

Avoid dense continuous forest.

Good pattern:

```text
2–4 trees grouped together
then a large open area
```

---

# 7. Ground-Level Props

Use small ground props lightly.

Suitable assets:

```text
grass_1.glb
grass_2.glb
bush_1.glb
bush_2.glb
bush_3.glb
stump_1.glb
stump_2.glb
log_1.glb
log_2.glb
```

Use these to break up flat terrain.

Do not spam them.

The Highlands should remain visually open.

---

# 8. Birch Usage

Birch can be used only in transition areas between Forest and Highlands.

Use:

```text
birch_1.glb
birch_2.glb
birch_3.glb
```

sparingly near the lower / greener edges of Highlands.

Do not place birch heavily in the central or higher Highlands.

---

# 9. Asset Placement Rules

Keep important gameplay areas readable.

Do not place props:

- on top of waypoint markers
- on top of spawn points
- inside dungeon entrances
- directly on quest interaction points
- inside boss arenas
- inside Hunt spawn zones if it blocks combat
- in front of camp entrances
- directly on paths
- on player spawn locations

Keep enough open space for:

- players
- mounts
- groups
- combat
- camera movement

---

# 10. Preserve Landmarks

Do not remove major existing Highlands landmarks.

Examples may include:

- Northern Camp
- Northern Ruins
- dungeon entrances
- world event areas
- waypoints
- spawn points
- quest / Hunt areas
- existing handcrafted POIs

Procedural decorative props around them may be replaced.

---

# 11. Performance

Use efficient asset reuse.

Do not load the same `.glb` from disk repeatedly for every instance.

Prefer:

```text
load once
→ cache
→ clone / instantiate
```

Reuse the project’s existing Babylon.js asset cache if one exists.

Do not introduce unnecessary new asset-loading systems.

The Highlands replacement should not significantly increase initial loading time.

Respect the current lazy / deferred region loading behavior.

If Highlands assets are currently deferred, keep them deferred.

---

# 12. Culling

Preserve existing environment culling.

All new AmiPolygon props should participate in the same distance-based visibility / culling system where applicable.

Do not bypass existing optimization logic.

---

# 13. Material / Style Consistency

Do not override the AmiPolygon materials unless required.

Keep the existing low-poly look.

Avoid adding:

- realistic PBR materials
- glossy surfaces
- high-detail textures
- post-processing only for Highlands
- inconsistent color grading

The goal is visual consistency with the rest of Neverfall.

---

# 14. Remove Obviously Procedural Visuals

After replacement, there should no longer be obvious decorative primitives that look like placeholders.

Examples to eliminate:

```text
large pyramids used as rocks
stacked geometric discs
rectangular block formations
simple procedural stone towers
generic primitive clusters
```

If any procedural prop still looks acceptable and intentional, it may remain, but only if it visually matches the AmiPolygon style.

---

# 15. Suggested Highlands Composition

Aim for a layout roughly like:

```text
Lower Highlands:
- a few birches
- pines / firs
- bushes
- smaller rocks
- logs / stumps

Mid Highlands:
- larger rock clusters
- sparse pine / fir groups
- dry trees
- open grassland
- occasional stump / log

Upper Highlands:
- more rocks / boulders
- fewer trees
- more dry trees
- very sparse bushes
- larger open areas
```

Do not create hard visual boundaries.

The Forest → Highlands transition should remain gradual.

---

# 16. Randomization

Use deterministic or existing seeded placement if the current system uses it.

Do not create new random placement on every client load if that causes multiplayer visual mismatch.

If procedural placement is currently deterministic, preserve that behavior.

The asset selection may vary among compatible AmiPolygon models, but placements must remain stable.

---

# 17. Acceptance Criteria

The task is complete when:

- obvious procedural decorative props are removed from Highlands
- primitive pyramids / block formations are no longer visually dominant
- AmiPolygon rocks replace procedural rocks
- AmiPolygon trees replace procedural tree-like shapes
- logs / stumps / bushes / grass are used sparingly
- Highlands still feel open and rocky
- Forest remains denser than Highlands
- important paths remain clear
- camps remain readable
- dungeon entrances remain accessible
- waypoints remain accessible
- Hunt areas remain playable
- boss / event areas remain playable
- environment culling still works
- asset caching is preserved / reused
- Highlands do not block initial world loading
- no major gameplay logic is changed

---

# 18. Testing

Verify:

## Visual

- no obvious placeholder pyramids
- no obvious stacked primitive rock props
- no obvious generic block walls used as decoration
- rock clusters look natural
- trees are sparse enough
- ground props are not overused

## Gameplay

Test movement through:

```text
Forest → Highlands transition
Northern Camp
Northern Ruins area
Highlands Hunts
world event areas
dungeon entrance
waypoint
spawn point
```

Make sure the player does not get stuck on newly placed props.

## Multiplayer

Verify clients see the same environment placement.

## Performance

Compare:

- load time
- draw calls if easy to inspect
- frame rate
- asset-loading behavior

Do not accept a large regression in performance just for decoration.

---

# Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current Highlands generation / environment code before changing anything.
3. Identify all visible Highlands decorative props created from procedural geometry.
4. Identify the existing AmiPolygon asset-loading / caching helpers.
5. Reuse those helpers where possible.
6. Replace visible procedural decorative Highlands props with AmiPolygon assets.
7. Use mainly:
   - rocks
   - pine / fir
   - dry trees
   - logs
   - stumps
   - sparse bushes
   - sparse grass
8. Use birch only near Forest → Highlands transition areas.
9. Keep Highlands less dense than Forest.
10. Preserve all gameplay-critical positions and systems.
11. Preserve deterministic placement if currently used.
12. Preserve environment culling.
13. Preserve lazy / deferred region loading.
14. Do not add a new asset pack.
15. Do not add Meshy assets.
16. Do not perform unrelated refactors.
17. Use JavaScript only.
18. Run relevant checks after implementation.
19. Test at least the Forest → Highlands transition and Northern Camp area.
20. In the final response, list every changed file with its exact path.
21. Also summarize:
    - which procedural prop types were removed
    - which AmiPolygon assets replaced them
    - whether any procedural visuals remain and why
    - whether asset caching / culling behavior changed
22. If the current architecture differs from the assumptions in this spec, adapt to the existing structure instead of forcing a rewrite.
