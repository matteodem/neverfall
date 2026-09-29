# Adventure Guide Structure

## Goal

Keep the Adventure Guide useful without artificially stretching it to Level 10.

The guide should always show **one clear next objective** and should focus on meaningful existing content rather than filler level milestones.

The current `adventureGuide.js` already has the right basic pattern:

```js
return steps.find((step) => !step.done) || null;
```

Keep this behavior.

## Recommended Flow

Use the existing objectives, but reorder and simplify them so the player moves naturally through Neverfall.

### 1. Defeat 5 Boars

```js
{
  id: "boars",
  title: "Defeat 5 Boars",
  progress: `${Math.min(boarKills, 5)} / 5`,
  done: boarKills >= 5,
}
```

Purpose:

- teaches basic combat
- gives the player an immediate nearby objective

### 2. Loot an Item

```js
{
  id: "loot",
  title: "Loot an item",
  done: achievements.treasureHunter?.unlocked,
}
```

Purpose:

- introduces loot naturally after combat

### 3. Equip Your First Item

Move this earlier than in the current flow.

```js
{
  id: "equip",
  title: "Equip your first item",
  hint: "Open your Inventory and equip an item.",
  done: achievements.equipped?.unlocked,
}
```

Purpose:

- immediately connects loot with character progression

### 4. Complete Your First Hunt

```js
{
  id: "hunt",
  title: "Complete your first Hunt",
  hint: "Find a Hunt in the Quests menu.",
  done: guide.firstHunt,
}
```

Purpose:

- introduces the new Quests modal
- teaches the player that Hunts are world objectives

### 5. Open the World Map

```js
{
  id: "map",
  title: "Open the World Map",
  hint: "Press M or use the Map button.",
  done: guide.openedMap,
}
```

Purpose:

- prepares the player for travelling farther away from the starting area

### 6. Complete the Wolf Hunt

```js
{
  id: "wolf-hunt",
  title: "Complete the Wolf Hunt",
  progress: `${Math.min(wolfKills, 5)} / 5`,
  hint: "Find wolves northwest of the starting camp.",
  done: wolfKills >= 5,
}
```

Purpose:

- moves the player away from the starting camp
- introduces stronger enemies

### 7. Reach Level 5

Keep only one early level milestone instead of several filler milestones.

```js
{
  id: "level-5",
  title: "Reach Level 5",
  hint: "Complete hunts, quests, and fight enemies.",
  done: level >= 5,
}
```

Purpose:

- gives the player a short progression goal
- avoids unnecessary `Level 3` and `Level 7` steps

### 8. Hunt Goats in the Highlands

```js
{
  id: "goat-hunt",
  title: "Hunt Goats in the Highlands",
  progress: `${Math.min(goatKills, 5)} / 5`,
  hint: "Travel northwest into the Highlands.",
  done: goatKills >= 5,
}
```

Purpose:

- introduces the Highlands region
- gives the player a reason to explore beyond the starter area

### 9. Visit the Northern Camp

```js
{
  id: "camp",
  title: "Visit the Northern Camp",
  hint: "Find it on the World Map.",
  done: guide.visitedNorthernCamp,
}
```

Purpose:

- guides the player toward the Wolf Invasion area
- introduces another important world location

### 10. Final Guide Step

Do **not** force the player through filler content until Level 10.

After the meaningful objectives above are completed, show one final objective:

```js
{
  id: "explore",
  title: "Explore Neverfall",
  hint: "Try quests, world events, dungeons, bosses, and group content.",
  done: false,
}
```

This becomes the final persistent guide message until more content is added.

Alternatively, if the HUD should disappear after the guide is complete, return `null` instead.

## Remove These Current Steps

Remove these filler milestones from the current guide:

```text
Reach Level 3
Reach Level 7
Reach Level 10
```

The player can still reach those levels naturally through normal gameplay.

The Adventure Guide should point toward **content**, not repeatedly tell the player to grind levels.

## Suggested Final Step Order

```text
1. Defeat 5 Boars
2. Loot an item
3. Equip your first item
4. Complete your first Hunt
5. Open the World Map
6. Complete the Wolf Hunt
7. Reach Level 5
8. Hunt Goats in the Highlands
9. Visit the Northern Camp
10. Explore Neverfall
```

## Important Behavior

- Show exactly **one objective at a time**.
- Automatically move to the next objective when the current one is complete.
- Keep progress text where useful.
- Keep hints short.
- Do not block normal gameplay.
- Do not require the player to follow the guide in order to use other systems.
- Reuse existing achievement / adventureGuide state instead of creating duplicate progress tracking.

## Future Expansion

When more content is added, insert new meaningful objectives before the final `Explore Neverfall` step.

Good future candidates:

- Complete a World Event
- Complete your first Dungeon
- Defeat a Boss
- Join a Party
- Buy an item from the Vendor
- Reach a new region

Do not add these until the underlying content is ready and reliable.

## Codex Instructions

1. Read `AGENTS.md`.
2. Update the existing `adventureGuide.js` instead of creating a second guide system.
3. Keep the existing `steps.find((step) => !step.done)` behavior.
4. Reorder the current objectives according to this spec.
5. Remove the Level 3, Level 7, and Level 10 filler milestones.
6. Move `Equip your first item` earlier in the flow.
7. Add the final `Explore Neverfall` objective.
8. Reuse existing achievements and `character.adventureGuide` state.
9. Keep the implementation small and config-like.
10. Use JavaScript only.
11. Avoid unrelated refactors.
12. Run relevant checks after implementation.
13. In the final response, list every changed file with its exact path.
