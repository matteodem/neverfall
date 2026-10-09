# Improve First Combat Encounter

## Goal

Make the first enemy fight happen quickly after spawning and feel clear, satisfying, and forgiving for a new player.

Keep this MVP-sized and reuse existing combat / onboarding systems.

Use JavaScript only.

## Requirements

- ensure the first enemy encounter happens shortly after spawn
- use an existing easy early-game enemy
- make the fight teach basic movement, attack, and Heal naturally
- improve hit feedback using existing combat / VFX / UI patterns
- improve enemy reaction / impact feedback where possible
- show clear reward feedback after the kill
- keep the encounter easy enough to feel satisfying, not punishing
- do not create a new tutorial framework

## Early Combat Flow

Aim for:

```text
spawn
→ move toward nearby enemy
→ basic attack
→ take a little damage
→ Heal is useful / understandable
→ enemy dies
→ clear loot / XP / reward feedback
```

Use actual existing early-game content and systems from the repository.

## Acceptance Criteria

- first fight happens quickly after spawn
- player can understand basic attack / movement / Heal
- hit feedback is clearer
- enemy reaction feels better
- reward feedback is obvious
- first enemy is not overly dangerous
- existing combat balance outside this encounter remains unchanged
- no duplicate tutorial / combat system is added

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current spawn flow, nearby enemies, combat input, Heal, hit feedback, enemy reactions, loot / XP feedback, and Adventure Guide.
3. Improve the first combat encounter using existing systems.
4. Keep the first fight forgiving and short.
5. Reuse current UI / VFX / combat helpers.
6. Do not redesign the combat system.
7. Do not rebalance unrelated enemies.
8. Run relevant checks.
9. In the final response, list every changed file with its exact path and summarize the first-combat improvements.
