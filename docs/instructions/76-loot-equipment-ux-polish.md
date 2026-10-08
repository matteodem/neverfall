# Loot / Equipment UX Polish

## Goal

Polish the existing loot and equipment experience so players can quickly understand whether an item is useful.

Keep this MVP-sized. Do not redesign the inventory or equipment systems.

Use JavaScript only.

## Focus

- clearer item stat comparison
- better rarity / item-type readability
- simple upgrade indication
- mobile-friendly item inspection
- preserve current loot / equip behavior

## Item Comparison

When inspecting an equippable item, compare it against the currently equipped item for the same slot.

Show stat differences clearly, for example:

```text
Iron Sword
Damage: 14 (+3)
Strength: 2 (+1)

Compared to:
Rusty Sword
```

Use existing item stats and equipment-slot logic.

Do not invent new stats.

## Upgrade Indicator

If an item is clearly better than the currently equipped item based on existing relevant stats, show a small:

```text
Upgrade
```

badge / icon.

Keep the heuristic simple.

Do not build a full item-score system.

## Rarity / Type Readability

Improve readability of:

- item name
- rarity
- equipment slot / item type
- important stats

Reuse existing rarity colors and UI patterns where possible.

Do not introduce a new visual system.

## New Loot Feedback

Optionally add a small `New` indicator for recently acquired items if the current inventory architecture supports this cleanly.

Keep it lightweight.

## Mobile

Do not rely on hover-only interactions.

Item details and comparisons must be accessible through tap / click.

## Acceptance Criteria

- equippable items show comparison against the current item
- stat differences are easy to read
- obvious upgrades can show a small upgrade indicator
- rarity / type / stats are clearer
- mobile users can inspect the same information
- existing inventory / equipment logic still works
- no new item-score system is introduced
- no unrelated loot balance changes are made

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the existing inventory, equipment, item tooltip / modal, item stats, rarity, and mobile interaction code.
3. Reuse the existing item / equipment data model.
4. Add comparison against the currently equipped item for the same slot.
5. Show useful positive / negative stat deltas.
6. Add only a simple upgrade indicator if it can be derived safely from existing stats.
7. Reuse existing rarity / UI styling.
8. Ensure tap / click works on mobile; do not depend on hover.
9. Do not redesign the inventory, equipment system, loot tables, or item balance.
10. Run relevant checks.
11. In the final response, list every changed file with its exact path and summarize the UX changes.
