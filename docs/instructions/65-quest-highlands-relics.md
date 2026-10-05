# Quest: Highlands Relics

## Goal

Add a one-time Level 9–10 progression quest called **Highlands Relics**.

This quest should improve progression variety by combining exploration / interaction objectives with one elite encounter.

Use existing Neverfall quest systems, world content, persistence, rewards, and UI.

Use JavaScript only.

Keep the implementation MVP-sized and DRY.

---

## Quest Overview

```text
Quest: Highlands Relics
Recommended Level: 9–10
Type: One-time progression quest
Region: Highlands
```

Core flow:

```text
Travel into the Highlands
→ investigate 3 existing relic / ruin interaction points
→ defeat an elite guardian
→ complete quest
```

---

## Requirements

Read `AGENTS.md` first.

Inspect the current:

- quest system
- one-time quest definitions
- objective types
- quest persistence
- reward helpers
- Highlands region content
- Highlands interactables / ruins / relics
- enemy definitions
- elite enemy patterns
- Adventure Guide

Do not invent IDs if an existing equivalent already exists.

Use actual repository IDs and world objects.

---

## Objectives

Suggested structure:

```text
1. Investigate Highlands Relic 1
2. Investigate Highlands Relic 2
3. Investigate Highlands Relic 3
4. Defeat the Highlands Relic Guardian
```

Prefer reusing existing Highlands:

```text
ruins
relics
stones
shrines
interaction points
```

If the region already has suitable objects, reuse them.

If suitable objects exist visually but have no quest interaction hook, add the smallest possible quest-specific interaction logic.

Do not create a new interaction framework.

---

## Elite Guardian

The final enemy should:

- reuse an existing enemy model / archetype where practical
- be stronger than a normal Highlands enemy
- be appropriate for Level 9–10
- not be a major world boss
- use existing combat / AI systems

Do not create a new 3D asset unless absolutely necessary.

---

## Rewards

Use existing quest reward patterns.

Suggested reward types:

```text
XP
Gold
optional existing item
```

Balance the XP so the quest meaningfully helps progression toward Level 10–11 without skipping too much content.

Do not massively rebalance unrelated XP values.

---

## Persistence

Quest progress must:

- persist on the Character
- survive reconnect
- prevent duplicate interaction credit
- prevent duplicate completion
- prevent duplicate rewards

Use the current server-authoritative quest flow.

---

## Multiplayer

Use existing kill-credit rules.

Interaction progress should belong to the individual Character unless current quest architecture intentionally shares that progress.

Do not add a new multiplayer quest-credit system.

---

## Adventure Guide

Inspect the current Adventure Guide after implementation.

If appropriate, add a small guide step that points the player toward **Highlands Relics** around Level 9.

Do not duplicate the quest's individual objectives in the Adventure Guide.

---

## Acceptance Criteria

The task is complete when:

- `Highlands Relics` exists as a one-time Level 9–10 quest
- it uses 3 exploration / interaction objectives
- it ends with an elite guardian encounter
- real Highlands world IDs are used
- quest progress persists
- rewards are server-authoritative
- rewards cannot be claimed twice
- the existing quest UI is reused
- the quest is not implemented as a Hunt
- no unrelated gameplay systems are rewritten

---

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect existing quest, Highlands, interaction, enemy, persistence, reward, and Adventure Guide code.
3. Use actual IDs and existing world content.
4. Add one one-time quest named `Highlands Relics`.
5. Reuse three existing Highlands relic / ruin / interaction locations where possible.
6. Reuse an existing elite enemy archetype for the final guardian where practical.
7. Keep reward values consistent with current progression.
8. Do not implement this as a Hunt.
9. Do not create a new quest framework.
10. Use JavaScript only.
11. Keep the implementation DRY and MVP-sized.
12. Run relevant checks.
13. Test reconnect / persistence if practical.
14. Verify rewards cannot be claimed twice.
15. In the final response, list every changed file with its exact path.
16. Also report the quest ID, reused world IDs, elite enemy ID, XP reward, Gold reward, and any Adventure Guide change.
