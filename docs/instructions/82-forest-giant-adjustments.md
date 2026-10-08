# Forest Giant Early Mini-Boss Rework

## Goal

Turn the existing **Forest Giant** into the first strong early-game mini-boss moment.

The Forest Giant is already prominently placed on a hill northeast of Central Camp, so reuse that encounter instead of adding a new boss.

Use JavaScript only. Keep this MVP-sized.

## Forest Giant Changes

- change the Forest Giant to **Level 3**
- keep its current location / hill placement
- keep it visually prominent
- make it soloable by a Level 3 player
- keep it noticeably harder than normal Wolves
- target fight length: roughly **45–90 seconds**
- player should need to use movement / dodging and likely Heal
- allow a few mistakes without making every hit nearly lethal
- keep escape / disengage possible

Do not turn it into a trivial normal mob.

## Combat Readability

Preserve / improve:

- clear heavy-attack telegraphs
- readable special attacks
- enough reaction time for a new player
- clear hit / impact feedback

Reuse existing boss / combat polish systems where possible.

## Adventure Guide

Add a new Adventure Guide step directly after:

```text
Kill 10 Wolves
```

New step:

```text
Defeat the Forest Giant
```

Suggested description:

```text
A Forest Giant has been spotted on the hill northeast of Central Camp.
```

Use the actual existing Forest Giant ID / tracking logic from the repository.

Do not create duplicate kill counters or boss state.

## Rewards

Reuse the current Forest Giant reward logic.

Only adjust rewards if clearly necessary for a Level 3 early-game boss.

Do not create a new reward system.

## Acceptance Criteria

- Forest Giant is Level 3
- encounter remains on the existing hill
- Level 3 players can reasonably solo it
- fight still feels like a mini-boss
- strong attacks are readable
- player can disengage / escape
- Adventure Guide adds `Defeat the Forest Giant` immediately after `Kill 10 Wolves`
- guide progress uses the existing Forest Giant kill state
- no duplicate objective tracking is introduced
- unrelated bosses / enemies remain unchanged

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the existing Forest Giant config, stats, AI, rewards, combat telegraphs, and Adventure Guide implementation first.
3. Rebalance the existing Forest Giant for Level 3 rather than creating a new enemy.
4. Preserve its current world position.
5. Keep the encounter challenging but fair for a new Level 3 player.
6. Reuse existing boss / enemy helpers and status-effect logic where relevant.
7. Add the Adventure Guide step directly after `Kill 10 Wolves`.
8. Reuse the existing Forest Giant kill / progression state; do not create duplicate tracking.
9. Do not modify unrelated enemies, quests, or world layout.
10. Run relevant checks.
11. In the final response, list every changed file with its exact path and summarize:
    - old vs new Forest Giant level / stats
    - combat tuning
    - Adventure Guide insertion point
    - reward changes, if any
