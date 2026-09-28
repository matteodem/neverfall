# Vendor / Shop MVP

## Goal

Add a simple vendor shop that gives Gold a clear gameplay purpose.

Keep it small, server-authoritative, and compatible with the existing inventory / equipment systems.

## Shop Behavior

The player can open a simple shop UI and buy predefined items.

The MVP should support:

- fixed shop inventory
- fixed Gold prices
- Buy button
- Gold validation
- item added to the current Character inventory
- clear error if the player cannot afford the item

## Suggested Items

Use existing item systems where possible.

Example stock:

- Vitality Ring — 5 Gold
- Strength Ring — 8 Gold
- Lucky Charm — 10 Gold
- Guardian Talisman — 12 Gold
- Swift Feather — 15 Gold

Optional:

- one simple consumable if a consumable system already exists

Do not invent a new item system.

## Example Config

```js
{
  id: "vitality-ring",
  price: 5,
}
```

Keep shop stock config-driven.

## Purchase Flow

```text
Player opens Shop
→ selects item
→ clicks Buy
→ server validates Gold
→ Gold is deducted
→ item is added to Character inventory
→ UI updates
```

## Gold

Use the existing Gold / money system.

Purchases must be server-authoritative.

The client must not be able to:

- choose its own price
- directly subtract Gold
- directly grant items

## UI

Keep the UI simple.

Suggested layout:

```text
Shop

Vitality Ring        5 Gold   [Buy]
Strength Ring        8 Gold   [Buy]
Lucky Charm         10 Gold   [Buy]
Guardian Talisman   12 Gold   [Buy]
Swift Feather       15 Gold   [Buy]
```

Reuse DaisyUI / existing modal patterns where possible.

## Out of Scope

Do not add:

- selling items
- player trading
- Auction House
- dynamic prices
- limited stock
- vendor reputation
- currencies besides Gold
- complex economy simulation

## Acceptance Criteria

- Player can open the shop.
- Shop displays configured items and prices.
- Player can buy an item if enough Gold is available.
- Gold is deducted server-side.
- Purchased item is added to the current Character inventory.
- Purchase fails cleanly if Gold is insufficient.
- Existing inventory and equipment systems continue to work.
- Adding another shop item should mostly require config.

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the existing Gold / money system.
3. Inspect the Character inventory and equipment systems.
4. Reuse existing modal / DaisyUI patterns.
5. Keep purchase validation server-authoritative.
6. Keep shop stock config-driven.
7. Use JavaScript only.
8. Avoid unrelated refactors.
9. Run relevant checks after implementation.
