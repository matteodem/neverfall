# Neverfall — Boss Health Bar

## Goal

Add a dedicated boss health bar to the HUD during boss encounters.

Keep it small, DRY, and reuse existing boss/enemy health state.

---

## Behavior

When the player is fighting a boss, show:

- boss name
- current HP
- max HP
- large health bar

Hide the bar when:

- the boss dies
- the player leaves the encounter
- the boss is no longer active

Normal enemies must not trigger the boss health bar.

---

## UI

Place the boss health bar near the top-center of the HUD.

It should be more prominent than normal enemy health bars, but still compact.

Do not add a boss intro overlay.

---

## Out of Scope

Do not add:

- boss portraits
- phase indicators
- cast bars
- raid frames
- new boss mechanics

---

## Acceptance Criteria

- Boss fights show a dedicated health bar.
- HP updates reactively.
- Boss name is visible.
- The bar disappears correctly when the encounter ends.
- Normal enemies do not trigger it.
- Existing combat/boss logic remains unchanged.

---

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect existing boss/enemy state and health sync.
3. Reuse current HUD/state patterns.
4. Keep the implementation minimal and DRY.
5. Do not add a boss intro overlay.
6. Avoid unrelated refactors.
7. Run relevant checks after implementation.
