# Replace Camera Y-Aiming with Soft PvE Aim Assist

## Goal

Replace the current projectile **camera Y-axis aiming** with a lightweight **soft PvE aim-assist system** for Ranger and Mage attacks.

Current problem:

- camera Y-axis aiming was added so projectiles could hit enemies on slopes / hills
- this improved vertical aiming freedom
- however, it made ranged combat much harder because the player now needs to aim vertically very precisely
- slight camera pitch differences cause projectiles to pass above enemies or hit the ground

The goal is to make ranged combat feel more like an MMORPG and less like a precision shooter.

Use JavaScript only.

---

# 1. Remove Direct Camera Y-Aiming

Do not use the camera pitch / camera Y direction directly as the primary vertical projectile aim anymore.

Horizontal direction should still come from the player's camera / forward aim direction.

Conceptually:

```text
camera horizontal direction
→ find valid enemy near aim direction
→ if enemy found:
   aim projectile toward enemy chest / center
→ if no enemy found:
   fire mostly forward with a neutral / sensible vertical direction
```

Do not preserve full free vertical camera aiming for normal PvE projectile attacks unless the existing architecture requires a fallback.

The aim assist should replace the need for precise camera Y-axis aiming.

---

# 2. Keep Horizontal Camera Control

The player should still control the general attack direction.

Use camera facing / crosshair direction primarily for horizontal selection.

The player should still need to roughly aim toward an enemy.

Do not turn combat into automatic nearest-target attacks.

The player should be able to choose which enemy to attack by facing / aiming toward it.

---

# 3. Soft Aim Assist Cone

For Ranger and Mage projectile attacks, search for valid enemies close to the player's forward camera direction.

Suggested cone:

```text
10–15 degrees
```

Start around:

```text
12 degrees
```

and keep it configurable.

The enemy closest to the center of the aim direction should generally be preferred.

Do not simply select the nearest enemy in world distance.

Valid targets should:

- be alive
- be hostile / attackable
- be inside reasonable skill range
- be inside the aim cone
- not be behind obviously blocking terrain if line-of-sight validation exists

---

# 4. Aim at Enemy Chest / Center

If a valid enemy is found, calculate projectile direction toward the enemy's body center rather than root / feet.

Preferred target point:

```js
enemy.position.y + enemyHeight * 0.5
```

or reuse the existing enemy target point / bounding box center / chest bone if available.

This should naturally solve uphill and downhill combat.

Examples:

```text
enemy uphill
→ projectile angles upward toward chest

enemy downhill
→ projectile angles downward toward chest
```

The player should not need to manually pitch the camera up or down to compensate for terrain height.

---

# 5. Fallback When No Enemy Is in the Aim Cone

If no valid enemy is found, do not use aggressive vertical camera pitch.

Use the existing horizontal forward direction with a neutral or sensible vertical trajectory.

Preferred behavior:

```text
no target found
→ shoot forward
```

For normal ranged attacks, the projectile should not dive into the ground just because the camera is angled slightly downward.

Do not make the fallback trajectory artificially curve.

Keep it simple and predictable.

---

# 6. No Strong Homing

Aim assist should calculate the projectile's direction **at fire time**.

Do not continuously steer the projectile after launch.

Avoid:

```text
visible projectile bending
tracking around corners
aggressive enemy following
automatic 90-degree corrections
```

The intended behavior:

```text
player aims near enemy
→ projectile starts in a corrected direction
→ then travels normally
```

This should feel subtle.

---

# 7. Target Selection Priority

When multiple enemies are inside the cone, use this priority where it fits the existing architecture:

1. current selected / locked target if it is valid and inside the cone
2. enemy closest to the center of the camera aim
3. closest distance as a tie-breaker

If there is already a current target / target frame system, reuse it.

Do not create a completely separate targeting system.

---

# 8. Slightly Increase Projectile Hit Tolerance

Make enemy projectile hit detection slightly more forgiving.

Do not scale the visible enemy model.

Increase only the invisible projectile hit volume / hit radius.

Suggested:

```text
20–30% larger
```

Start conservatively, e.g.:

```text
1.2x
```

This should help with:

- moving enemies
- small enemies
- slopes
- network latency
- mobile controls

Do not make obvious misses count as hits.

---

# 9. Multi-Projectile Skills

For attacks that fire multiple projectiles:

```text
calculate one corrected base direction
→ apply existing spread around that direction
```

Do not individually auto-target every projectile.

Preserve the current intended spread pattern.

---

# 10. Mage and Ranger Only

Apply this system to projectile-based ranged skills.

Examples may include:

```text
Ranger:
- Arrow Shot
- Strong Arrow
- Multi Shot

Mage:
- Fireball
- Fireball Burst
```

Use the actual current skill definitions in the repository.

Do not assume these exact names if they have changed.

Do not alter Warrior melee combat unless shared helper changes require a safe internal adjustment.

---

# 11. Terrain and Line of Sight

Do not let aim assist cheat terrain.

Keep terrain collision.

The system must not allow the player to:

- shoot through hills
- shoot through large obstacles
- hit enemies that are clearly occluded if line-of-sight checks already exist

If an existing line-of-sight raycast / helper is available, reuse it.

Aim assist should only correct toward an enemy that is reasonably targetable.

---

# 12. Mobile Integration

Mobile already benefits from forgiving target behavior.

If mobile has a target lock:

```text
valid locked target
→ prefer it
```

Do not create a separate mobile projectile aiming system unless absolutely necessary.

Desktop:

```text
soft assist
```

Mobile:

```text
reuse lock where available
+ same projectile direction helper
```

Keep the shared behavior DRY.

---

# 13. Server Authority

Preserve existing server-authoritative combat and damage.

Do not move:

- damage calculation
- enemy HP changes
- hit validation authority

to the client.

If the current architecture sends projectile direction from the client, continue using the existing server validation rules.

Do not weaken anti-cheat safeguards.

---

# 14. Configurable Tuning

Centralize tuning values where practical.

Suggested config:

```text
aimAssistConeDegrees: 12
projectileHitboxScale: 1.2
```

If a combat config file / projectile helper already exists, place values there.

Do not scatter duplicate magic numbers across Ranger and Mage skill files.

---

# 15. Preserve Existing Systems

Do not break:

- projectile speed
- projectile lifetime
- cooldowns
- damage
- skill VFX
- animations
- terrain collision
- enemy collision
- selected target state
- mobile target lock
- multiplayer synchronization
- server-side damage logic

The main change is:

```text
OLD:
camera X/Z + camera Y pitch

NEW:
camera horizontal direction
+ soft enemy selection
+ vertical aim toward enemy center
```

---

# 16. Expected Combat Feel

The result should feel like:

```text
player faces roughly toward enemy
→ presses ranged skill
→ projectile naturally travels toward enemy body
```

The player should not need shooter-level precision.

However:

```text
player aims far away from enemy
→ projectile misses
```

Aim assist should help with near-misses, not fully automate combat.

---

# 17. Acceptance Criteria

The task is complete when:

- direct camera Y-axis aiming is no longer the main vertical projectile aiming system
- horizontal camera direction still determines general attack direction
- valid enemies inside a small aim cone receive soft aim correction
- projectile aims toward enemy chest / body center
- uphill enemies can be hit reliably without manually pitching camera upward
- downhill enemies can be hit reliably without manually pitching camera downward
- no-target shots travel predictably forward
- projectiles do not strongly home after firing
- obvious large misses still miss
- enemy projectile hit volumes are slightly more forgiving
- terrain collision remains functional
- enemies behind hills cannot be hit through terrain
- Ranger and Mage both use the same general aiming behavior
- melee combat remains unchanged
- mobile target lock still works
- server authority remains intact

---

# 18. Testing

Test at minimum:

## Flat Ground

```text
player and enemy at same elevation
```

Expected:

- easy reliable hits when aimed near enemy
- normal misses when aimed clearly away

## Enemy Uphill

```text
player below enemy
```

Expected:

- projectile automatically aims upward toward body center
- projectile does not hit ground in front of enemy

## Enemy Downhill

```text
player above enemy
```

Expected:

- projectile angles downward toward body center
- no manual camera pitch required

## Camera Looking Down

Aim generally toward an enemy while camera is slightly angled down.

Expected:

- projectile still targets enemy center
- it should not dive into terrain solely because of camera pitch

## Camera Looking Up

Aim generally toward enemy while camera is slightly angled up.

Expected:

- projectile still targets enemy center
- it should not fly over enemy solely because of camera pitch

## Multiple Enemies

Expected:

- selected / locked target preferred if valid
- otherwise enemy closest to aim center selected

## No Enemy

Expected:

- projectile travels forward predictably
- no strange vertical snapping

## Obstructed Enemy

Enemy behind a hill / obstacle.

Expected:

- aim assist does not bypass terrain

## Mobile

Expected:

- mobile lock integrates cleanly
- no duplicate target-selection system

---

# Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current projectile aiming implementation first.
3. Identify the exact files responsible for:
   - Ranger projectile direction
   - Mage projectile direction
   - camera-based Y-axis aiming
   - projectile creation
   - projectile collision
   - enemy target / hit volumes
   - selected target state
   - mobile target lock
   - server-side hit / damage validation
4. Remove / replace direct camera Y-axis aiming for normal PvE projectile attacks.
5. Keep horizontal camera direction as the main player-controlled direction.
6. Add soft aim assist using roughly a 10–15° cone.
7. Start around 12° unless the existing combat scale suggests otherwise.
8. Aim toward enemy center / chest height.
9. Prefer current selected / locked target when valid and inside the cone.
10. Otherwise choose the valid enemy closest to the center of the aim direction.
11. Use a neutral forward trajectory when no valid target is found instead of aggressive camera Y pitch.
12. Do not add continuous homing.
13. Increase projectile-relevant enemy hit volume by roughly 20–30%, starting around 1.2x.
14. Preserve terrain collision and line-of-sight behavior.
15. Integrate with existing mobile target-lock behavior.
16. Preserve server-authoritative damage.
17. Keep shared Ranger / Mage aiming code DRY where possible.
18. Use JavaScript only.
19. Do not perform unrelated refactors.
20. Run relevant checks after implementation.
21. Test uphill, downhill, camera-up, camera-down, flat-ground, multiple-enemy, no-target, terrain-obstruction, and mobile cases.
22. In the final response, list every changed file with its exact path.
23. Also summarize:
    - what old camera Y logic was removed
    - final aim-assist cone
    - target selection priority
    - fallback trajectory behavior
    - enemy aim-point calculation
    - projectile hitbox increase
24. If the current architecture differs from the assumptions in this spec, adapt to the existing structure instead of introducing a parallel combat system.
