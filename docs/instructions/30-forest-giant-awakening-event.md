# Forest Giant Awakening Event

## Goal

Add a second dynamic world event using a stronger Forest Giant variant.

Keep it short, reusable, and compatible with the existing dynamic event system.

---

## Event

```text
Forest Giant Awakening
```

This event is separate from the normal:

```text
Kill The Giant
```

quest.

The normal quest boss must remain unchanged.

---

## Event Boss

Create a separate boss variant:

```text
Awakened Forest Giant
```

Reuse the existing Forest Giant model and animations.

Suggested differences:

```text
HP: 1.5x normal Giant
Damage: 1.25x normal Giant
Rewards: better than normal Giant
```

---

## Purple Glow

The Awakened Forest Giant should have a subtle light-purple glow.

Requirements:

- visual only
- not overly bright / neon
- use a lightweight Babylon.js approach
- normal Forest Giant must not have this glow

---

## Event Flow

```text
World announcement
↓
Awakened Forest Giant spawns
↓
Nearby players participate automatically
↓
Boss fight
↓
Boss defeated
↓
Shared event rewards
↓
Cooldown
```

Example announcement:

```text
World Event: The Forest Giant has awakened!
```

---

## Spawn Location

Make the forest giant spawn to the south east of the map.

---

## Rewards

Reuse the existing reward / loot system.

The event boss should have:

- more XP
- more Gold
- higher equipment / accessory drop chance

Do not create a new reward system.

---

## Quest Separation

The event boss must not replace the regular Giant used by:

```text
Kill The Giant
```

Treat the regular Giant and Awakened Giant as separate enemy/boss configs even if they reuse the same asset.

---

## Out of Scope

Do not add:

- new 3D boss asset
- new animation set
- complex phase scripting
- new currency
- new quest system
- raid mechanics

---

## Acceptance Criteria

- `Kill The Giant` still works with the normal Forest Giant.
- `Forest Giant Awakening` spawns a separate Awakened Forest Giant.
- The event Giant has a subtle purple glow.
- The event Giant is stronger than the normal Giant.
- Event participants receive better rewards.
- Existing dynamic event logic is reused.
- Existing boss mechanics continue to work.

---

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the existing dynamic event system.
3. Inspect the normal Forest Giant config.
4. Reuse the current boss mechanics and reward systems.
5. Keep the normal `Kill The Giant` boss unchanged.
6. Keep changes small and DRY.
7. Avoid unrelated refactors.
8. Run relevant checks after implementation.
