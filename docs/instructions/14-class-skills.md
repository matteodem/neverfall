# Class-Specific Basic Attacks

## Goal

Replace Digit1 behavior based on the character's `gameClass`.

For now, only implement the basic attack for:

- Warrior
- Ranger
- Mage

Keep it MVP-sized, DRY, and compatible with the existing combat/action bar/multiplayer architecture.

---

## Behavior by Class

### Warrior

Keep the existing Digit1 behavior unchanged:

```text
Digit1 = melee basic attack
```

- Uses the existing sword.
- Uses the existing melee attack flow.
- Uses the existing attack animation.

---

### Ranger

Implement:

```text
Digit1 = Arrow Shot
```

Requirements:

- No sword visible for Ranger.
- Spawn the arrow projectile from the Ranger character position/hand area.
- It is acceptable for the arrow to appear "from the air" for now.
- Fire the projectile forward toward the current facing direction.
- Use a simple projectile mesh.
- Deal server-authoritative damage.
- Reuse the current basic attack cooldown timing unless existing architecture suggests otherwise.
- Remove/dispose the projectile on hit or after a short lifetime.

No bow asset is required yet.

---

### Mage

Implement:

```text
Digit1 = Fireball
```

Requirements:

- No sword visible for Mage.
- Spawn the fireball from the Mage character position/hand area.
- It is acceptable for the fireball to appear "from the air" for now.
- Fire it forward toward the current facing direction.
- Use a simple glowing/orange-red projectile or particle/mesh effect.
- Deal server-authoritative damage.
- Reuse the current basic attack cooldown timing unless existing architecture suggests otherwise.
- Remove/dispose the projectile on hit or after a short lifetime.

No staff/wand asset is required yet.

---

## Weapon Visibility

Sword visibility should depend on `gameClass`.

```text
Warrior = sword visible
Ranger = sword hidden
Mage = sword hidden
```

Do not delete the sword system.

Only hide/disable it for non-Warrior classes.

---

## Skill Selection

Digit1 should be resolved through `gameClass`.

Avoid code like:

```js
if (gameClass === "warrior") ...
if (gameClass === "ranger") ...
if (gameClass === "mage") ...
```

spread across many files.

Prefer a single class/skill config or dispatcher.

Example concept:

```js
basicAttackByClass[gameClass]()
```

or equivalent using the existing architecture.

---

## Projectile MVP

Keep projectiles simple.

Suggested flow:

```text
press Digit1
↓
spawn projectile
↓
move forward
↓
hit enemy
↓
send/validate damage server-side
↓
dispose projectile
```

No advanced physics system is needed.

---

## Multiplayer

Remote Ranger/Mage players should visually show their Digit1 projectile attack when possible.

Reuse the existing multiplayer attack message flow instead of creating a new networking system.

Gameplay damage remains server-authoritative.

---

## Out of Scope

Do not add yet:

- bow model
- staff/wand model
- custom Ranger attack animation
- custom Mage casting animation
- mana
- ammo
- projectile gravity
- homing
- projectile penetration
- status effects
- critical hits
- Ranger/Mage Digit2 or Digit3
- large combat refactor

---

## Acceptance Criteria

- Warrior Digit1 still works exactly as before.
- Ranger Digit1 fires an arrow projectile.
- Mage Digit1 fires a fireball projectile.
- Ranger and Mage do not show the Warrior sword.
- Projectiles deal server-authoritative damage.
- Projectiles clean themselves up.
- Digit1 is selected based on `gameClass`.
- Existing multiplayer combat still works.
- Mounted attack restrictions still apply.

---

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the existing combat flow.
3. Inspect the current sword visibility/creation logic.
4. Inspect the existing `gameClass` flow.
5. Inspect multiplayer attack synchronization.
6. Reuse existing cooldown/damage patterns.
7. Keep the implementation DRY and MVP-sized.
8. Avoid large refactors.
9. Run relevant checks after implementation.
