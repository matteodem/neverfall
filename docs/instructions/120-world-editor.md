# Heroes of Neverfall — World Editor Step 6B: Terrain Paint Export & Deployment

Read `AGENTS.md` and inspect the existing Terrain Painting implementation before making changes. Keep this task MVP-sized and reuse existing patterns.

## Requirements

1. Add an **Export Terrain Paint** button to the existing DaisyUI World Editor panel. Download all saved terrain-paint data as a single `terrain-paint.json` file, using a stable schema compatible with existing terrain chunks.
2. Add centralized `TERRAIN_PAINT_SOURCE` selection: default to **MongoDB in development** and **JSON in production**, with an environment-variable override for testing. Load exclusively from the selected source (no duplicate overlays); an absent/empty JSON file should fail gracefully.
3. Support the workflow: paint locally → export `terrain-paint.json` → place the file in the repository at the path expected by the loader → commit/push → Render deploy. Keep production JSON mode read-only: no terrain-paint mutation methods should be available to non-authorized clients.
4. Add clearly labeled **Undo** and **Redo** buttons (DaisyUI `btn`) in the Terrain Painting panel, not only a `Ctrl+Z` shortcut. Wire them to the existing brush-stroke history, ensure undone/redone strokes also update MongoDB in editable mode, and disable each button when no corresponding history exists. Keep any existing keyboard shortcut working.
5. Preserve terrain-color fidelity (Beige = existing path color; Bright Green = existing grass color), chunk reload behavior, World Objects, and normal gameplay. Keep painting/export responsive; do not regenerate the entire world per stroke.

## Scope / handoff

No terrain sculpting, new asset systems, or major refactors. Follow existing React/DaisyUI patterns and server-side permission checks. Do not run browser checks, builds, or extensive tests. Briefly report changed files, JSON destination path, environment-variable usage, and how to deploy the exported file.
