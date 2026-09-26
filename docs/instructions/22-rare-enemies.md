# Rare Enemy Variant

## Goal

Add a simple rare variant for normal enemies.

Keep it lightweight, DRY, and configuration-driven.

---

## Spawn Chance

Normal enemies should have a small chance to spawn as a rare version.

Suggested value:

```js
rareChance: 0.05
```

Approximately 5%.

Keep the value centralized and easy to tune.

---

## Rare Enemy Bonuses

Rare enemies should receive:

```text
+50% HP
+25% Damage
+10% Scale
```

Reuse the existing enemy stat system.

Do not duplicate stat logic.

---

## Visual Identity

Rare enemies should be easy to recognize.

Use:

- name prefix, for example `Rare Wolf`
- slightly larger scale
- subtle yellow glow

The yellow glow should be lightweight and purely visual.

Avoid expensive shaders if a simple emissive/highlight approach works.

---

## Loot

Rare enemies should have better loot chances than normal enemies.

Reuse the existing loot system.

Do not create a separate rare-loot architecture.

---

## Behavior

Rare enemies should otherwise behave like their normal version.

Reuse:

- AI
- movement
- combat
- animations
- respawn flow

Do not add special abilities yet.

---

## Out of Scope

Do not add:

- multiple rarity tiers
- random affixes
- special rare-only abilities
- rarity-specific animations
- unique AI
- item rarity
- new dependencies

---

## Acceptance Criteria

- Normal enemies can spawn as rare with ~5% chance.
- Rare enemies have increased HP and damage.
- Rare enemies are slightly larger.
- Rare enemies have a visible yellow glow.
- Rare enemies use a `Rare` name prefix.
- Rare enemies have improved loot chances.
- Normal enemies remain unchanged.
- Existing multiplayer sync still works.

---

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the existing enemy spawn/config/stat flow.
3. Reuse current enemy AI, combat, animation, and loot systems.
4. Keep rare configuration centralized.
5. Implement the yellow glow with the lightest practical Babylon.js approach.
6. Keep the implementation small and DRY.
7. Avoid unrelated refactors.
8. Run relevant checks after implementation.
