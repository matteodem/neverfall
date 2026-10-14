# Task 1 — Lighting & Shadows

Read `AGENTS.md` and inspect the existing Babylon.js scene, lighting, asset-loading and world-spawning code first.

## Goal
Match the reference image's warm fantasy daylight and soft, consistent shadows **across the entire game world**.

## Requirements
- Set up/tune a warm directional sunlight, balanced ambient illumination and soft dynamic shadows.
- **ALL visible world objects must be considered for shadows**, not just players and trees: terrain, buildings, walls, rocks, vegetation, props, NPCs, enemies, **landmarks, towers, jumping-puzzle towers/platforms/stairs, bridges, ruins, dungeons and future spawned/imported GLB assets**.
- Make applicable meshes **cast and/or receive shadows** based on their role (e.g. terrain receives; elevated structures both cast and receive). Include meshes loaded or spawned later, not only objects present at scene initialization.
- Centralize shadow registration/configuration so new assets are covered automatically, with documented exceptions for transparent/effect-only meshes or performance reasons.
- Keep it performant: sensible shadow map settings, appropriate light/shadow range and no unnecessary duplicate shadow casters.
- Preserve gameplay, collisions, multiplayer behavior and mobile compatibility. No unrelated refactors.

## Acceptance criteria
- Test the forest **and** representative landmarks, towers/jumping puzzles, bridges and other regions: relevant meshes visibly cast/receive consistent shadows.
- Dynamically loaded/spawned assets are included automatically.
- No obvious shadow artifacts or major FPS regression; report any intentionally excluded meshes.
- Run relevant checks and list changed files and test results.
