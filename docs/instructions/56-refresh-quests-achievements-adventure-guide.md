# Refresh Quests, Achievements & Adventure Guide

## Goal

The current **Quests**, **Achievements**, and **Adventure Guide** are outdated compared with the current game state.

Update all three systems so they accurately reflect the gameplay that is currently implemented in the repository.

Important:

- Do not invent content that does not exist in the game.
- Inspect the current repository first.
- Base all updates on systems, enemies, regions, bosses, dungeons, progression, items, waypoints, world events, and exploration content that are actually implemented.
- Keep the update MVP-sized and consistent with existing architecture.
- Use JavaScript only.

The goal is to make these systems feel coherent again for the current version of Neverfall.

## 1. Audit the Current Game Before Editing Content

Before changing any quests, achievements, or Adventure Guide steps, inspect the repository and build a concise internal inventory of the current game content.

At minimum, identify:

- current regions
- current camps
- current waypoints
- current spawn points
- current enemy types
- current rare enemies
- current bosses
- current world events
- current dungeons
- current jumping puzzle / exploration landmarks
- current classes
- current level cap
- current equipment slots
- current consumables
- current shops / vendors
- current mounts
- current party features
- current map features
- current quest / hunt types
- current repeatable content
- current achievements
- current Adventure Guide state
- current onboarding state
- currently implemented progression milestones

Do not rely on old assumptions or comments if the actual code differs.

If old content references removed or renamed systems, update or remove those references.

## 2. Quests — Refresh Content and Progression

Inspect the current quest definitions and quest objective implementation.

Update the quest content so it better matches the current world and player progression.

### Requirements

- Preserve the existing quest system architecture.
- Reuse existing objective types.
- Do not introduce a new quest framework.
- Do not add quests for features that are not currently implemented.
- Keep progression understandable for a new player.

Review:

- quest names
- descriptions
- recommended levels
- objective counts
- enemy references
- boss references
- region references
- dungeon references
- event references
- rewards
- repeatable / one-time behavior
- world map markers
- quest availability conditions

### Progression Flow

Try to create a clearer progression through the actual current world.

A reasonable structure is:

```text
Starting Area / Forest
→ nearby Hunts / basic combat
→ first equipment / exploration
→ Highlands
→ Northern Camp / Highlands content
→ boss / world event / dungeon content
→ Snowy Mountains
→ higher-level enemies / bosses / exploration
```

Use the actual implemented content to determine the final sequence.

Do not force this exact flow if the repository currently has a different world progression.

### Hunt Quests

Audit all Hunt quests.

Check that:

- the target enemy still exists
- the enemy is located in the stated region
- objective counts are reasonable
- map hints are accurate
- recommended level is appropriate
- repeatable behavior still works
- rewards are appropriate relative to current progression

Remove or rewrite obsolete hunt text.

### Boss Quests

Check all boss-related quests.

Make sure the quest refers to the correct current boss entity.

Important:

- distinguish normal quest bosses from world-event variants
- do not accidentally use the Forest Giant Awakening event boss where the normal quest boss is intended
- ensure boss names and descriptions match current content

### Dungeon Quests

Audit quests that reference dungeons.

Make sure:

- dungeon names are current
- dungeon objective references are valid
- required level / progression makes sense
- quest text does not refer to removed dungeon layouts or bosses

Do not add dungeon quests if the dungeon is not currently playable.

### Exploration Quests

If the current quest system supports location / exploration objectives, use them where appropriate.

Potential existing content may include:

- camps
- waypoints
- landmarks
- jumping puzzle
- regions
- dungeon entrances

Only use locations that actually exist.

## 3. Achievements — Replace Outdated Milestones

Audit the full achievement configuration and all achievement trigger code.

The achievement list should represent the current game rather than an older early-alpha version.

### Keep Good Existing Achievements

Existing achievements should be preserved if they still make sense.

Useful categories include:

```text
Combat
Exploration
Progression
Equipment
Bosses
Dungeons
World Events
Social / Party
Mounts
Quests
```

Do not remove working achievements merely for the sake of rewriting them.

### Remove / Update Outdated Achievements

Check for achievements that:

- reference deleted enemies
- use obsolete level milestones
- refer to old quest structures
- reference removed mechanics
- have impossible conditions
- trigger from outdated fields
- duplicate newer systems

Fix them.

### Add Missing Achievements for Current Content

Where the current game has meaningful systems with no achievement coverage, add a small number of sensible achievements.

Possible examples, **only if these features exist in the repo**:

```text
Discover the Northern Camp
Unlock a waypoint
Discover the Snowy Mountains
Complete the jumping puzzle
Defeat a rare enemy
Defeat a boss
Complete your first world event
Complete your first dungeon
Equip an accessory
Use a consumable
Purchase something from a vendor
Join a party
```

Only add achievements when the system has a reliable existing trigger.

Do not create achievements that require large new backend systems just to track them.

### Achievement Count

Prefer a smaller, meaningful set rather than dozens of filler achievements.

For the current game, aim for roughly:

```text
15–25 meaningful achievements
```

if that fits the current architecture.

Do not force a specific number if more or fewer already make sense.

## 4. Adventure Guide — Rebuild It Around Current Progression

The Adventure Guide / “What To Do Next” should be refreshed so it guides new players through the current game.

It should not be a long tutorial checklist.

It should answer:

```text
What should I do next?
```

with **one useful objective at a time**.

### Remove Outdated Filler

Remove or replace steps that are only arbitrary level gates without meaningful gameplay.

Examples of weak progression:

```text
Reach Level 3
Reach Level 5
Reach Level 7
Reach Level 10
```

Level milestones are acceptable only when they unlock or naturally lead into meaningful content.

### Preferred Structure

Build the guide around actual actions and world progression.

A possible structure is:

```text
1. Defeat nearby starter enemies
2. Loot an item
3. Equip your first item
4. Complete your first Hunt
5. Open the World Map
6. Complete the next meaningful regional Hunt
7. Visit / unlock an important camp
8. Unlock or use a waypoint
9. Defeat a boss or rare enemy
10. Complete / discover meaningful Highlands content
11. Explore Snowy Mountains when level-appropriate
12. Try a dungeon / world event / group activity
13. Final persistent "Explore Neverfall" objective
```

This is only a template.

Codex must inspect the actual current game and adjust the order based on what exists and what level each activity is intended for.

### Final Objective

Once the guided early progression is complete, show a persistent final objective such as:

```text
Explore Neverfall
```

with a concise hint mentioning currently available end-of-guide activities.

Example concept:

```text
Try quests, Hunts, world events, bosses, dungeons, exploration, and group content.
```

Only mention content that currently exists.

The Adventure Guide should not simply disappear after the last early step unless the current UI is explicitly designed that way.

## 5. Adventure Guide State Tracking

Inspect how Adventure Guide completion is currently stored.

Reuse existing:

- achievement state
- quest state
- character progression state
- `adventureGuide` state
- map / region discovery state
- waypoint state

Avoid duplicating progression state if an existing system already tracks the condition.

Example:

If unlocking Northern Camp already has a persisted flag, use that flag instead of creating:

```js
adventureGuide.visitedNorthernCamp
```

unless the current architecture specifically needs it.

Use the most authoritative existing state.

## 6. Keep Quests, Achievements, and Adventure Guide Consistent

These three systems should complement one another instead of contradicting each other.

Example:

```text
Adventure Guide:
Complete your first Hunt

Quest System:
actual Hunt exists and is available

Achievement:
optional "First Hunt" achievement triggers on completion
```

Another example:

```text
Adventure Guide:
Visit Northern Camp

World:
Northern Camp exists

Waypoint:
Northern Camp waypoint can be unlocked

Achievement:
optional exploration achievement can trigger
```

Avoid three different names for the same activity.

Centralize labels / IDs where existing architecture allows it.

Do not perform a large architecture rewrite solely for naming consistency.

## 7. Validate Rewards

Review quest and achievement rewards against the current economy.

Check:

- Gold rewards
- XP rewards
- item rewards
- consumables
- accessories
- progression pacing

Avoid rewards that are clearly excessive relative to current shop prices / loot values.

Do not rebalance the whole economy in this task.

If rewards appear obviously inconsistent, make small corrections and explain them in the final report.

## 8. UI Text Cleanup

Review all visible text for these systems.

Fix:

- outdated enemy names
- outdated region names
- outdated dungeon names
- incorrect directions
- old keybind instructions
- awkward placeholder text
- inconsistent capitalization
- descriptions that no longer match gameplay

Keep text short and readable.

Do not turn quest descriptions into long lore paragraphs.

## 9. Preserve Existing Systems

Do not break:

- quest persistence
- Hunt repeatability
- quest progress tracking
- quest map markers
- achievements persistence
- achievement notifications
- Adventure Guide HUD
- Quests modal
- world map
- onboarding
- multiplayer
- character progression
- waypoint unlocking
- spawn points
- dungeon state
- world events

This task is primarily a **content and progression refresh**, with only small code changes where outdated tracking logic needs to be fixed.

## 10. Acceptance Criteria

The task is complete when:

- no quest references obviously removed or outdated game content
- all quest enemy / boss / region references resolve to real current content
- Hunt quests accurately describe their current enemies and regions
- boss quests reference the correct boss variants
- dungeon quests reference playable current dungeons
- achievements reflect the current game rather than the old early-alpha feature set
- obsolete achievements are removed or updated
- new achievements use existing reliable tracking wherever possible
- the Adventure Guide follows the current progression path
- the Adventure Guide presents one useful objective at a time
- arbitrary filler level steps are removed or reduced
- guide objectives use existing authoritative progression state where possible
- the final guide state leads into open-ended current game content
- quests, achievements, and guide terminology are consistent
- persistence still works
- repeatable Hunts still work
- existing UI still works
- no large unrelated refactor was introduced

## 11. Testing

At minimum, verify:

### Quests

- starter quest / Hunt availability
- Hunt progress
- Hunt completion
- repeatable Hunt behavior
- boss quest progress
- location objective progress if used
- dungeon quest progress if used
- rewards

### Achievements

Verify several categories manually:

- combat
- progression
- equipment
- exploration
- boss
- world event or dungeon if currently tracked

Ensure achievements do not repeatedly unlock after already being completed.

### Adventure Guide

Test with a fresh / low-progress character.

Verify:

```text
objective 1
→ completion
→ next objective
→ completion
→ next objective
```

Also test a character that already has progress.

The guide should skip objectives that have already been completed rather than forcing the player to redo them.

Test the final `Explore Neverfall` state.

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current repository before editing anything.
3. Find the exact files responsible for:
   - quest definitions
   - quest progression
   - Hunt definitions
   - achievements definitions
   - achievement progress / unlock logic
   - Adventure Guide objectives
   - Adventure Guide persistence
   - relevant world / region / boss / dungeon configs
4. Build the updated content from what is **actually implemented now**.
5. Do not blindly preserve old quest / achievement / guide assumptions.
6. Do not invent content.
7. Prefer reusing existing IDs, progression state, configs, and helper functions.
8. Keep changes MVP-sized.
9. Do not redesign the quest system architecture.
10. Do not redesign the achievement system architecture.
11. Do not redesign the Adventure Guide architecture unless required to fix outdated logic.
12. Use JavaScript only.
13. Preserve existing persistence behavior.
14. Run relevant checks after implementation.
15. Test fresh-character and already-progressed-character behavior.
16. In the final response, list every changed file with its exact path.
17. Also provide a concise summary containing:
    - quests added
    - quests changed
    - quests removed
    - achievements added
    - achievements changed
    - achievements removed
    - final Adventure Guide step order
18. Explicitly mention any outdated content that could not be safely updated because the current repository did not provide enough information.
