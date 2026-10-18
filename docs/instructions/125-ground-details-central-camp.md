# Heroes of Neverfall — Step 7A: Richer Ground Details (Central Camp)

Read `AGENTS.md` and inspect the existing procedural vegetation and terrain painting implementations. Use the **“After” side of the Central Camp before/after reference image shared in the conversation** as the visual goal; if the image is not available in the repository, do not invent a file path.

Here's the path to the image: `docs/inspiration/central-camp-dirt-clearing.png`

## Goal
Make Central Camp feel more lush and detailed **using existing grass, flower, pebble, and shrub meshes/assets first**. Do not add or purchase new GLB assets.

## Implementation
- Improve procedural distribution: natural clusters, varied scale/rotation, more ground detail along dirt-path edges, around rocks and tents, and at the camp perimeter. Keep the central walking area readable and relatively clear.
- Respect the **underlying terrain type / saved paint data**: grass and flowers on green terrain only, not beige or brown; allow sparse pebbles on dirt. Don't infer terrain type from lit/rendered pixel colors.
- Preserve terrain painting changes and regenerate/update affected procedural details when painting changes, including after chunk reloads and when loading MongoDB or JSON terrain data.
- Use deterministic seeded placement so decoration doesn't jump around between reloads. Reuse existing meshes/loaders and keep density configurable with one or two simple constants.
- Keep performance suitable for the browser: avoid individual heavy meshes and unnecessary regeneration; respect chunk lifecycle, collision, and player/NPC paths. Never remove or modify manually placed World Objects.

## Scope
Focus on **Central Camp** for this MVP. Preserve Forest/Highlands behavior and existing World Editor controls, persistence, export, and Undo/Redo. Keep changes minimal; avoid browser checks, builds, web searches, or extensive tests. Briefly report files changed, configuration values, and any limitations.
