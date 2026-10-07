# Skill System Light

## Goal

Add a lightweight **skill loadout system**.

Each class has more skills available than can be equipped at once, but the player still uses exactly **4 skill buttons**.

Use JavaScript only. Keep it MVP-sized and mobile-friendly.

## Core Rules

- each class has roughly **6 available active skills**
- player equips exactly **4**
- existing 4 HUD skill buttons stay unchanged
- no fifth skill button
- no skill tree
- no talent points
- no respec system
- no passive skill system yet

## Skill Selection UI

Use a **HUD modal**, not right-click menus.

The modal should show:

```text
Equipped Skills
[1] [2] [3] [4]

Available Skills
<skill list>
```

Player selects an available skill and assigns/replaces one of the 4 slots.

Do not add drag & drop for MVP.

Make sure to add the tab "Skills" to the "Hero" modal. 
Make it toggle when pressing "O" (Don't forget to add the keyboard control to the help modal.)

## Restrictions

Skill loadout changes should only be allowed:

- outside combat

If the project already has a safe-zone / out-of-combat pattern that is cleaner, reuse it.

## Class Examples

Use existing real skills first and add only a small number of new ones if needed.

Suggested direction:

### Warrior

- existing basic attack / strike
- heavy attack
- damage buff
- heal
- charge
- whirlwind

### Ranger

- existing basic shot
- power shot
- speed buff
- heal
- multi shot
- trap

### Mage

- existing fire bolt
- fire burst
- fire nova
- heal
- arcane shield
- frost bolt

These names are examples. Reuse existing skill names / IDs where possible.

## Persistence

Persist the 4 equipped skill IDs per Character.

Example:

```js
equippedSkills: [
  "skillA",
  "skillB",
  "skillC",
  "heal",
]
```

Existing Characters should get a safe default loadout matching their current 4 skills.

## Validation

Server-side validate:

- Character ownership
- skill belongs to the Character's class
- skill exists
- exactly 4 valid equipped skills
- no invalid / arbitrary skill IDs
- loadout change is allowed outside combat

## Acceptance Criteria

- each class can have more than 4 available skills
- exactly 4 skills are equipped
- HUD action bar still has 4 buttons
- HUD modal allows replacing equipped skills
- equipped loadout persists
- existing Characters keep a valid default loadout
- Skill 4 Heal can still be equipped
- works on desktop and mobile
- no right-click-only interaction
- no skill tree / talent system added

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect existing class skill definitions, action bar, HUD modal patterns, combat state, Character persistence, Meteor methods, and Colyseus sync.
3. Reuse existing skill IDs / handlers instead of duplicating abilities.
4. Add one central skill catalog / class-skill mapping if needed.
5. Add a small Skills modal to the HUD.
6. Keep exactly 4 equipped skill slots.
7. Persist equipped skill IDs on the Character.
8. Provide safe defaults for existing Characters matching their current loadout.
9. Validate loadout changes server-side.
10. Block loadout changes while in combat.
11. Keep Heal available; do not add a fifth button.
12. Do not build skill trees, passive skills, talent points, or drag & drop.
13. Run relevant checks.
14. In the final response, list every changed file with its exact path.
