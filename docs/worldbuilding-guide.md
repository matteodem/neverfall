# Heroes of Neverfall — Worldbuilding Guide

*A beginner-friendly guide to editing the game world and publishing your changes.*

## 1. How it works

You build the world **locally** using Neverfall's in-game World Editor. Your edits are saved in your local **MongoDB** database. When you're happy with the result, you export the objects into one file called **`world-objects.json`**. You then add this file to Git and deploy the updated game to Render.

**Workflow:** Edit locally → Save to MongoDB → Export JSON → Test JSON → Commit & push → Deploy on Render.

> This guide assumes World Editor Steps 1–3 have been implemented. Exact button labels and file locations may differ slightly depending on the implementation.

## 2. Open the World Editor

1. Start Neverfall locally in development mode and log in with an authorized admin account.
2. Enter the game world.
3. Press **Ctrl + Shift + R** to turn the World Editor on or off.
4. Open the editor's asset list and choose an object, such as a fence.

The editor is intended for authorized admins, not regular players.

## 3. Build your world

- **Place:** Select an asset and click the ground to place it.
- **Move:** Select an existing object and use the move controls.
- **Rotate:** Use the rotation controls to turn the selected object.
- **Delete:** Select an unwanted object and delete it.

Changes are saved to **local MongoDB** by the editor. If saving is manual in your version, use the editor's Save action before exporting.

**Tip:** Work on one small area at a time (for example, Central Camp), then walk around to check the result from the player's perspective.

## 4. Export your changes

1. When you're satisfied, click **Export World** in the editor.
2. The editor downloads **`world-objects.json`**.
3. Copy this file into the project's configured world-data location, **replacing the previous exported file**.
  * The file is located under `game/imports/api/worldObjects/world-objects.json`
4. Check that the file is included in your Git changes.

This JSON contains the **asset references and placement information** (position, rotation, and scale). It does **not** contain the actual 3D models: the corresponding GLB files still need to be part of the game.

> Important: Export again after making further changes. Editing the world in MongoDB alone does **not** update the JSON file or the live game.

## 5. Test the exported world locally

Before publishing, test the same data that the live server will load.

1. Start the game with the environment variable **`WORLD_OBJECTS_SOURCE=json`**.
2. Enter the world and verify that the exported objects appear in the right locations.
3. Check that no objects are missing or duplicated.
4. Switch back to **`WORLD_OBJECTS_SOURCE=mongodb`** (or your normal development default) to continue editing.

The JSON mode is **read-only**: switch back to MongoDB mode to make edits.

### Which data source is used?

| Environment | Default world-object source | Editing |
| --- | --- | --- |
| Local development | MongoDB | Enabled for admins |
| Live production | JSON | Disabled / read-only |

The **`WORLD_OBJECTS_SOURCE`** setting overrides the default when needed. Use only **one source at a time** to avoid duplicate objects.

## 6. Publish your changes with Git and Render

1. Make sure the latest **`world-objects.json`** is in the correct project folder.
2. If you added any new GLB assets, include them in the Git commit too.
3. Commit and push your changes to the branch that Render deploys:

```bash
git add .
git commit -m "Update Neverfall world layout"
git push
```

4. Open your **Render dashboard** and confirm the new deployment started. If automatic deploys are disabled, manually deploy the latest commit.
5. Wait for Render to report that the deployment succeeded.
6. Open the live game and check the changed areas.

**The live server reads the exported JSON**, not your local MongoDB collection. You do not need to copy your local database to production.

## 7. Common problems

| Problem | What to check |
| --- | --- |
| Changes appear locally but not live | Did you export again, replace the correct JSON file, commit, and deploy? |
| Objects disappear when testing JSON locally | Is `WORLD_OBJECTS_SOURCE=json` set? Is the exported JSON in the path expected by the loader? |
| Missing models | Are the referenced GLB files present and deployed? |
| Duplicate objects | Is the loader reading both MongoDB and JSON, or loading the same objects twice? Only one source should be active. |
| Editor doesn't open | Are you logged in with an authorized admin account? Is the build-mode shortcut enabled? |
| Render isn't showing the update | Check the deployed Git commit and Render build/deploy logs. |

## 8. Quick checklist before every deployment

- [ ] World objects are placed correctly in local MongoDB mode.
- [ ] Exported a fresh `world-objects.json`.
- [ ] Replaced the project's previous JSON export.
- [ ] Tested locally with `WORLD_OBJECTS_SOURCE=json`.
- [ ] Included all new GLB assets, if any.
- [ ] Committed and pushed the changes.
- [ ] Confirmed Render deployed the latest commit.
- [ ] Checked the live world in the browser.

**Remember:** MongoDB is your **local editing workspace**. `world-objects.json` is the **published world layout**.
