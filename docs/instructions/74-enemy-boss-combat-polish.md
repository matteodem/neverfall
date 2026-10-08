# Enemy / Boss Combat Polish

## Goal

Improve existing enemy and boss combat so fights feel more readable, reactive, and satisfying without adding a large new combat system.

Use JavaScript only. Keep it MVP-sized.

## Focus

Improve a small set of existing enemies / bosses first.

Priorities:

- clearer attack telegraphs
- stronger heavy attacks
- readable AoE warnings
- better hit / damage feedback
- use existing Buff / Debuff system where appropriate
- preserve current combat rules and balance unless a small tuning change is clearly needed

## Suggested Integrations

Use existing enemies / bosses where possible:

- Frost Boss:
  - telegraphed Frost Slam
  - short warning before impact
  - applies `slow`
- Ogre / Hammer Boss:
  - clearer heavy attack wind-up
  - stronger impact feedback
  - can apply `slow` or another existing control effect
- Drowned Warden:
  - one readable special attack
  - can apply `bleed` or another existing debuff if it fits current design

Do not give every enemy new mechanics.

## Requirements

- reuse existing enemy / boss AI architecture
- reuse existing Buff / Debuff system
- telegraphs should be easy to read on desktop and mobile
- use simple VFX / ground indicators where existing patterns allow
- keep server-authoritative damage / effects
- avoid large AI rewrites
- avoid adding many new assets
- preserve existing quest / event / dungeon hooks

## Acceptance Criteria

- selected bosses have at least one clearer telegraphed special attack
- heavy attacks are easier to anticipate
- AoE attacks have visible warning before damage
- relevant debuffs are applied through the existing status-effect system
- hit / impact feedback is improved
- combat still works for multiplayer
- no major performance regression
- unrelated enemies / systems remain unchanged

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect existing enemy AI, boss abilities, damage handling, VFX, AoE helpers, and Buff / Debuff code first.
3. Pick a small representative set of bosses / enemies; do not polish the entire game at once.
4. Reuse existing combat helpers and state.
5. Keep server authority for damage and status effects.
6. Add readable telegraphs before strong attacks.
7. Keep mobile readability in mind.
8. Do not redesign the full combat system.
9. Run relevant checks.
10. In the final response, list every changed file with its exact path and summarize each polished enemy / boss.
