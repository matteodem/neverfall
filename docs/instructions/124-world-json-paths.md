# Heroes of Neverfall — Standardize World JSON File Locations

Read `AGENTS.md` and inspect the existing World Objects and Terrain Paint JSON loading/export/sync implementations before changing anything.

- Standardize both deployed data files under `game/private/world/`: `world-objects.json` and `terrain-paint.json` (adjust the project root if needed). Move the existing files without changing their JSON data.
- Load both on the **Meteor server** via `Assets.getTextAsync('world/<filename>.json')`, following the existing server-to-client data flow; do not import private files into client code or expose arbitrary private-file access.
- Update all affected paths and logic: production JSON loaders, development **Sync from JSON** buttons, source selection (`WORLD_OBJECTS_SOURCE` and `TERRAIN_PAINT_SOURCE`), documentation, and any relevant asset/build references.
- Preserve the current download filenames (`world-objects.json`, `terrain-paint.json`), MongoDB editing in development, JSON-based production loading, validation, admin-only access, and existing World Editor/Terrain Painting functionality. Missing or invalid JSON should yield clear errors rather than silently deleting database data.
- Keep this migration small and avoid unrelated refactors. Do not run browser checks, builds, or extensive tests; report files changed and any manual verification needed.
