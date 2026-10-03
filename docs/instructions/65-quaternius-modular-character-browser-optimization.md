# Optimize Quaternius Modular Characters for Browser

## Goal

Prepare the Quaternius modular fantasy character assets for efficient use in Neverfall.

The source assets are currently located under:

```text
game/public/models/characters/quaternius-fantasy
```

The modular fantasy outfit exports are located under:

```text
game/public/models/characters/quaternius-fantasy/Modular Character Outfits - Fantasy[Standard]/Exports/glTF (Godot-Unreal)
```

The current pack is modular and useful, but it is too heavy out of the box for a browser MMORPG because it contains:

```text
large PNG textures
multiple texture maps
.gltf + .bin + external textures
many separate modular files
```

Create a lightweight browser-ready pipeline without breaking modularity, rigs, skinning, or animation compatibility.

Use JavaScript only.

## 1. Inspect the Existing Quaternius Assets

Before changing anything, inspect:

```text
game/public/models/characters/quaternius-fantasy
```

and especially:

```text
game/public/models/characters/quaternius-fantasy/Modular Character Outfits - Fantasy[Standard]/Exports/glTF (Godot-Unreal)
```

Report:

- `.gltf` files
- `.bin` files
- texture files
- texture dimensions
- texture file sizes
- mesh counts
- material counts
- whether meshes are skinned
- whether files share the same skeleton / rig structure
- whether animations are embedded or separate
- whether modular parts use consistent bone names / transforms

Do not assume all parts are structured identically.

## 2. Preserve Modularity

This is critical.

The optimized result must still support:

```text
Male / Female
Heads
Hair
Body
Arms
Legs
Feet
Armor pieces
Accessories
Class outfits
```

Do not merge every character into one monolithic mesh.

Modular parts must remain independently usable so Neverfall can enable / disable parts per character configuration.

## 3. Convert to GLB

Convert the selected `.gltf + .bin + textures` assets from the Quaternius source folders into `.glb` where practical.

Benefits:

```text
fewer network requests
simpler loading
easier Babylon.js integration
```

Preserve:

- rig
- skinning
- materials
- mesh names
- node names
- bone names
- transforms

Do not break attachment compatibility between modular pieces.

## 4. Texture Optimization

The source textures are too large for browser use.

Target:

```text
512x512 for most character outfit textures
1024x1024 only when clearly needed
```

Avoid 2K / 4K textures unless there is a strong visual reason.

For each texture:

- resize while preserving aspect ratio
- keep visual quality appropriate for Neverfall's low-poly style
- report original and optimized resolution
- report original and optimized file size

Do not upscale smaller textures.

## 5. Remove Unnecessary Texture Maps

Neverfall uses a stylized low-poly look.

Audit whether all maps are visually necessary.

Potential maps include:

```text
BaseColor
Normal
ORM
Roughness
Metallic
```

Prefer the smallest useful material setup.

If Normal Maps add very little at normal gameplay distance, remove them.

If Roughness / Metallic / ORM can be simplified safely, do so.

Do not remove maps blindly.

Compare the visual result first.

Priority:

```text
BaseColor
→ keep

Normal
→ optional

ORM / Roughness / Metallic
→ simplify where practical
```

The goal is a clean low-poly look, not realistic PBR detail.

## 6. Geometry Optimization

Optimize geometry conservatively.

Use:

- quantization
- deduplication
- mesh optimization
- vertex/index cleanup
- Meshopt where Babylon.js compatibility is safe

Do not aggressively decimate character meshes if that risks:

- broken skinning
- bad silhouettes
- broken weights
- deformation issues

Character silhouette and rig stability are more important than maximum compression.

## 7. Preserve Skeleton / Skinning

This is critical.

Do not break:

- bone names
- bind poses
- skin weights
- inverse bind matrices
- node hierarchy
- shared rig compatibility

All modular parts intended for the same base character must remain compatible with the same skeleton.

If optimization changes any rig-related data, stop and report it instead of forcing the conversion.

## 8. Animation Compatibility

If animations are included:

- preserve clips
- preserve names
- preserve duration
- preserve frame timing
- preserve skeleton compatibility

If animations are not included in these modular parts, do not invent or bake new animations.

The optimized assets must remain compatible with the existing / future Neverfall animation retargeting workflow.

## 9. Output Organization

Do not overwrite the original Quaternius source assets immediately.

Keep the original files under:

```text
game/public/models/characters/quaternius-fantasy
```

Create a clean optimized output location, for example:

```text
game/public/models/characters/quaternius-fantasy/optimized
```

or the closest structure matching the repository.

The optimized output should be easy for the Neverfall client to load without depending on the original `.gltf + .bin + texture` layout.

## 10. Load Only What Is Needed

Do not preload every modular character asset at game startup.

Character parts should load on demand based on the selected character.

Example:

```text
Human Male Warrior
→ load male base
→ load selected head / hair
→ load Warrior outfit parts
→ load weapon
```

Avoid loading:

```text
all Male
all Female
all outfits
all accessories
```

for every player.

Reuse loaded parts through caching where practical.

## 11. Babylon.js Compatibility

Verify optimized GLBs load correctly through the existing Babylon.js asset loader.

Check:

- meshes appear
- materials render correctly
- skeleton exists
- skinning works
- modular parts align
- transforms are correct
- scale is correct
- no missing textures
- no console import warnings

Do not introduce a new rendering pipeline.

## 12. Performance Targets

Aim for practical browser budgets.

Suggested targets:

```text
individual modular GLB:
as small as reasonably possible

most textures:
512x512

hero / face textures:
up to 1024x1024 if needed
```

Do not enforce one exact file-size number if it damages visual quality.

The important goal is a major reduction compared with source assets.

## 13. Build an Optimization Script

Create a reusable script so future Quaternius character assets can be processed the same way.

Preferred workflow:

```text
npm run optimize-character-assets
```

The script should:

```text
scan source files under
game/public/models/characters/quaternius-fantasy

→ optimize textures
→ convert selected glTF assets to GLB
→ run safe geometry optimization
→ preserve rig / skinning
→ write optimized output
→ print before / after sizes
```

If the project already has an asset optimization script, extend it instead of creating a duplicate tool.

## 14. Recommended Tools

Prefer well-supported tooling such as:

```text
@gltf-transform/cli
Meshopt
Sharp
```

Only add dependencies if needed.

Avoid complex custom binary manipulation.

Use the smallest robust toolchain.

## 15. Safety Rules

Do not:

```text
destroy originals
merge all modular parts
rename bones arbitrarily
rename mesh parts unless required
change bind poses
bake skeletons incorrectly
remove skin weights
break Male / Female compatibility
break Babylon.js loading
```

If an optimization risks rig integrity, skip that optimization.

## 16. Acceptance Criteria

The task is complete when:

- selected Quaternius modular assets have optimized GLB equivalents
- source assets remain intact under `game/public/models/characters/quaternius-fantasy`
- large source textures are reduced to browser-friendly sizes
- unnecessary maps are removed or simplified where visually safe
- modular parts remain separate
- skeleton / skinning remain intact
- Male / Female assets still work
- outfit parts align correctly with their base body
- Babylon.js loads the optimized assets successfully
- no missing textures occur
- no obvious visual breakage occurs
- before / after file sizes are reported
- a reusable optimization command / script exists

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the source assets under:
   - `game/public/models/characters/quaternius-fantasy`
   - `game/public/models/characters/quaternius-fantasy/Modular Character Outfits - Fantasy[Standard]/Exports/glTF (Godot-Unreal)`
3. Identify which assets are actually needed for Neverfall.
4. Preserve modularity above all else.
5. Convert selected `.gltf + .bin + textures` to `.glb`.
6. Resize most textures to 512x512; allow 1024x1024 only where justified.
7. Remove Normal / ORM / Roughness maps only when visually safe.
8. Apply conservative geometry optimization only.
9. Preserve rigs, skinning, bone names, mesh names, and transforms.
10. Add or reuse a small repeatable optimization script.
11. Keep original Quaternius source assets intact.
12. Write optimized outputs to a dedicated optimized folder under `game/public/models/characters/quaternius-fantasy` or the closest matching structure.
13. Use JavaScript only.
14. Keep the implementation DRY.
15. Run relevant checks.
16. Test at least:
    - one Male base
    - one Female base
    - one Ranger or Warrior outfit
    - one Mage-style outfit if available
    - modular alignment after optimization
17. In the final response, list every changed file with its exact path.
18. Also report:
    - source size
    - optimized size
    - texture reductions
    - maps removed
    - geometry optimization applied
    - whether rig / skinning / animations were preserved
19. If a requested optimization would risk modular compatibility, skip it and explain why.
