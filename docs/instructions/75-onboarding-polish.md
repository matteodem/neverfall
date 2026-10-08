# Onboarding Polish

## Goal

Improve the first **10–15 minutes** so new players understand what to do quickly and encounter less UI / progression friction.

Use JavaScript only. Keep it MVP-sized.

## Focus

- make the initial spawn / first objective clear
- ensure the first quest is easy to find
- improve Adventure Guide ordering for early progression
- introduce combat, loot, inventory, map, and waypoint systems at sensible moments
- reduce unnecessary popups / instructions
- keep mobile readability in mind
- preserve existing gameplay systems

## Requirements

- reuse the existing onboarding / Adventure Guide system
- do not create a second tutorial framework
- avoid long text walls
- show guidance only when relevant
- ensure early objectives do not send the player too far away
- make important early UI actions obvious
- preserve current quests, rewards, enemies, and progression unless a small sequencing fix is needed

## Suggested Early Flow

Aim for a clear sequence such as:

```text
Spawn
→ basic movement / combat
→ first nearby enemy objective
→ loot / inventory
→ first quest
→ map / waypoint
→ continue normal progression
```

Use the actual existing systems and content from the repository.

## Acceptance Criteria

- first objective is immediately understandable
- early progression has no obvious dead time
- Adventure Guide steps appear in a sensible order
- combat / loot / inventory / map guidance is concise
- onboarding works on desktop and mobile
- no duplicate tutorial system is added
- existing gameplay remains intact

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current onboarding, Adventure Guide, first quests, spawn flow, HUD hints, map, inventory, and waypoint logic.
3. Identify the main friction points in the first 10–15 minutes.
4. Improve sequencing and clarity using existing systems.
5. Keep text short and contextual.
6. Do not invent large new tutorial systems or quests.
7. Preserve existing progression and rewards unless a small ordering fix is clearly needed.
8. Run relevant checks.
9. In the final response, list every changed file with its exact path and summarize the onboarding improvements.
