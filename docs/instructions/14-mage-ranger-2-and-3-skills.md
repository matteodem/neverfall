# Ranger & Mage Skills: Digit2 + Digit3

## Goal

Add class-specific Digit2 and Digit3 skills for Ranger and Mage.

Keep the implementation:

- MVP-sized
- DRY
- server-authoritative for damage
- compatible with the existing class/combat/action-bar/multiplayer architecture

Reuse existing projectile/combat patterns where possible.

---

## Ranger

### Digit2 — Strong Arrow

```text
Key: 2
Type: Single-target projectile
```

Behavior:

- Fires one stronger arrow.
- More damage than Ranger Digit1.
- Same general projectile direction/behavior as Digit1.
- Longer cooldown.
- Reuse the existing Ranger projectile logic.

Suggested values:

```js
damageMultiplier: 2
cooldown: 4000
```

---

### Digit3 — Multi Shot

```text
Key: 3
Type: Multi-projectile / cone attack
```

Behavior:

- Fires 3 arrows at once.
- One arrow forward.
- One slightly left.
- One slightly right.
- Each enemy should only be hit once per cast.
- Medium/long cooldown.
- Keep the spread simple.

Suggested values:

```js
projectiles: 3
damageMultiplier: 0.9
cooldown: 6000
spreadAngle: 12
```

---

## Mage

### Digit2 — Fireball Burst

```text
Key: 2
Type: Strong single-target projectile
```

Behavior:

- Fires a larger fireball.
- More damage than Mage Digit1.
- Slightly larger projectile visual if practical.
- Longer cooldown.
- Reuse existing Mage projectile logic.

Suggested values:

```js
damageMultiplier: 2
cooldown: 4000
```

---

### Digit3 — Fire Nova

```text
Key: 3
Type: Ground / nearby AoE
```

Behavior:

- Creates a simple fire AoE around the Mage.
- Damages nearby enemies once.
- Use a lightweight visual effect or simple glowing circle.
- No damage-over-time for now.
- No persistent ground effect required.

Suggested values:

```js
damageMultiplier: 1.25
cooldown: 7000
radius: 3
```

Keep the AoE implementation simple.

---

## Action Bar

Class-specific layout:

### Ranger

```text
1 = Arrow Shot
2 = Strong Arrow
3 = Multi Shot
4 = Heal / existing utility
```

### Mage

```text
1 = Fireball
2 = Fireball Burst
3 = Fire Nova
4 = Heal / existing utility
```

Use the existing cooldown UI.

---

## Multiplayer

Remote players should show the relevant projectile / AoE visuals where practical.

Reuse the existing combat synchronization flow.

Do not create a new networking system.

Damage remains server-authoritative.

---

## Out of Scope

Do not add:

- mana
- ammo
- status effects
- damage-over-time
- custom casting animations
- bow/staff assets
- combo systems
- talent trees
- new dependencies

---

## Acceptance Criteria

- Ranger Digit2 fires a stronger arrow.
- Ranger Digit3 fires a 3-arrow spread.
- Mage Digit2 fires a stronger fireball.
- Mage Digit3 damages nearby enemies with a simple AoE.
- All skills use the existing action bar cooldown UI.
- Skills are selected based on `gameClass`.
- Mounted players cannot use these skills.
- Damage is validated/calculated server-side.
- Existing Warrior skills remain unchanged.

---

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current class-specific Digit1 implementation.
3. Reuse existing projectile and combat helpers.
4. Reuse current action-bar cooldown patterns.
5. Keep damage server-authoritative.
6. Keep changes small and DRY.
7. Avoid large refactors.
8. Run relevant checks after implementation.
