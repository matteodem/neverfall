#  New Enemy Batch

## Goal

Add a small batch of new enemies using the existing enemy architecture.

Keep it simple, DRY, and reuse current AI/combat/loot/minimap/performance systems.

---

## New Enemies

Use these existing `.glb` assets from the animal pack:

```text
goat.glb
rat.glb
bee.glb
```

Copy them into the existing enemy asset structure before wiring them up.

---

## Suggested Roles

### Goat

```text
HP: medium
Damage: low
Speed: medium
Area: hills / edge of forest
```

### Rat

```text
HP: low
Damage: low
Speed: fast
Area: ruins / dungeon entrance
```

### Bee

```text
HP: very low
Damage: medium
Speed: fast
Area: forest clearings
```

Keep values centralized in the existing enemy config.

---

## Requirements

Each new enemy should reuse:

- existing AI
- combat
- health
- death / respawn
- XP rewards
- loot system
- minimap markers
- rare-enemy logic
- render-distance / performance logic

Do not create a separate enemy system.

---

## Out of Scope

Do not add:

- new AI types
- special abilities
- custom boss mechanics
- new loot architecture
- new rarity system

---

## Acceptance Criteria

- Goat, Rat, and Bee spawn in the world.
- Each has configurable stats and spawn areas.
- Existing enemy systems work with them.
- Rare variants still work.
- Minimap and culling continue to work correctly.

---

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current enemy config/spawn architecture.
3. Reuse existing enemy systems.
4. Keep the implementation minimal and DRY.
5. Avoid unrelated refactors.
6. Run relevant checks after implementation.
