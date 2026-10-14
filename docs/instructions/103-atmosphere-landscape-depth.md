# Task 3 — Atmosphere & Landscape Depth

## Goal
Make Heroes of Neverfall feel like a bright, vibrant low-poly high-fantasy world, inspired by the provided reference image, with a clear blue sky and believable depth into the distance.

## TODO
- [ ] Inspect the existing Babylon.js scene, sky, fog, terrain, and rendering setup before changing anything.
- [ ] Improve the sky using a clean blue gradient or the simplest compatible existing solution; avoid a flat, dull background.
- [ ] Add **subtle distance fog** that gradually blends far-away scenery into pale blue atmospheric haze, while keeping nearby players, NPCs, camps, and landmarks crisp and readable.
- [ ] If practical with existing assets/architecture, add **lightweight distant mountain silhouettes** as non-interactive background scenery; do not build a new terrain system or block gameplay areas.
- [ ] Centralize atmosphere settings (fog color, start/end or density, sky colors, distance scenery) for easy tweaking.
- [ ] Verify visibility and performance on desktop and mobile, including distant landmarks and jumping-puzzle towers.

## Constraints
- **Preserve the current lighting, shadows, material colors, and brightness** from Tasks 1–2; do not retune them as part of this task.
- Keep changes MVP-sized, lightweight, and compatible with the current Babylon.js/Meteor architecture.
- Avoid thick fog, washed-out colors, unnecessary dependencies, and unrelated gameplay/collision changes.

## Done when
The foreground remains bright and colorful, the sky feels inviting, and distant scenery gently fades into blue atmospheric depth without hurting navigation or FPS.

## Codex instruction
Read `AGENTS.md` and this file, inspect the existing implementation, and implement only Task 3. Use the supplied fantasy landscape image as visual direction (not a request to reproduce every asset). List changed file paths and run relevant checks.
