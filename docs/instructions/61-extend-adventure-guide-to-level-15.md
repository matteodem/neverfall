# Extend Adventure Guide to Level 15

## Goal

Extend the current Adventure Guide so it provides meaningful progression guidance all the way to the current max level:

```text
Level 15
```

The current guide effectively runs out of meaningful content around Level 8–10.

The goal is to extend it through:

```text
Highlands
→ Snowy Mountains
→ higher-level boss / dungeon content
→ Sunken Ruins
→ Level 15
→ open-ended exploration
```

Use the current existing Adventure Guide architecture.

Do not create a new tutorial system.

Use JavaScript only.

---

# 1. Preserve Existing Early Guide Structure

Keep the current early progression steps unless the repository shows that a step is outdated or broken.

Current flow includes content such as:

```text
Defeat 5 Boars
Loot an item
Equip your first item
Complete your first Hunt
Open the World Map
Defeat 10 Wolves
Visit Northern Camp
Reach Highlands Lookout
Kill 10 Goats
Loot the Jumping Puzzle Chest
Discover the Ancient Forest Shrine
Kill 10 Rats
Reach Level 10
Explore Snowy Mountains
Kill 10 Snow Wolves
Explore Neverfall
```

The objective of this task is mainly to extend and improve the guide after the mid-game section.

---

# 2. Move Ancient Forest Shrine Earlier if Needed

The current Ancient Forest Shrine objective appears after the Jumping Puzzle / Highlands content.

If the current progression makes the player travel back west into the Forest unnecessarily, move the Ancient Forest Shrine objective earlier.

Preferred position:

```text
Forest progression
→ Ancient Forest Shrine
→ Northern Camp / Highlands
```

Do not force this move if the current world layout / progression already makes the existing position more logical.

The guide should avoid unnecessary backtracking where practical.

---

# 3. Keep Reach Level 10 as a Transition Gate

Keep the existing:

```text
Reach Level 10
```

step.

This is acceptable because it should now act as a transition into Snowy Mountains content rather than being a filler endpoint.

Example:

```js
{
  id: "level-10",
  title: "Reach Level 10",
  progress: `${Math.min(character?.currentLevel ?? 1, 10)} / 10`,
  hint: "Complete Hunts and quests to earn XP.",
  done: (character?.currentLevel ?? 1) >= 10,
}
```

---

# 4. Snowy Mountains Progression

After Level 10, extend the guide through Snowy Mountains.

## Step — Explore Snowy Mountains

Keep / update:

```js
{
  id: "snowy",
  title: "Explore Snowy Mountains",
  hint: "Unlock the Snowy Mountains waypoint east of Central Camp.",
  done: waypoints.includes("snowy-mountains-waypoint"),
}
```

Use the actual waypoint ID from the repository.

Do not assume the current ID if it differs.

---

# 5. Snow Wolf Hunt

Keep the existing Snow Wolf objective.

Correct the visible text from:

```text
Snow Wolfs
```

to:

```text
Snow Wolves
```

Example:

```js
{
  id: "snow-wolf-hunt",
  title: "Kill 10 Snow Wolves",
  progress: `${Math.min(snowWolfKills, 10)} / 10`,
  hint: "Defeat snow wolves north of the Snowy Mountains waypoint.",
  done: snowWolfKills >= 10,
}
```

Use the actual current Snow Wolf achievement / tracking field.

---

# 6. Add a Snowy Mountains Landmark Objective

Add a meaningful exploration objective after the initial Snow Wolf progression.

Preferred objective:

```text
Discover a Snowy Mountains Landmark
```

Example concept:

```js
{
  id: "snowy-landmark",
  title: "Discover a Snowy Mountains Landmark",
  hint: "Explore the Snowy Mountains and discover one of its landmarks.",
  done: ...
}
```

Important:

- inspect the current repository for actual Snowy Mountains landmark IDs
- use real landmark IDs only
- do not invent `snowy-shrine`, `snowy-ruins`, or `snowy-lookout` unless they actually exist
- reuse `character.discoveredLandmarks` or the existing landmark discovery state

Conceptually:

```js
done: character?.discoveredLandmarks?.some((id) =>
  SNOWY_MOUNTAINS_LANDMARK_IDS.includes(id)
)
```

Keep the list config-driven if a landmark config already exists.

---

# 7. Add Reach Level 12

Add a Level 12 milestone after the player has started Snowy Mountains progression.

Example:

```js
{
  id: "level-12",
  title: "Reach Level 12",
  progress: `${Math.min(character?.currentLevel ?? 1, 12)} / 12`,
  hint: "Continue Hunts, quests and exploration in the Snowy Mountains.",
  done: (character?.currentLevel ?? 1) >= 12,
}
```

This step is intended as a progression gate between lower Snowy Mountains content and stronger encounters.

---

# 8. Add Snowy Mountains Boss Objective

Add an objective to defeat the existing Snowy Mountains boss.

Preferred title:

```text
Defeat the Snowy Mountains Boss
```

Do not invent the boss achievement ID.

Inspect the repository for the actual boss / achievement / quest tracking state.

Possible sources:

```text
achievement
quest progress
boss kill tracking
guide state
```

Use the most authoritative existing state.

Example concept:

```js
{
  id: "snowy-boss",
  title: "Defeat the Snowy Mountains Boss",
  hint: "Find and defeat the boss in the Snowy Mountains.",
  done: existingBossCompletionState,
}
```

Do not create duplicate boss tracking if an existing system already tracks the kill.

---

# 9. Add Waypoint Usage Objective

Add a lightweight objective that teaches / reinforces fast travel.

Preferred:

```text
Use a Waypoint
```

Example:

```js
{
  id: "waypoint-travel",
  title: "Use a Waypoint",
  hint: "Open the World Map and fast travel to an unlocked waypoint.",
  done: guide.usedWaypoint,
}
```

Important:

- first inspect whether waypoint travel is already tracked
- reuse existing waypoint usage state if available
- do not create a duplicate persistent field unless required
- if no waypoint-use tracking exists, add the smallest reliable persisted state

This should trigger when a player successfully completes a waypoint fast travel.

Do not count merely unlocking a waypoint.

---

# 10. Add First Dungeon Completion Objective

Add:

```text
Complete a Dungeon
```

after the player reaches the higher Snowy Mountains progression.

Use the existing dungeon-completion tracking.

Preferred example:

```js
{
  id: "dungeon",
  title: "Complete a Dungeon",
  hint: "Enter a dungeon and defeat its final boss.",
  done: achievements.firstDungeon?.unlocked,
}
```

Do not invent `firstDungeon` if the repository uses a different achievement / completion state.

If multiple dungeons exist, any successful dungeon completion should satisfy this step.

---

# 11. Add Reach Level 14

Add:

```text
Reach Level 14
```

as preparation for the current highest-level content.

Example:

```js
{
  id: "level-14",
  title: "Reach Level 14",
  progress: `${Math.min(character?.currentLevel ?? 1, 14)} / 14`,
  hint: "Prepare for the strongest content currently available.",
  done: (character?.currentLevel ?? 1) >= 14,
}
```

This should come shortly before Sunken Ruins.

---

# 12. Add Sunken Ruins Completion

Add the new Level 15 dungeon as one of the final guide objectives.

Preferred:

```text
Complete Sunken Ruins
```

Hint:

```text
Find Sunken Ruins south of Southwest Lake. Recommended Level: 15.
```

Example concept:

```js
{
  id: "sunken-ruins",
  title: "Complete Sunken Ruins",
  hint: "Find Sunken Ruins south of Southwest Lake. Recommended Level: 15.",
  done: existingSunkenRuinsCompletionState,
}
```

Important:

- use the actual Sunken Ruins dungeon ID
- use existing dungeon completion persistence
- do not invent an achievement if dungeon completion is tracked elsewhere
- this should only complete after the dungeon is actually finished, not merely entered

---

# 13. Add Reach Level 15

Add the current max-level milestone.

Example:

```js
{
  id: "level-15",
  title: "Reach Level 15",
  progress: `${Math.min(character?.currentLevel ?? 1, 15)} / 15`,
  hint: "Reach the current maximum level.",
  done: (character?.currentLevel ?? 1) >= 15,
}
```

This should occur near the end of the guided progression.

If Sunken Ruins is explicitly recommended for Level 15, inspect actual progression pacing and choose the more sensible order:

```text
Reach Level 15
→ Complete Sunken Ruins
```

or:

```text
Complete Sunken Ruins
→ Reach Level 15
```

Prefer:

```text
Reach Level 15
→ Complete Sunken Ruins
```

if entering / completing the dungeon at 15 is the intended experience.

The final ordering should follow the real current gameplay balance.

---

# 14. Final Explore Neverfall Objective

Keep the final persistent objective:

```text
Explore Neverfall
```

Update the hint to reflect the current game.

Suggested:

```js
{
  id: "explore",
  title: "Explore Neverfall",
  hint: "Try Hunts, quests, dungeons, world events, bosses, landmarks and group content.",
  done: false,
}
```

Only mention content that actually exists in the repository.

This should remain the final open-ended state after guided progression is complete.

---

# 15. Recommended Final Flow

Use the current implemented content to determine the exact final order.

Target flow:

```text
Forest basics
→ Wolves
→ Ancient Forest Shrine
→ Northern Camp
→ Highlands Lookout
→ Goats
→ Jumping Puzzle
→ Rats
→ Level 10
→ Snowy Mountains
→ Snow Wolves
→ Snowy Mountains Landmark
→ Level 12
→ Snowy Mountains Boss
→ Use a Waypoint
→ Complete a Dungeon
→ Level 14
→ Level 15
→ Complete Sunken Ruins
→ Explore Neverfall
```

If actual current progression indicates a slightly different order, adapt it.

Do not create awkward backtracking.

---

# 16. Use Existing State Wherever Possible

For every new step:

- inspect current achievements
- inspect quest progress
- inspect landmark discovery
- inspect waypoint state
- inspect dungeon completion
- inspect Adventure Guide state

Do not create duplicate tracking if existing authoritative state already exists.

Preferred order of reuse:

```text
existing gameplay completion state
→ existing achievement
→ existing quest progress
→ existing guide state
→ only then add a new persisted flag if absolutely necessary
```

---

# 17. Keep One Objective at a Time

Preserve the existing behavior:

```js
return steps.find((step) => !step.done);
```

The Adventure Guide should continue showing only one current objective.

Do not turn it into a full checklist UI.

---

# 18. Acceptance Criteria

The task is complete when:

- the Adventure Guide no longer effectively ends around Level 8–10
- guide progression continues meaningfully to Level 15
- Snowy Mountains has multiple guide objectives
- a Snowy Mountains landmark objective exists using real current landmark IDs
- Snow Wolves text is grammatically corrected
- Reach Level 12 exists
- the Snowy Mountains boss is represented
- waypoint travel is represented
- first dungeon completion is represented
- Reach Level 14 exists
- Reach Level 15 exists
- Sunken Ruins completion is represented
- the final `Explore Neverfall` step remains persistent
- no guide step references nonexistent content
- already-completed content is skipped correctly
- existing early-guide behavior still works
- persistence still works
- no duplicate progression tracking is introduced unnecessarily

---

# 19. Testing

Test with at least:

## Fresh Character

Verify guide progression advances in the intended order.

## Mid-Progress Character

Use a character around Level 8–10.

Verify already completed Forest / Highlands objectives are skipped.

## Level 10+ Character

Verify Snowy Mountains objectives appear correctly.

## Existing Advanced Character

Use a character that already has:

```text
Snowy Mountains waypoint
landmark discoveries
boss kills
dungeon completions
```

Verify completed steps are skipped automatically.

## Level 15 Character

Verify:

- Level 15 step is complete
- Sunken Ruins completion state is detected correctly
- final objective becomes `Explore Neverfall`

---

# Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current Adventure Guide implementation and current game content before changing anything.
3. Inspect:
   - achievement IDs
   - quest progress IDs
   - landmark IDs
   - Snowy Mountains waypoint ID
   - Snowy Mountains boss completion state
   - waypoint travel tracking
   - dungeon completion tracking
   - Sunken Ruins dungeon ID / completion state
4. Do not invent IDs or progression state.
5. Preserve the existing `steps.find((step) => !step.done)` model.
6. Extend the guide to Level 15 using actual implemented content.
7. Correct `Snow Wolfs` to `Snow Wolves`.
8. Consider moving Ancient Forest Shrine earlier to avoid unnecessary backtracking.
9. Add meaningful content steps around Level 10–15 rather than only adding level milestones.
10. Add Level 12, Level 14, and Level 15 progression gates where they support real content transitions.
11. Add Snowy Mountains landmark, Snowy boss, waypoint use, dungeon completion, and Sunken Ruins objectives using existing authoritative state.
12. Keep the final persistent `Explore Neverfall` objective.
13. Use JavaScript only.
14. Keep the change MVP-sized.
15. Do not perform unrelated refactors.
16. Run relevant checks.
17. Test fresh, mid-progress, Level 10+, and Level 15 character states.
18. In the final response, list every changed file with its exact path.
19. Also provide the final Adventure Guide step order.
20. Explicitly mention any requested objective that could not be added because the current repository has no reliable existing tracking state.
