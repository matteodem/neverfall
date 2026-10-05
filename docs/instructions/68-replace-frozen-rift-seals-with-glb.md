# Replace Frozen Rift Seals with GLB Asset

## Goal

Replace the current Frozen Rift Seal visuals with the new 3D asset:

```text
game/public/models/environment/frozen-rift-seal.glb
```

Use the existing Frozen Rift event / quest logic and only replace the visual representation unless a very small compatibility adjustment is required.

Use JavaScript only.

Keep the implementation MVP-sized and DRY.

## 1. Inspect Existing Frozen Rift Seal Implementation

Before changing anything:

1. Read `AGENTS.md`.
2. Inspect the current Frozen Rift event / quest implementation.
3. Find where the current seal visuals are created.
4. Identify whether the seals are currently procedural Babylon.js meshes, primitives, grouped meshes, or imported assets.
5. Identify the current seal positions, rotations, scale, interaction radius, activation logic, objective progress tracking, multiplayer synchronization, and cleanup / disposal logic.

Do not change gameplay behavior unless required for the asset replacement.

## 2. New Asset

Use:

```text
game/public/models/environment/frozen-rift-seal.glb
```

At runtime this should resolve from Meteor `public/` as:

```text
/models/environment/frozen-rift-seal.glb
```

Do not duplicate the asset into another folder.

## 3. Replace Only the Visual Seal Mesh

Replace the old / procedural Frozen Rift Seal visuals with the new GLB.

Preserve:

```text
existing seal positions
existing event phase logic
existing objective IDs
existing interaction logic
existing activation state
existing quest/event progress
existing multiplayer synchronization
existing rewards
```

Do not create new seals in different locations unless the current implementation is broken.

## 4. GLB Loading

Reuse the existing Neverfall environment asset loader / GLB cache where possible.

Preferred behavior:

```text
load frozen-rift-seal.glb once
→ cache the loaded source
→ clone / instantiate for each seal location
```

Do not fetch the same GLB separately for every seal.

If the project already has a reusable environment asset cache, use it instead of creating a new loader.

## 5. Placement

For each existing Frozen Rift Seal:

- preserve the current world position
- preserve the intended facing direction unless the new asset clearly needs a corrected rotation
- place the asset directly on the ground
- avoid floating
- avoid clipping too deeply into terrain
- keep scale visually appropriate compared with the player

Do not move the seals simply to make the asset fit.

Adjust only:

```text
scale
Y offset
rotation
```

when needed.

## 6. Interaction / Collider

Keep the current interaction logic independent from the visual mesh.

Do not rely on individual imported child meshes for gameplay interaction if the current system already has a stable interaction trigger.

Preferred:

```text
existing interaction trigger / radius
→ unchanged

new GLB
→ visual only
```

If a collider / trigger is currently attached to the procedural mesh, preserve the same effective interaction area using a simple invisible trigger or root node.

Do not make the player click a tiny rune mesh to activate the seal.

## 7. Activation State

If the Frozen Rift seals currently change state when activated, preserve that feedback.

Examples:

```text
inactive
→ active

dim
→ glowing

visible marker
→ completed state
```

Reuse the existing activation-state logic.

If the new GLB contains emissive / glowing materials, use them as-is where practical.

Do not add a large new shader system just for this asset.

If the current state is represented with color / emissive changes, apply the smallest compatible visual change to the imported asset.

## 8. Shadows

Use the project's normal environment shadow settings.

If the GLB is instantiated, do not set `receiveShadows` directly on Babylon.js `InstancedMesh` objects if that produces warnings.

Apply shadow settings to the source mesh / imported child meshes according to the existing world asset pattern.

Avoid introducing new console warnings.

## 9. Cleanup

When the event / region unloads:

- dispose only the player/event-specific seal instances
- do not destroy a shared cached source asset that other instances may still use
- preserve existing region / event cleanup behavior

Avoid memory leaks when the event starts multiple times.

## 10. Performance

The seals are repeated assets.

Use:

```text
asset caching
cloning / instancing where safe
```

Do not:

```text
reload the GLB for every seal
duplicate textures
create a separate material set unnecessarily for every seal
```

If activation visuals require per-seal material changes, clone only the affected material when needed.

## 11. Acceptance Criteria

The task is complete when:

- every Frozen Rift Seal uses `/models/environment/frozen-rift-seal.glb`
- old procedural / placeholder seal visuals are no longer shown
- existing seal positions remain correct
- seals are grounded properly
- scale is appropriate
- interaction still works
- event / quest objective progress still works
- activation state still works
- multiplayer behavior is unchanged
- rewards / event phases are unchanged
- the GLB is cached / reused rather than redundantly loaded
- cleanup still works
- no new Babylon.js warnings or errors are introduced

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the existing Frozen Rift event / quest and find the exact code that creates the seal visuals.
3. Replace only the current Frozen Rift Seal visual mesh with `game/public/models/environment/frozen-rift-seal.glb`.
4. Use the runtime URL `/models/environment/frozen-rift-seal.glb`.
5. Preserve all current seal positions, objective IDs, interaction logic, event phases, activation logic, multiplayer sync, and rewards.
6. Reuse the existing GLB / environment asset cache and load the source asset only once.
7. Clone / instantiate it for each existing seal location using the project's current asset pattern.
8. Adjust only scale, Y offset, and rotation as needed to ground the asset correctly.
9. Keep gameplay interaction separate from imported child meshes.
10. Preserve the existing activated/completed visual state with the smallest compatible change.
11. Do not add a new event system, interaction system, or shader framework.
12. Use JavaScript only.
13. Keep the implementation DRY and MVP-sized.
14. Run relevant checks.
15. Test all Frozen Rift seals through activation / completion if practical.
16. Verify repeated event starts / cleanup do not leak duplicate seal meshes.
17. Verify no new Babylon.js console warnings are introduced.
18. In the final response, list every changed file with its exact path.
19. Also report the code path where old seal visuals were replaced, how many seal instances use the GLB, the final scale / rotation / Y offset used, whether the asset is cloned or instantiated, and whether activation visuals required material changes.
