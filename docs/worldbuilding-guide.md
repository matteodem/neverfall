# Heroes of Neverfall — Worldbuilding Guide

*A beginner-friendly guide to editing the game world and publishing your changes.*

## 1. How it works

Build the world **locally** with Neverfall's in-game World Editor. You can make two kinds of changes:

- **World Objects:** Place and adjust 3D assets such as fences, rocks, tents, and decorations.
- **Terrain Paint:** Paint the ground with colors such as grass green, path beige, and brown.

Your local changes are saved in **MongoDB**. To publish them, export **two separate JSON files** into the game project, commit them with Git, and deploy the updated game to Render.

**Workflow:** Edit locally → Save to MongoDB → Export both JSON files → Test JSON locally → Commit & push → Deploy on Render.

The World Editor exports both JSON files for `game/private/world/`. Meteor loads them on the server using `Assets.getTextAsync('world/<filename>.json')`.

## 2. Open the World Editor

1. Start Neverfall **locally** in development mode and log in with an authorized admin account.
2. Enter the game world.
3. Press **Ctrl + Shift + R** to turn the World Editor on or off.
4. Choose **World Objects** to work with 3D assets, or **Terrain Painting** to change ground colors.

The editor is intended for authorized admins, not regular players.

## 3. Place and edit World Objects

- **Place:** Choose an asset from the library and click the terrain.
- **Move:** Select a placed object and move it with the controls.
- **Rotate:** Turn the selected object with the rotation controls.
- **Scale:** Resize an object proportionally (all axes together), if the Scale tool is available.
- **Delete:** Remove an unwanted object.

The asset list may be organized into categories such as **Nature** and **Structures**. The JSON stores the asset's ID and its position, rotation, and scale—not the actual `.glb` model.

Changes are saved to **local MongoDB**. If your editor has a manual Save action, use it before exporting.

**Tip:** Work on a small area, like Central Camp, and walk through it from a player's perspective before moving on.

## 4. Paint the terrain

1. Switch to **Terrain Painting** in the World Editor.
2. Choose a ground color (for example, light green for grass or beige for paths).
3. Adjust the **Brush Size** and, if available, **Brush Gradient** (edge softness).
4. Paint the ground with the mouse.
5. Use the **Undo** and **Redo** buttons to correct mistakes. **Ctrl + Z** may also undo strokes.

Terrain Painting changes **ground colors**, not terrain height. Vegetation may also respond to painted colors: green areas can have grass and flowers, while beige/brown ground is intended to stay clear. Check the actual result in-game.

Terrain paint changes are saved in the **local MongoDB** terrain-paint data, separately from World Objects.

## 5. Export both JSON files

When you're happy with your changes, export **each type of data separately** from the World Editor:

| Editor action | Downloaded file | Replace this file in the project |
| --- | --- | --- |
| **Export World** / **Export World Objects** | `world-objects.json` | `game/private/world/world-objects.json` |
| **Export Terrain Paint** | `terrain-paint.json` | `game/private/world/terrain-paint.json` |

Steps:

1. Click the export button for **World Objects** and save the downloaded `world-objects.json`.
2. Click **Export Terrain Paint** and save `terrain-paint.json`.
3. Copy both downloaded files to `game/private/world/`, **replacing the older copies**.
4. Confirm both files appear in your Git changes.

The intended structure is:

```text
game/
  private/
    world/
      world-objects.json
      terrain-paint.json
```

These files are bundled as **server-side assets** and loaded by Meteor on the server. The 3D `.glb` assets referenced by World Objects still need to be included in your game separately.

Missing or invalid JSON produces a load error. Sync validates the complete file before replacing MongoDB data; a validation failure leaves the collection unchanged.

> **Important:** Saving to MongoDB does not automatically update either JSON file. Export again after making changes. If you only changed one category, you only need to re-export that category, but check both files before deployment.

## 6. Test the exported files locally

Before publishing, verify that the game loads the same JSON data that production will use.

1. Start Neverfall locally with **both** data sources set to JSON:

   ```bash
   WORLD_OBJECTS_SOURCE=json TERRAIN_PAINT_SOURCE=json meteor
   ```

   Run this from the Meteor project directory, or apply these variables to your usual startup command.
2. Enter the world and check that objects appear at the correct positions and scales.
3. Check that painted ground colors appear correctly, including after terrain chunks reload.
4. Confirm no World Objects are duplicated and there are no unexpected gaps in the painted terrain.
5. Switch back to **MongoDB mode** to continue editing:

   ```bash
   WORLD_OBJECTS_SOURCE=mongodb TERRAIN_PAINT_SOURCE=mongodb meteor
   ```

**JSON mode is intended to be read-only.** Continue editing in local MongoDB mode.

### Which source is used?

| Environment | World Objects source | Terrain Paint source |
| --- | --- | --- |
| Local development (default) | MongoDB | MongoDB |
| Live production (default) | JSON | JSON |

`WORLD_OBJECTS_SOURCE` controls World Objects and `TERRAIN_PAINT_SOURCE` controls Terrain Painting. Each can be overridden independently. Don't load the same data from both sources simultaneously.

## 7. Sync existing JSON back into local MongoDB

If you want to start editing from the world layout stored in the project, use the editor's separate import/sync actions (if implemented):

- **Sync World Objects from JSON:** Replaces local MongoDB World Objects with the contents of `game/private/world/world-objects.json`.
- **Sync Terrain Paint from JSON:** Replaces local MongoDB terrain-paint data with the contents of `game/private/world/terrain-paint.json`.

Open the editor in **local development mode**, choose the corresponding button, read the confirmation warning, and confirm only when you want to **overwrite local unsaved edits**. These operations should be admin-only. Syncing is **not automatic**.

> The local JSON files represent what is in your current working copy. They match the live version only if those files are from the Git commit currently deployed on Render.

## 8. Publish changes with Git and Render

1. Make sure the latest exported files are in:
   - `game/private/world/world-objects.json`
   - `game/private/world/terrain-paint.json`
2. If you added any new GLB assets, include those files and their asset configuration changes too.
3. Commit and push your changes to the branch Render deploys:

   ```bash
   git add .
   git commit -m "Update Neverfall worldbuilding"
   git push
   ```

4. Open the **Render dashboard** and confirm that a new deployment started. If automatic deployments are disabled, deploy the latest commit manually.
5. Wait for Render to report a successful deployment.
6. Open live Neverfall and inspect both the placed objects **and** terrain colors.

**The live server reads the committed JSON assets**, not your local MongoDB collections. You do not need to transfer the local database to Render.

## 9. Common problems

| Problem | What to check |
| --- | --- |
| Objects appear locally but not live | Did you export and replace `world-objects.json`, commit, and deploy? |
| Terrain paint appears locally but not live | Did you export and replace `terrain-paint.json`, commit, and deploy? |
| Objects or paint disappear in local JSON mode | Are the corresponding `*_SOURCE=json` variables set, and are both files in `game/private/world/`? |
| Missing 3D models | Are the referenced `.glb` files and asset configurations included in the deployment? |
| Duplicate objects | Make sure World Objects load from only one source and aren't loaded twice. |
| Terrain paint disappears when moving around | Check that paint is reapplied when terrain chunks reload. |
| The editor doesn't open | Are you an authorized admin, running the intended environment, and using **Ctrl + Shift + R**? |
| Sync erased local changes | Sync replaces local MongoDB data; restore from backups or re-exported JSON if available. |
| Render isn't showing updates | Check the deployed Git commit and Render build/deployment logs. |

## 10. Quick checklist before every deployment

- [ ] Checked World Objects in local MongoDB mode.
- [ ] Checked Terrain Painting in local MongoDB mode.
- [ ] Exported fresh `world-objects.json` and/or `terrain-paint.json` for everything changed.
- [ ] Replaced the relevant files in `game/private/world/`.
- [ ] Tested locally with both `WORLD_OBJECTS_SOURCE=json` and `TERRAIN_PAINT_SOURCE=json`.
- [ ] Included new `.glb` assets or configuration changes, if any.
- [ ] Committed and pushed the changes.
- [ ] Confirmed Render deployed the intended Git commit.
- [ ] Checked both objects and terrain colors in the live game.

**Remember:** MongoDB is your **local editing workspace**. The two JSON files in `game/private/world/` are your **published World Objects and Terrain Paint data**.
