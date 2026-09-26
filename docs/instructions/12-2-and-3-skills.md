# Warrior Skills: Digit2 + Digit3

## Goal

Add two simple Warrior combat skills.

Keep the implementation:

- MVP-sized
- DRY
- server-authoritative for damage
- compatible with the existing combat/action bar architecture

Reuse the current basic attack animation for both skills for now.

---

## Digit2 — Heavy Strike

- Key: `2`
- Single-target melee attack
- More damage than the basic attack
- Longer cooldown than Digit1
- Reuse the current basic attack animation

Suggested values:

```js
damageMultiplier: 2
cooldown: 4000
```

---

## Digit3 — Cleave

- Key: `3`
- Melee AoE attack
- Hits multiple nearby enemies
- Medium cooldown
- Reuse the current basic attack animation

Suggested values:

```js
damageMultiplier: 1.25
cooldown: 6000
range: 2.5
```

Keep the AoE implementation simple.

---

## Action Bar

```text
1 = Basic Attack
2 = Heavy Strike
3 = Cleave
4 = Heal
```

Use the existing cooldown UI for Digit2 and Digit3.

Also add icons from `react-icons` for both the buttons.

---

## Out of Scope

Do not add:

- new animations
- skill trees
- rage/mana
- combo systems
- status effects
- new dependencies

---

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current combat and action bar implementation.
3. Reuse existing attack/cooldown patterns.
4. Keep damage server-authoritative.
5. Keep changes small and DRY.
6. Run relevant checks after implementation.
