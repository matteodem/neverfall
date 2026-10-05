# Quest: Frozen Disturbance

## Goal

Add a one-time Level 11–13 progression quest called **Frozen Disturbance**.

This quest should provide a more varied Snowy Mountains progression activity than another kill-count Hunt.

Use existing Neverfall quest systems, world content, persistence, rewards, and UI.

Use JavaScript only.

Keep the implementation MVP-sized and DRY.

---

## Quest Overview

```text
Quest: Frozen Disturbance
Recommended Level: 11–13
Type: One-time progression quest
Region: Snowy Mountains
```

Core flow:

```text
Enter Snowy Mountains
→ activate / investigate 3 existing seals, relics, or magical objects
→ defeat a named elite
→ complete quest
```

---

## Requirements

Read `AGENTS.md` first.

Inspect the current:

- quest system
- one-time quests
- Snowy Mountains world content
- interaction objective types
- seals / runes / shrines / ruins
- event objects that can be safely reused
- Snowy Mountains enemies
- elite enemy patterns
- quest persistence
- reward helpers
- Adventure Guide

Do not invent IDs when an existing object or enemy already fits.

Do not duplicate the existing Adventure Guide landmark-discovery objective for the Frozen Stone Arch or any similar landmark.

---

## Objectives

Suggested structure:

```text
1. Activate / investigate Snowy objective 1
2. Activate / investigate Snowy objective 2
3. Activate / investigate Snowy objective 3
4. Defeat the Frozen Disturbance elite
```

Prefer existing world objects such as:

```text
seals
runes
shrines
stone structures
magical objects
ruins
```

If existing objects need a quest interaction hook, add only the smallest required logic.

Do not build a new interaction system.

---

## Named Elite

The final enemy should:

- reuse an existing Snowy Mountains model / archetype where practical
- be clearly stronger than a normal enemy
- be appropriate for Level 11–13
- use existing AI and combat systems
- not require a new boss architecture

Choose a name consistent with existing Neverfall naming.

Examples only if they fit the current naming style:

```text
Frostbound Guardian
Frozen Warden
Rift Guardian
```

---

## Rewards

Use existing reward helpers.

Suggested:

```text
XP
Gold
optional consumable or equipment reward
```

Balance the quest around Level 11–13 progression.

Do not broadly rebalance unrelated Snowy Mountains content.

---

## Persistence

Quest progress must:

- persist on the Character
- survive reconnect
- prevent duplicate interaction credit
- prevent duplicate elite completion
- prevent duplicate rewards

Use the current server-authoritative quest architecture.

---

## Multiplayer

Use existing kill / participation credit logic.

Do not introduce a separate multiplayer quest system.

Interaction objectives should remain Character-specific unless current quest architecture already works differently.

---

## Adventure Guide

If appropriate, add a small guide step that points the player toward **Frozen Disturbance** in the Level 11–13 range.

Do not duplicate each seal / interaction objective in the Adventure Guide.

Do not replace landmark-discovery objectives with this quest.

---

## Acceptance Criteria

The task is complete when:

- `Frozen Disturbance` exists as a one-time Level 11–13 quest
- it contains 3 Snowy Mountains interaction objectives
- it ends with a named elite encounter
- real world / enemy IDs are used
- it does not duplicate Frozen Stone Arch discovery
- quest progress persists
- rewards are server-authoritative
- duplicate rewards are impossible
- existing quest UI is reused
- the quest is not a Hunt
- unrelated gameplay systems remain unchanged

---

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect existing quest, Snowy Mountains, interaction, elite enemy, persistence, reward, and Adventure Guide code.
3. Use actual repository IDs and existing world objects.
4. Add one one-time quest named `Frozen Disturbance`.
5. Reuse three suitable Snowy Mountains seals / relics / magical interaction points where possible.
6. Do not duplicate the Frozen Stone Arch or another Adventure Guide landmark objective.
7. Reuse an existing enemy archetype for the named elite where practical.
8. Keep rewards consistent with Level 11–13 progression.
9. Do not implement this as a Hunt or World Event.
10. Do not create a new quest framework.
11. Use JavaScript only.
12. Keep the implementation DRY and MVP-sized.
13. Run relevant checks.
14. Test reconnect / persistence if practical.
15. Verify rewards cannot be claimed twice.
16. In the final response, list every changed file with its exact path.
17. Also report the quest ID, reused world IDs, elite enemy ID, XP reward, Gold reward, and Adventure Guide change.
