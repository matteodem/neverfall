# Light Homing Projectiles

## Goal

Improve ranged projectile reliability by combining the existing initial aim / lead prediction with a **very mild homing correction** after the projectile is fired.

The projectile should follow the target only slightly, so it still feels like a normal arrow / projectile rather than a guided missile.

Use JavaScript only.

## Behavior

At fire time:

- keep the existing soft aim-assist / lead prediction
- keep the current projectile speed
- keep aiming around the target body / chest area

After firing:

- allow the projectile direction to rotate slightly toward the target
- cap the turn rate to a small value, e.g. roughly **8–10 degrees per second** initially
- do not snap directly to the target
- do not change speed to catch up

## Requirements

- reuse existing projectile movement code
- keep server-authoritative damage / hit validation
- preserve terrain / LOS / collision behavior
- stop homing if the target dies, disappears, becomes invalid, or is too far away
- keep no-target projectile behavior unchanged
- avoid sharp mid-air turns
- use the smallest safe implementation possible

## Tuning

Start conservatively:

```text
max turn rate: ~8–10° / second
```

Make the value easy to tune from one central location.

If the existing projectile types differ significantly, keep the first implementation limited to the Ranger / arrow-style projectile.

## Acceptance Criteria

- moving enemies are easier to hit
- projectile still looks physically plausible
- projectile does not aggressively curve or orbit targets
- stationary targets behave normally
- sudden enemy direction changes can be corrected slightly
- dead / invalid targets stop influencing the projectile
- terrain collision still works
- multiplayer damage behavior remains unchanged

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the existing projectile, ranged attack, soft aim-assist, lead-prediction, target, and collision code.
3. Keep the existing initial aim / lead prediction.
4. Add only a mild post-fire homing correction.
5. Limit turning with a configurable maximum degrees-per-second value.
6. Do not add full homing or target snapping.
7. Do not change projectile speed unless absolutely required.
8. Keep server-authoritative damage and existing hit validation.
9. Run relevant checks.
10. In the final response, list every changed file with its exact path and report the homing turn-rate value / config location.
