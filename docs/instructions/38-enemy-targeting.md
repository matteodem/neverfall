# Mobile Combat Target Lock

## Goal

Make combat easier on mobile by increasing enemy hitboxes and adding a simple attack-triggered lock-on system.

Keep it lightweight and avoid changing normal movement behavior.

## 1. Larger Enemy Hitboxes

Increase the effective hitbox / targeting area of enemies.

Requirements:

- make enemies easier to hit on mobile
- do not visibly scale the enemy model
- reuse existing collision / targeting helpers where possible
- keep the change reasonable so combat does not feel overly forgiving

## 2. Auto-Target / Lock-On

Add a simple lock-on system that activates **after the player performs their first attack**.

When the player attacks:

- find a valid enemy inside a **90° cone in front of the player**
- prefer the closest valid enemy
- set that enemy as the current locked target
- keep the target focused so subsequent attacks can reliably hit it
- keep the lock active while the target remains valid and reasonably close

The lock-on should help the player continue attacking the same enemy without requiring precise mobile aiming.

## 3. Do Not Auto-Lock While Passing Enemies

The lock-on must **not** trigger just because the player walks or rides near enemies.

Important:

- movement alone must never create a target lock
- riding past enemies must never create a target lock
- lock-on only starts after the player actively performs an attack

## Target Validity

Clear the lock if:

- the enemy dies
- the enemy is removed
- the enemy moves too far away
- another target is intentionally selected
- the player leaves combat / resets targeting according to existing logic

## Acceptance Criteria

- Enemy hitboxes are easier to hit on mobile.
- First attack can automatically lock the nearest valid enemy in front of the player.
- Target selection is limited to a 90° forward cone.
- Subsequent attacks use the locked target where appropriate.
- Walking or riding past enemies does not trigger lock-on.
- Existing desktop combat still works.
- Existing target frame / boss targeting behavior is not broken.

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current enemy hit detection, targeting, combat, and mobile controls first.
3. Reuse the existing target state / target frame logic if possible.
4. Do not create a second competing targeting system.
5. Keep the implementation small and DRY.
6. Use JavaScript only.
7. Avoid unrelated refactors.
8. Run relevant checks after implementation.
9. In the final response, list every changed file with its exact path.
