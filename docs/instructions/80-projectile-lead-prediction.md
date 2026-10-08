# Projectile Lead Prediction

## Goal

Improve ranged projectile aiming so arrows / projectiles lead moving targets instead of aiming only at their current position.

Keep this lightweight and compatible with the existing soft aim-assist system.

Use JavaScript only.

## Behavior

When a valid target is moving:

```text
current target position
+ target velocity × estimated projectile travel time
= predicted aim position
```

The projectile should aim slightly ahead of the target based on its movement direction and speed.

Example:
- target moving left → aim slightly left
- target moving right → aim slightly right

## Requirements

- reuse the existing projectile / ranged attack code
- reuse the existing soft aim-assist target selection
- estimate travel time using current distance and projectile speed
- cap prediction to roughly `0.5–1.0s`
- ignore very small target velocity
- preserve current chest / body-height aiming
- preserve terrain / LOS checks
- keep server-authoritative damage handling
- avoid strong homing after the projectile is fired
- prediction should happen at fire time only

## Safety / Edge Cases

- do not over-lead teleporting targets
- avoid extreme prediction during knockback / sudden movement spikes
- fall back to the current target position if velocity data is unavailable
- keep no-target behavior unchanged

## Acceptance Criteria

- moving targets are led naturally
- stationary targets behave exactly as before
- prediction remains subtle and does not feel like homing
- fast lateral movement is easier to hit at range
- no major regression to existing soft aim assist
- multiplayer damage validation remains unchanged

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the existing ranged projectile, projectile speed, target selection, enemy/player velocity, and soft aim-assist code.
3. Implement lead prediction at projectile fire time only.
4. Prefer the smallest safe solution using existing velocity data.
5. Use `distance / projectileSpeed` as the travel-time estimate and cap prediction to a sane maximum around 1 second.
6. Fall back safely if velocity is missing or unreliable.
7. Do not add post-fire homing.
8. Do not change unrelated combat balance.
9. Run relevant checks.
10. In the final response, list every changed file with its exact path and summarize the prediction formula / limits used.
