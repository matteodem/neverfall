# Neverfall World Editor — Step 4: Asset Library & Preview

Implement a small, configurable asset library for the existing in-game World Editor. **Keep the scope MVP-sized.** Read `AGENTS.md` and inspect the existing editor/asset-loading code first; reuse its patterns.

## Requirements

1. Create a central asset registry (e.g. `worldEditorAssets.js`) keyed by stable `assetId`:
   ```js
   export const WORLD_EDITOR_ASSETS = {
     fence: {
       name: 'Wooden Fence',
       path: '/models/environment/fence.glb', // verify actual path
       category: 'Structures',
     },
   };
   ```
   Preserve the existing `fence` ID/path; add only a few **existing** GLB assets whose paths are verified in the repository. Never invent files. Use the registry for editor asset selection and loading.
2. Add an **Asset Library** to the current React editor UI, using **DaisyUI components/classes wherever practical** (panel, tabs/filter, cards, buttons, labels, loading indicators). Show asset names and filter by category (e.g. **All**, **Nature**, **Structures**), with categories derived from the registry rather than hardcoded per asset.
3. Allow choosing any registered asset and placing it using the **existing placement workflow**. Keep existing selection, move, rotate, delete and `Ctrl+Shift+R` toggle working.
4. Add a **small real 3D preview of the selected GLB** in the panel. Reuse Babylon.js and cached loaded assets where practical; provide basic lighting, a fitted camera and loading/error states. Preview must not interfere with gameplay input or the main scene. **Only preview the selected asset**—no thumbnail generation for every asset yet.
5. Preserve Step 2/3 persistence and export: continue saving only `assetId` + transforms (and existing fields) to MongoDB / `world-objects.json`; do not store GLB paths in saved objects. Existing saved `fence` objects must still load correctly.

## Constraints

- Minimal changes; no new large dependencies, routing, or editor framework.
- Keep current admin-only access and `WORLD_OBJECTS_SOURCE` behavior unchanged.
- Clean up preview resources on change/unmount; avoid duplicate downloads/scene leaks.
- Follow existing code conventions; list files changed and briefly explain how to register a new GLB asset.
- Run only focused checks that are already available; avoid lengthy test suites or browser automation.
