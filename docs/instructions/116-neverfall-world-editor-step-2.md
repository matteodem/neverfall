# Neverfall — In-Game World Editor: Step 2 (Persistence)

Read `AGENTS.md` and the existing Step 1 editor implementation first.

## Goal
Persist editor-placed objects in MongoDB so they survive reloads and deployments.

## Requirements
- Add a `WorldObjects` MongoDB collection for editor-created objects only.
- Store `assetId`, `position`, `rotation`, `scaling`, and a stable `_id` (plus region identifier if the existing world architecture needs it). Do **not** store GLB files.
- Implement Meteor methods to create, update, and delete objects. **Validate all inputs and enforce admin authorization server-side** using the project's existing admin configuration.
- Load persisted objects into the Babylon.js world on startup; avoid duplicate meshes and clean up removed ones.
- Connect Step 1 placement, move/rotate gizmos, and deletion to persistence. Save **on placement confirmation / gizmo release**, not on every pointer movement.
- Ensure normal players can see saved objects after joining/reloading, but cannot edit them. Keep existing procedural world generation and multiplayer behavior intact.

## Scope
MVP only. No undo/redo, live cross-client editing synchronization, JSON export, or terrain editing. Reuse existing project patterns; keep changes minimal and split code logically. Report changed files with paths and any manual test steps. Do not run browser checks or automated tests.
