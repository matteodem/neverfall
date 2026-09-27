# Class Progression Light

## Goal

Add lightweight class progression tied to character level.

Set the current maximum level to:

```js
MAX_LEVEL = 20;
```

Keep it simple, DRY, and reuse the existing level/stat systems.

---

## Progression

Add passive class bonuses at milestone levels:

```text
Level 5
Level 10
Level 15
Level 20
```

Keep all values centralized and easy to tune.

---

## Warrior

Suggested bonuses:

```text
Level 5  → +10 Max HP
Level 10 → +5% Melee Damage
Level 15 → +20 Max HP
Level 20 → +10% Melee Damage
```

---

## Ranger

Suggested bonuses:

```text
Level 5  → +5% Projectile Damage
Level 10 → +5% Movement Speed
Level 15 → +10% Projectile Damage
Level 20 → +5% Movement Speed
```

---

## Mage

Suggested bonuses:

```text
Level 5  → +5% Spell Damage
Level 10 → +10 Max HP
Level 15 → +10% AoE Damage
Level 20 → +10% Spell Damage
```

---

## Implementation

Use a central class progression config, for example:

```js
CLASS_PROGRESSION = {
  warrior: [...],
  ranger: [...],
  mage: [...],
}
```

Apply milestone bonuses on top of:

```text
base class stats
+
equipment bonuses
+
class progression bonuses
```

Do not permanently mutate base stats.

---

## Max Level

Update the current maximum level to:

```js
MAX_LEVEL = 20;
```

Reuse the existing max-level logic and ensure XP/level progression stops correctly at level 20.

Do not create a second max-level constant.

---

## UI

Show unlocked class bonuses in a small section of the existing character/stats UI if practical.

No new large progression screen is required.

---

## Multiplayer / Server Authority

Gameplay-affecting bonuses must remain server-authoritative.

The server should calculate effective stats from:

- class
- level
- equipment
- progression bonuses

---

## Out of Scope

Do not add:

- skill trees
- talent points
- active skill unlocks
- respec
- subclasses
- prestige
- class switching
- new currencies

---

## Acceptance Criteria

- `MAX_LEVEL` is 20.
- Level progression stops correctly at 20.
- Warrior, Ranger, and Mage receive different bonuses at levels 5, 10, 15, and 20.
- Bonuses unlock automatically.
- Bonuses stack correctly with equipment.
- Existing characters continue to work.
- Combat stats remain server-authoritative.
- Progression config is centralized and easy to tune.

---

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the existing max-level, level, class, equipment, and stat calculation logic.
3. Reuse the current effective-stat helpers.
4. Update the existing max-level constant to 20 rather than creating a duplicate.
5. Keep progression config centralized.
6. Keep changes minimal and DRY.
7. Avoid unrelated refactors.
8. Run relevant checks after implementation.
