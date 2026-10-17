# Neverfall World Editor — Step 3: JSON Export & Source Selection

Implement a minimal export/deployment workflow for existing World Objects. Read `AGENTS.md` and inspect the current editor, Meteor methods, and loading logic first. Keep changes small and preserve Steps 1–2.

## Requirements

- Use **one** version-controlled JSON file for every region: `world-objects.json` (include all objects; no per-region files). Choose one clear location in the repository and use it consistently.
- Centralize data-source selection: `WORLD_OBJECTS_SOURCE` environment variable, supporting `mongodb` and `json`. Default to `mongodb` when `Meteor.isDevelopment`, otherwise `json`. Allow overriding the default (including local `json` testing). Validate unsupported values.
- **MongoDB mode:** Retain the existing admin-only create/update/delete flow and load objects from MongoDB.
- **JSON mode:** Load World Objects from the bundled `world-objects.json` and render them for all players. Do not also load MongoDB objects (avoid duplicates). Treat JSON mode as read-only; disable editor writes/server mutations for World Objects.
- Add an admin-only **Export World** button to the existing editor UI. Export the complete MongoDB World Objects collection as a **downloadable** `world-objects.json` file, not merely text in the UI. Include stable IDs, asset references, position, rotation and scaling (plus any currently required metadata); exclude Mongo-only internals. Ensure a deterministic output order.
- Do **not** write directly into the repository from the browser: download the file so I can replace the tracked JSON, commit and deploy it manually.
- Keep admin permission checks on the server for export and all mutations. Never expose private configuration or unrestricted database reads.
- Make sure the JSON file is bundled and available in Render production. Handle missing/invalid JSON with a clear error instead of silently falling back to MongoDB.

## Acceptance criteria

1. Local default: editor reads/writes MongoDB and exports a downloadable `world-objects.json`.
2. Local with `WORLD_OBJECTS_SOURCE=json`: only tracked JSON data appears, no MongoDB duplicates, edits disabled.
3. Production default: all players see objects from JSON; no edit writes.
4. Existing world generation, movement and multiplayer still work.

No region splitting, automatic database sync, JSON import UI, undo/redo, or live synchronization. Run only focused checks relevant to changed files, and summarize the changed paths and how to test each mode.
