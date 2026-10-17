# Heroes of Neverfall — In-Game World Editor (Step 1)

Read `AGENTS.md` and inspect the existing Babylon.js world, React HUD, and admin access patterns before changing code.

Implement a **minimal admin-only Build Mode** directly in the running game:

1. Toggle the editor **on/off with `Ctrl+Shift+R`**. Prevent the browser's default shortcut behavior where possible, and ignore the shortcut while typing in inputs/textareas.
2. Show a small React/DaisyUI editor panel while enabled, initially offering only `game/public/models/environment/fence.glb`.
3. Select the fence and click on the **actual terrain** to place it at the picked ground position.
4. Click an editor-placed fence to select it; use Babylon.js gizmos to **move and rotate** it. Avoid conflicting with normal movement/camera controls while editing.
5. Keep placements **in memory only** for now. **No MongoDB, exports, multiplayer sync, terrain editing, or extra features** in Step 1.

Keep changes MVP-sized, reuse existing scene/asset infrastructure, preserve the procedural world and normal gameplay when Build Mode is off, and enforce admin access beyond simply hiding the UI. Briefly list changed files and any manual verification steps. **Do not run browser checks or automated tests.**
