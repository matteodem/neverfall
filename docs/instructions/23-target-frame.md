# Neverfall — Target Frame MVP

## Goal

Add a simple target frame for manually selected normal/rare enemies.

Keep it small, DRY, and separate from the existing boss health bar.

---

## Targeting

- Left-click an enemy to select it.
- Left-click another enemy to switch target.
- Click empty ground or press `Esc` to clear the target.
- Clear the target if the enemy dies or despawns.

---

## Target Frame

Show:

- enemy name
- current HP
- max HP
- health bar

Place it near the top-center of the HUD.

Only show it for normal and rare enemies.

---

## Boss Behavior

Bosses should keep using the existing automatic boss health bar.

If a boss is selected internally, do **not** show the small target frame as well.

```text
Normal / Rare Enemy = Target Frame
Boss = Boss Health Bar
```

Avoid duplicate boss UI.

---

## Out of Scope

Do not add:

- portraits
- buffs/debuffs
- cast bars
- target-of-target
- auto-targeting
- complex targeting rules

---

## Acceptance Criteria

- Left-click selects normal/rare enemies.
- Target frame shows correct HP/name.
- Clicking another enemy switches target.
- Empty-ground click / `Esc` clears target.
- Dead/despawned targets clear automatically.
- Bosses continue using only the boss health bar.
- Existing combat behavior remains unchanged.

---

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect existing enemy click/picking and HUD state.
3. Inspect the existing boss health bar logic.
4. Reuse current enemy health/state data.
5. Keep target state and boss encounter state separate.
6. Keep changes minimal and DRY.
7. Avoid unrelated refactors.
8. Run relevant checks after implementation.
