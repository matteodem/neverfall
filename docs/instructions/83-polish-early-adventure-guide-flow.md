# Polish the Early Adventure Guide Flow

## Goal

Polish the first **10–20 minutes** of the existing Adventure Guide so the early game feels clear, varied, and well-paced.

Keep this MVP-sized. Do not build a new tutorial system.

Use JavaScript only.

## Target Flow

Aim for:

```text
combat
→ loot
→ exploration
→ quest / hunt
→ mini-boss
```

Use the real existing Adventure Guide steps and game content from the repository.

## Requirements

- review the current first 10–20 minutes of Adventure Guide steps
- remove dead time and unnecessary backtracking
- keep objectives short and easy to understand
- ensure the next interesting activity is always obvious
- avoid too many simultaneous HUD instructions
- preserve existing progression / quest systems
- reuse current Adventure Guide tracking instead of creating duplicate state

## Early-Game Notes

Preserve the intended early progression where applicable:

```text
Boars → Wolves → Forest Giant
```

The Forest Giant should remain the early mini-boss moment after the Wolf objective if that is already implemented.

Also ensure the early loot step makes sense with the existing guaranteed first-kill loot behavior.

## Acceptance Criteria

- early Adventure Guide pacing feels continuous
- no obvious dead time or pointless backtracking
- objectives feel varied
- the player always has a clear next step
- early combat / loot / exploration / mini-boss content is introduced naturally
- HUD remains uncluttered
- no duplicate tutorial / quest tracking is added

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current Adventure Guide steps and first 10–20 minutes of progression.
3. Reorder / simplify existing steps where useful.
4. Remove redundant or poorly timed early steps.
5. Keep objectives concise and varied.
6. Reuse existing quest / hunt / kill / discovery tracking.
7. Do not invent large new content or systems.
8. Preserve existing rewards and progression unless a tiny sequencing fix is required.
9. Run relevant checks.
10. In the final response, list every changed file with its exact path and summarize the old vs new early Adventure Guide flow.
