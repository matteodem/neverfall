# Sell Items MVP

## Goal

Allow players to sell inventory items for Gold.

Keep the flow simple and reuse the existing inventory, modal, item, and Gold systems.

## Inventory Flow

When the player **left-clicks an item** in the inventory:

- show the existing item action dropdown
- add a new action:

```text
Sell
```

Clicking `Sell` opens a modal with a backdrop.

## Sell Modal

The modal should show:

- item name
- item icon if available
- sell price per item
- quantity input
- total Gold received
- `Sell` button
- `Cancel` / close action

## Quantity

The quantity must be configurable.

Default value:

```text
max available quantity
```

Example:

```text
Inventory:
Wolf Pelt x8

Sell Modal:
Quantity: 8
Price each: 1 Gold
Total: 8 Gold
```

The player can reduce the quantity before confirming.

Do not allow:

- quantity below `1`
- quantity above the available stack size
- invalid / non-numeric values

## Sell Price

Use a configurable sell price per item.

Example item config:

```js
{
  id: "wolf-pelt",
  sellPrice: 1,
}
```

Items without a valid `sellPrice` should not show the `Sell` action.

## Server Validation

Selling must be server-authoritative.

On confirm:

```text
Client requests sale
→ server validates item + quantity
→ remove quantity from Character inventory
→ add Gold
→ return updated state
```

The client must not be able to choose its own sell price.

## Acceptance Criteria

- Left-clicking a sellable item shows `Sell`.
- Clicking `Sell` opens a modal with a backdrop.
- Quantity defaults to the maximum available stack size.
- Quantity can be changed before confirming.
- Total Gold updates based on quantity.
- Server validates item, quantity, and sell price.
- Sold items are removed correctly.
- Gold is added correctly.
- Non-sellable items do not show the `Sell` action.
- Existing inventory / equipment / consumable behavior remains unchanged.

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the existing inventory item dropdown and modal patterns.
3. Inspect the current Character inventory and Gold / money systems.
4. Reuse DaisyUI / existing modal components where possible.
5. Keep sell prices config-driven.
6. Keep the transaction server-authoritative.
7. Use JavaScript only.
8. Avoid unrelated refactors.
9. Run relevant checks after implementation.
10. In the final response, list every changed file with its exact path.
