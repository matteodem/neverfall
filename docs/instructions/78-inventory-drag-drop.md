# Inventory Drag & Drop

## Goal

Add lightweight drag & drop support to the existing inventory / equipment UI.

Keep it MVP-sized and preserve existing click / tap interactions.

Use JavaScript only.

## Scope

Support:

- drag an item to another inventory slot
- drag an equippable item onto a valid equipment slot
- drag equipped items back into the inventory
- reject invalid drops cleanly

Do not add:

- item stack splitting
- multi-select
- player-to-player dragging
- trash / delete by drag
- Diablo-style inventory sizing

## Mobile

Drag & drop must be optional.

Existing tap / click controls must continue to work on mobile.

Do not make drag & drop the only way to equip or move items.

## Requirements

- reuse existing inventory and equipment state
- preserve current item IDs / persistence
- validate equip rules using existing logic
- prevent duplicated / lost items
- show simple visual feedback while dragging
- clearly indicate valid / invalid drop targets
- keep the implementation local to inventory / equipment UI where possible

## Acceptance Criteria

- items can be reordered in inventory
- items can be dragged onto valid equipment slots
- equipped items can be dragged back into inventory
- invalid drops are rejected safely
- no item duplication / deletion occurs
- existing tap / click behavior still works
- mobile inventory remains usable
- current inventory persistence remains intact

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current inventory, equipment, item movement, persistence, and mobile interaction code first.
3. Reuse existing equip / unequip validation rather than duplicating it.
4. Add drag & drop only as an additional interaction layer.
5. Keep existing tap / click behavior unchanged.
6. Prevent item duplication, loss, or invalid equipment state.
7. Keep the implementation MVP-sized.
8. Run relevant checks.
9. In the final response, list every changed file with its exact path and summarize the drag & drop behavior.
