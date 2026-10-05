# Quest: Trouble at Southwest Lake

## Goal

Add a one-time Level 14–15 progression quest called **Trouble at Southwest Lake**.

The quest should lead the player into Southwest Lake content and end with the existing Level 18 boss southwest of the lake.

Use existing Neverfall quest systems, world content, boss logic, persistence, rewards, and UI.

Use JavaScript only.

Keep the implementation MVP-sized and DRY.

---

## Quest Overview

```text
Quest: Trouble at Southwest Lake
Recommended Level: 14–15
Type: One-time progression quest
Region: Southwest Lake
```

Core flow:

```text
Travel to Southwest Lake
→ investigate the area
→ defeat a small number of stronger local enemies
→ defeat the existing Level 18 boss southwest of the lake
→ complete quest
```

---

## Requirements

Read `AGENTS.md` first.

Inspect the current:

- quest system
- Southwest Lake region
- local enemies
- existing Level 18 boss southwest of the lake
- boss ID
- boss spawn
- boss combat state
- boss kill / participation credit
- quest persistence
- reward helpers
- Adventure Guide

Do not create a duplicate boss.

Do not guess the boss identifier.

Use the existing boss already present in the repository.

---

## Objectives

Suggested structure:

```text
1. Investigate Southwest Lake
2. Defeat a small number of stronger Southwest Lake enemies
3. Defeat the existing Level 18 Southwest Lake boss
```

Keep the normal kill count small.

Suggested range:

```text
3–5 enemies
```

Use the amount that best matches the current quest pacing.

This quest should not feel like another repetitive Hunt.

---

## Boss Requirement

The existing Level 18 boss southwest of Southwest Lake must remain the final objective.

Preserve its existing:

- model
- spawn
- stats
- combat behavior
- loot / reward behavior
- level
- multiplayer logic

Do not weaken it purely for this quest unless a small balance adjustment is clearly necessary and justified.

The encounter should still feel dangerous for Level 14–15 players.

---

## Rewards

Use existing quest reward helpers.

Suggested:

```text
large XP reward
Gold
optional meaningful existing item
```

This should help close the Level 14–15 progression path.

Do not grant so much XP that earlier progression becomes irrelevant.

---

## Persistence

Quest progress must:

- persist on the Character
- survive reconnect
- prevent duplicate investigation credit
- prevent duplicate boss completion
- prevent duplicate rewards

Use the existing server-authoritative quest architecture.

---

## Multiplayer

Use existing boss participation / kill-credit rules.

Do not create special quest-only boss credit unless current architecture requires a small compatibility hook.

The quest should correctly complete for eligible participating players according to current Neverfall rules.

---

## Adventure Guide

If appropriate, update the Adventure Guide to point Level 14–15 players toward **Trouble at Southwest Lake**.

The guide should point toward the quest, not duplicate every quest objective.

After this quest, the guide can point the player toward existing Level 15 content such as Sunken Ruins if that matches the current progression.

---

## Acceptance Criteria

The task is complete when:

- `Trouble at Southwest Lake` exists as a one-time Level 14–15 quest
- it includes a Southwest Lake investigation objective
- it includes a small local enemy objective
- the final objective uses the real existing Level 18 boss southwest of the lake
- no duplicate boss is created
- quest progress persists
- boss credit follows existing multiplayer rules
- rewards are server-authoritative
- rewards cannot be claimed twice
- existing quest UI is reused
- the quest is not a Hunt
- unrelated gameplay systems remain unchanged

---

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the existing quest system and Southwest Lake implementation.
3. Find the real existing Level 18 boss southwest of the lake and use its actual ID.
4. Do not create a duplicate boss.
5. Add one one-time quest named `Trouble at Southwest Lake`.
6. Reuse existing Southwest Lake enemies for the small kill objective.
7. Keep the normal kill requirement small and non-grindy.
8. Preserve the boss's existing combat / spawn / multiplayer behavior.
9. Use current server-authoritative quest persistence and rewards.
10. Update the Adventure Guide only if needed for Level 14–15 progression.
11. Do not implement this as a Hunt or World Event.
12. Do not create a new quest framework.
13. Use JavaScript only.
14. Keep the implementation DRY and MVP-sized.
15. Run relevant checks.
16. Test reconnect / persistence if practical.
17. Test that boss completion and rewards cannot trigger twice.
18. In the final response, list every changed file with its exact path.
19. Also report the quest ID, boss ID, reused enemy IDs, XP reward, Gold reward, and any Adventure Guide change.
