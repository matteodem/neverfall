# Crafting Light

## Goal

Add a very small **Crafting Light** system focused only on consumables.

Keep gear as loot from enemies / dungeons. Do not add crafted rings, accessories, armor, professions, crafting levels, or skill trees.

Use JavaScript only.

## UI

Add a new **Crafting** tab inside the existing **Items** UI.

Also add:

```text
C
```

as the keyboard shortcut to open the Crafting tab directly.

Update the existing Help modal / controls reference so `C` is documented.

Keep the UI mobile-friendly and consistent with the current Items styling.

## Initial Recipes

Start with the existing consumables:

- Health Potion
- Speed Potion
- Power Potion

Example intent:

```text
mob-dropped materials
→ crafting recipe
→ existing potion item
```

Do not create a new potion system.

Reuse the existing consumable behavior:

- Health Potion → restores health
- Speed Potion → temporary movement-speed buff
- Power Potion → temporary damage buff

## New Crafting Materials

Add a small set of new material items that can drop from existing mobs.

Keep the material list small, e.g. 3–5 materials total.

Examples only:

- Wolf Pelt
- Beast Fang
- Healing Herb
- Arcane Dust
- Frost Shard

Codex must inspect the existing mob / loot structure and choose sensible materials and drop sources based on real enemies already in the repository.

Do not invent new mobs.

Materials should:

- appear in the existing inventory
- have clear names / descriptions
- stack if the existing item system supports stacking
- have modest drop chances
- come from appropriate existing enemy types

## Recipes

Create a centralized recipe config.

Each recipe should define:

```js
{
  id,
  resultItemId,
  resultAmount,
  ingredients: [
    { itemId, amount }
  ]
}
```

Keep the first pass to roughly 3 recipes.

## Crafting Rules

When crafting:

- validate Character ownership
- validate recipe exists
- validate enough materials are present
- remove ingredients server-side
- grant the consumable exactly once
- prevent duplication / race-condition issues
- show existing-style success / failure feedback

Keep crafting server-authoritative.

## Scope

Do not add:

- crafting stations
- professions
- crafting XP / levels
- recipe discovery
- random-quality crafting
- crafted gear
- timers
- crafting queues
- new currencies
- auction / trading integration

## Acceptance Criteria

- Items UI has a new Crafting tab
- pressing `C` opens Crafting directly
- Help modal documents the `C` shortcut
- Health / Speed / Power Potions can be crafted
- new crafting materials drop from existing mobs
- recipes are centralized
- materials are removed safely
- crafted consumable is granted exactly once
- insufficient materials show clear feedback
- mobile UI remains usable
- existing shop / consumable behavior remains intact
- gear continues to come from loot, not crafting

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the existing Items UI, tabs, keyboard shortcuts, Help modal, inventory, consumables, loot tables, item definitions, Character persistence, and Meteor methods first.
3. Add a Crafting tab inside Items and wire `C` to open it directly.
4. Add `C` to the Help modal / controls reference.
5. Reuse the existing Health / Speed / Power Potion items and behavior.
6. Add only a small set of new crafting-material items and integrate them into real existing mob loot tables.
7. Choose material drop sources based on actual enemies in the repository; do not invent mobs.
8. Create one centralized recipe config with roughly 3 recipes.
9. Keep crafting server-authoritative and prevent duplication / partial-consumption bugs.
10. Do not add gear crafting or any large crafting progression system.
11. Run relevant checks.
12. In the final response, list every changed file with its exact path and report:
    - Crafting tab path
    - shortcut handling path
    - Help modal change
    - materials added
    - mob drop sources / rates
    - recipes added
    - server validation / crafting method used
