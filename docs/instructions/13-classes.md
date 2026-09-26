# Class System MVP

## Goal

Add the three playable classes:

- Warrior
- Ranger
- Mage

Keep it MVP-sized, DRY, and compatible with the existing character/multiplayer architecture.

---

## Assets

The class assets are already available under:

```text
public/models/characters/kaykit/
```

Confirmed Ranger assets:

```text
public/models/characters/kaykit/ranger/Ranger.glb
public/models/characters/kaykit/ranger/ranger_texture.png
```

Mage assets are also available in the KayKit character assets. Inspect the existing folder/file names before wiring them up instead of hardcoding assumptions.

Reuse the existing KayKit animation files where compatible.

---

## Class Config

Create/reuse one central class config.

Example:

```js
warrior: {
  model: "...",
  maxHealth: 125,
  attackDamage: 10,
},

ranger: {
  model: "/models/characters/kaykit/ranger/Ranger.glb",
  maxHealth: 100,
  attackDamage: 12,
},

mage: {
  model: "...",
  maxHealth: 85,
  attackDamage: 15,
},
```

The config should determine:

- character model
- base HP
- base attack damage
- class-specific skill definitions later

Do not scatter class checks throughout the codebase.

---

## Character Creator

Enable:

```text
Warrior
Ranger
Mage
```

Store the selected class using the existing `gameClass` field.

The selected class must load the correct 3D model in:

- Character Creator preview
- local player
- remote players

---

## Stats

Use different base stats per class.

Keep the values easy to tune.

Equipment bonuses must continue to apply on top of class base stats.

---

## Skills

For this task, keep the current skill system working.

Do **not** fully implement Ranger/Mage skill kits yet.

It is enough to prepare the architecture so skills can later be selected by `gameClass`.

Warrior behavior must keep working unchanged.

---

## Multiplayer

Remote players must display the correct class model based on their `gameClass`.

Reuse the existing multiplayer character creation/sync flow.

---

## Out of Scope

Do not add yet:

- Mana
- Energy
- new Ranger/Mage abilities
- new skill animations
- talent trees
- class switching
- subclasses
- class-specific equipment
- major combat refactors

---

## Acceptance Criteria

- Warrior, Ranger, and Mage are selectable.
- The selected class persists on the character.
- Each class loads its correct model.
- Remote players show the correct class.
- Each class can have different base HP/damage.
- Existing equipment stat bonuses still work.
- Warrior gameplay remains functional.

---

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the existing KayKit character loader and animation controller.
3. Inspect the Character Creator and `gameClass` data flow.
4. Inspect remote-player character creation.
5. Inspect existing player stat configuration.
6. Reuse existing patterns.
7. Keep it DRY and MVP-sized.
8. Do not implement Ranger/Mage skill kits yet.
9. Run relevant checks after implementation.
