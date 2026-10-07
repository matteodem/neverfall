# Buffs & Debuffs

## Goal

Add a small reusable **Buff / Debuff system** for players and enemies.

Keep it MVP-sized, server-authoritative, and easy to extend.

Use JavaScript only.

## Initial Effects

- `bleed` — damage over time
- `poison` — damage over time
- `slow` — reduced movement speed
- `damageUp` — temporary damage increase
- `speedUp` — temporary movement speed increase

## Gameplay Integration

Use only a few representative examples:

- Bees can apply `poison`
- Snow Wolves can apply `slow`
- Ogre / Hammer Boss heavy attacks can apply `slow` or a short control effect if an equivalent already exists
- Warrior gets `damageUp` as a secondary effect from an existing skill
- Ranger gets `speedUp` as a secondary effect from an existing skill
- Mage keeps Skill 4 as Heal
- Do **not** add a fifth skill button
- Do not give effects to every enemy

## Requirements

- central config for effect definitions
- duration support
- optional stacking only where useful
- server-authoritative apply/remove logic
- automatic expiry
- relevant effects synchronized to clients
- small HUD icons for active player effects
- simple visual feedback where existing VFX patterns allow
- reuse existing combat / damage / movement code
- avoid duplicate timers and duplicated status logic

## Acceptance Criteria

- effects can be applied and removed cleanly
- DoT damage is server-authoritative
- movement modifiers affect real movement speed
- `damageUp` affects real outgoing damage
- effects expire automatically
- HUD shows active player effects
- multiplayer state stays consistent
- existing skills and enemy behavior remain intact
- no fifth player skill is added
- Mage Skill 4 remains Heal

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect existing combat, movement, enemy attack, player skill, HUD, Meteor, and Colyseus patterns first.
3. Implement one reusable status-effect system instead of per-enemy custom logic.
4. Reuse existing helpers and architecture where possible.
5. Keep the first pass limited to the five effects above.
6. Integrate only a few representative enemies / skills.
7. Do not rebalance the whole game.
8. Do not add resistances, dispels, immunities, or complex effect categories yet.
9. Run relevant checks.
10. In the final response, list every changed file with its exact path.
