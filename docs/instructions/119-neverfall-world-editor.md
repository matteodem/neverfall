# Heroes of Neverfall — World Editor Step 6A: Terrain Painting (MVP)

Read `AGENTS.md` and inspect the existing Babylon.js terrain generation, vertex colors, chunk lifecycle, and in-game World Editor before making changes.

Implement a minimal **Terrain Paint** mode in the existing Build Mode (`Ctrl+Shift+R`):

1. Add a **Terrain Paint** tool to the existing React/DaisyUI editor UI, with **5 preset colors** (light green, dark green, brown, beige, gray) and a **DaisyUI range slider** for brush radius.
2. While the tool is active, allow painting on terrain with left-click/drag using Babylon.js picking; modify **terrain vertex colors only**, not terrain elevation, meshes, or object transforms. Keep normal gameplay/editor controls from conflicting with painting.
3. Apply paint efficiently to nearby vertices only; avoid rebuilding the world or reloading meshes on every mouse move. Respect the existing low-poly terrain and any separate riverbank meshes.
4. **Persist paint locally in MongoDB** through admin-authorized Meteor methods, using a compact, stable world-space representation that can be reapplied after procedural chunk regeneration/reloading. Save at the end of a stroke (not on every mouse move). Ensure the paint is restored when the affected terrain loads again.
5. Preserve all existing World Editor object placement, MongoDB/JSON world-object workflows, multiplayer, and procedural terrain generation. Existing unpainted areas must retain their generated colors.

**Out of scope:** JSON export/import and production deployment (Step 6B), undo/redo, texture painting, terrain sculpting, and advanced brush blending.

Keep the implementation MVP-sized and use DaisyUI components wherever applicable. Do not run browser checks, builds, or extensive tests. Briefly report changed files, how paint is stored/restored, and any limitations (especially terrain vertex density and chunks).
