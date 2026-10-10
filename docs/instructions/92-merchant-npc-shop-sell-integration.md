# Merchant NPC Shop and Sell Integration

## Goal

Move all Shop and Sell access behind merchant NPC interactions so buying and selling happen through NPCs in the world instead of through global/default UI access.

Reuse the existing shop and sell systems wherever possible. This task should change how those systems are opened, not rebuild them.

## Core Rules

- Only NPCs with `npcType: "merchant"` should provide Shop/Sell actions.
- Players must interact with a merchant NPC before opening the Shop or Sell UI.
- Existing Shop and Sell modals/components should be reused.
- Remove or disable any direct/global Shop or Sell access that bypasses merchants.
- Merchant NPCs should reference a `shopId`; they should not contain full shop inventory definitions.
- Keep the implementation MVP-sized and reusable.

## Suggested Merchant NPC Shape

Extend merchant NPC definitions with merchant configuration.

Example:

```js
{
  id: "forest-merchant-01",
  name: "Travelling Merchant",
  npcType: "merchant",

  merchant: {
    shopId: "forest-general-store",
    canBuy: true,
    canSell: true,
  },
}
```

Another example:

```js
{
  id: "highlands-armorer",
  name: "Highlands Armorer",
  npcType: "merchant",

  merchant: {
    shopId: "highlands-armory",
    canBuy: true,
    canSell: true,
  },
}
```

Adapt naming to existing NPC conventions.

## Shop Definitions

Keep merchant inventories separate from NPC definitions.

Conceptually:

```js
const shops = {
  "forest-general-store": {
    id: "forest-general-store",
    items: [
      // existing item/shop configuration
    ],
  },

  "highlands-armory": {
    id: "highlands-armory",
    items: [
      // existing item/shop configuration
    ],
  },
};
```

Requirements:

- NPCs reference `shopId`.
- Shop definitions remain centralized.
- Do not duplicate full item/shop data inside NPC definitions.
- Reuse the existing shop data model if one already exists.

## Merchant Interaction Flow

When the player interacts with a merchant NPC:

```text
Approach Merchant
    ↓
Press interaction key
    ↓
Merchant dialogue/actions
    ↓
[Shop] [Sell] [Close]
```

Only show actions enabled by merchant configuration.

Examples:

```text
canBuy: true
canSell: true

=> [Shop] [Sell] [Close]
```

```text
canBuy: true
canSell: false

=> [Shop] [Close]
```

## Shop Action

When the player chooses `Shop`:

- Open the existing Shop modal/UI.
- Pass the merchant's `shopId`.
- Display the inventory associated with that shop.
- Preserve all existing purchase validation and pricing logic.
- Closing the Shop should return cleanly to the game / merchant flow.

Do not create a second Shop implementation.

## Sell Action

When the player chooses `Sell`:

- Open the existing Sell UI/modal.
- Allow the player to sell eligible inventory items.
- Reuse existing sell-price and inventory logic.
- Do not allow selling unless interacting with a merchant whose `canSell` is true.
- Preserve existing server-side validation.

Do not create a second Sell implementation.

## Merchant Context

The UI must know which merchant the player is interacting with.

Prefer a small reusable interaction context/state such as:

```js
{
  npcId: "forest-merchant-01",
  npcType: "merchant",
  shopId: "forest-general-store",
}
```

or reuse an equivalent existing NPC interaction state.

Avoid storing unrelated merchant state globally if the existing interaction system already provides the active NPC.

## Remove Global Shop / Sell Access

Audit current UI access points for Shop and Sell.

If Shop or Sell can currently be opened from:

- Main HUD
- Hero Panel
- Generic menu
- Keyboard shortcut
- Debug/default button

remove or disable those production access paths unless they are explicitly required for development tooling.

The intended player flow should be:

```text
World → Merchant NPC → Shop / Sell
```

Development-only shortcuts may remain if clearly gated to development mode.

## Server-Side Validation

Do not trust the client to open arbitrary shops or perform merchant-only actions.

Before processing purchase/sell requests, validate where practical that:

- The referenced shop exists.
- The merchant exists.
- The merchant has `npcType: "merchant"`.
- The merchant references the requested `shopId`.
- The merchant allows the requested action (`canBuy` / `canSell`).
- Existing gold/inventory ownership validation still passes.

Reuse current server methods and validation patterns.

Do not weaken existing purchase/sell security.

## Merchant Dialogue

Use the existing NPC dialogue/modal system.

Example:

```text
Travelling Merchant

"Looking for supplies?"

[Shop]
[Sell]
[Close]
```

Keep this simple.

No branching dialogue system is required.

## Multiple Merchants

The system should support different merchants using different shops.

Example:

```text
Forest Merchant
shopId: forest-general-store

Highlands Armorer
shopId: highlands-armory

Potion Vendor
shopId: potion-shop
```

Adding a new merchant should mainly require:

1. Adding/updating an NPC definition.
2. Assigning `npcType: "merchant"`.
3. Assigning a `shopId`.
4. Configuring `canBuy` / `canSell`.
5. Adding a shop definition only if a new inventory is needed.

## Architecture Requirements

Keep these responsibilities separated:

```text
NPC definition
    ↓
merchant config / shopId
    ↓
NPC interaction
    ↓
Shop / Sell actions
    ↓
existing Shop/Sell UI
    ↓
existing server validation
```

Requirements:

- Reuse existing Shop and Sell UI.
- Reuse existing inventory/gold logic.
- Reuse existing NPC interaction logic.
- Keep shop inventory definitions centralized.
- Avoid duplicating merchant logic across NPC files.
- Avoid unrelated refactors.
- Keep future support for specialized merchants easy.

## Not Required Yet

Do not implement:

- Merchant reputation
- Dynamic prices
- Merchant restocking timers
- Limited stock
- Buyback history
- Repair vendors
- Auction house
- Player trading
- Merchant schedules
- Random merchant inventories
- Different currencies
- Bartering

## Acceptance Criteria

The feature is complete when:

- A merchant NPC can expose Shop and Sell actions.
- Interacting with a non-merchant NPC does not show Shop/Sell.
- Shop opens through the merchant using the correct `shopId`.
- Sell opens through the merchant.
- Existing purchase logic still works.
- Existing sell logic still works.
- Direct/global production Shop access is removed or disabled.
- Direct/global production Sell access is removed or disabled.
- Different merchants can reference different shop inventories.
- `canBuy` and `canSell` independently control available actions.
- Invalid merchant/shop combinations are rejected.
- Existing gold and inventory validation remains intact.
- Closing Shop/Sell does not break NPC interaction or player controls.

## Implementation Process

Before implementation:

- Read `AGENTS.md`.
- Inspect the existing NPC interaction/dialogue implementation.
- Inspect the current Shop modal/components.
- Inspect the current Sell UI/components.
- Inspect current shop definitions and item pricing logic.
- Inspect inventory and gold server methods.
- Find all existing Shop/Sell entry points in the UI.
- Follow existing Meteor, React, Zustand, Tailwind, DaisyUI, and project conventions.
- Mention the exact file path for every created or modified file.

After implementation:

- Test a merchant with both Shop and Sell enabled.
- Test a merchant with only Shop enabled.
- Verify non-merchants cannot open Shop/Sell.
- Verify two merchants can use different `shopId` values.
- Verify purchase gold deductions still work.
- Verify sold items are removed correctly and gold is granted correctly.
- Verify invalid `shopId` requests fail safely.
- Verify direct/global production access is gone.
- Verify development-only shortcuts remain gated if any are kept.
- Run relevant syntax, import, server-side, and focused browser checks.
- Report all merchant NPCs and `shopId` mappings added or migrated.
