# Heroes of Neverfall — Step 7B: AmiPolygon Ground Vegetation

Read `AGENTS.md` and inspect the actual GLB assets under `game/public/models/environment/amipolygon/` and the existing procedural vegetation, terrain painting, and chunk-loading code.

## Goal
Make **Central Camp's grassy borders and path edges** noticeably richer and closer to the previously discussed "After" reference, without overcrowding the playable dirt clearing.

## Tasks
1. Select **2–3 suitable grass variants** and **1–2 small bush variants** from the existing AmiPolygon files; use their real paths, not guessed filenames. Keep the existing white flowers.
2. Extend the existing procedural vegetation generation to place these assets in **natural, irregular clusters**, with subtle deterministic variation in rotation and uniform scale. Prioritize grassy areas near Central Camp and dirt-path edges; leave the main camp clearing and paths walkable.
3. Respect the **effective terrain paint data**, including persisted MongoDB/JSON paint and chunk reloads: no grass or bushes on beige/brown dirt. Preserve manually placed World Objects and existing vegetation where sensible.
4. Reuse loaded GLB resources and use efficient instancing where supported; avoid duplicate downloads, excessive draw calls, and stale objects after chunk unloading or repainting.
5. Keep density and placement distances easy to tune in a small central configuration. **Limit visual changes to Central Camp** for this step; do not redesign Forest or Highlands.

## Constraints
- MVP-sized, minimal changes; no new packages or assets.
- Preserve multiplayer, World Editor, Undo/Redo, and existing persistence/export behavior.
- Do not run browser checks, builds, or extensive tests.
- Report chosen asset filenames, changed files, and any important performance caveats.
