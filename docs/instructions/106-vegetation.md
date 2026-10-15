# Task 5: Vegetation Polish

## Goal
Make the existing low-poly fantasy world feel more alive and varied without changing terrain, paths, lighting, shadows, or gameplay.

## Tasks
- Inspect `game/public/models/environment` first and **reuse existing suitable GLB/3D assets** (trees, bushes, grass, flowers, rocks) rather than creating duplicates.
- Add small, natural-looking clusters of grass tufts, flowers, bushes, and stones; vary scale, rotation, density, and subtle colors.
- Introduce variety in existing trees where assets permit, but preserve each region's visual identity.
- Place vegetation on the **existing terrain surface** and keep spawn areas, camps, paths, rivers, landmarks, jumping puzzles, and player/NPC movement clear.
- Reuse meshes/materials and apply instancing or thin instances where appropriate; avoid excessive draw calls and heavy collision meshes.
- Make densities and placement rules easy to configure; use deterministic placement so objects do not shift on every load.

## Acceptance criteria
- Natural variation with intentional open spaces; no uniform/random-looking scatter.
- No floating or buried assets, blocked gameplay areas, visual clipping, or noticeable FPS regression.
- Existing lighting, shadows, terrain, multiplayer, and mobile compatibility remain intact.

## Codex instructions
Read `AGENTS.md` and inspect the environment asset directory and current world-generation code before editing. Keep the implementation MVP-sized; list changed file paths and run relevant checks. Do not add paid assets or unrelated features.
