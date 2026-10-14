# Task 2 — Colors & Materials

## Goal
Match the **color palette and material feel** of the image with fantasy landscape (docs/instructions/101-environment-for-colors.png) while preserving Neverfall's stylized low-poly look.

## Requirements
- Inspect `AGENTS.md` and the existing Babylon.js scene, materials, and asset-loading code first.
- Use the reference image for art direction: **vibrant natural greens**, **warm golden-beige paths**, **cool blue-gray rocks/cliffs**, **rich evergreen trees**, **occasional orange/yellow foliage**, **bright turquoise water**, and **warm stone/wood architecture**.
- Harmonize the materials/colors of **all existing world environments and objects**, including landmarks, jumping-puzzle towers/platforms, ruins, buildings, trees, rocks, and terrain. Preserve useful differences between regions.
- Prefer a **small centralized palette/material configuration** and reuse it wherever practical. Avoid indiscriminately overwriting textures or imported GLB materials; adjust only where appropriate.
- Keep materials readable under the lighting/shadows implemented in Task 1. Avoid excessive saturation, gloss, or photorealism.
- **Do not** add new large assets, change geometry, collisions, gameplay, or multiplayer logic. Keep performance and mobile compatibility in mind.

## Done when
- Existing areas look cohesive and noticeably closer to the reference image.
- Landmarks and jumping puzzles also follow the palette; no obvious missed object categories.
- No gameplay regressions; relevant checks pass.

## Codex instructions
Implement only Task 2. List changed file paths and briefly explain palette choices. **Use the attached reference image** (provide it alongside this spec); do not claim a pixel-perfect match.
