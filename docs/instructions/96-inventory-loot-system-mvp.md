# Inventory and Loot System

## Goal

Add a small MVP inventory and loot system that connects enemies, merchants, quests, and the existing Gear tab without turning it into a full RPG item system.

## Scope

### Inventory

- Add persistent character inventory.
- Support:
  - weapons
  - armor
  - consumables
- Keep item definitions centralized.
- Support stacking where appropriate.
- Persist inventory across reloads/reconnects.

### Loot

- Add configurable enemy loot tables.
- Loot rolls must be server-authoritative.
- Bosses should use the same loot system.
- Show a small temporary loot notification when items are received.

### Equipment

Keep equipment minimal.

- Extend the existing Gear tab to show currently equipped items.
- Allow simple Equip / Unequip actions.
- Equipped items should override the existing class default Amir equipment.
- If no item is equipped, fall back to the class default equipment.
- Support basic class restrictions where needed.

Do not add advanced stats or item comparisons yet.

### Merchants

Reuse the existing merchant NPC Shop / Sell flow.

- Buying adds items to inventory.
- Selling removes items from inventory and grants gold.
- Keep existing server-side validation.

### Quest Rewards

Allow quests to optionally reward items through the same inventory system.

Example:

```js
rewards: {
  xp: 250,
  gold: 2,
  items: [
    {
      itemId: "iron-sword",
      quantity: 1,
    },
  ],
}
```

## MVP Item Example

```js
{
  id: "iron-sword",
  name: "Iron Sword",
  type: "weapon",
  equipmentSlot: "weapon",
  gameClass: "Warrior",
  amirMeshId: "sword-102",
  stackable: false,
}
```

## Not Required Yet

Do not implement:

- rarity tiers
- random affixes
- crafting
- durability
- sockets
- set bonuses
- complex stats
- drag-and-drop inventory
- auction house
- player trading
- physical loot bags

## Acceptance Criteria

- Characters have persistent inventories.
- Enemies can drop configured items.
- Items can be equipped / unequipped.
- Gear tab shows current equipment.
- Equipped gear updates the Amir character mesh.
- Merchants can buy/sell inventory items.
- Quests can grant item rewards.
- Consumables can be used.
- Existing combat, quests, merchants, and character rendering still work.

## Implementation Notes

- Read `AGENTS.md`.
- Reuse existing Meteor, Colyseus, Zustand, React, and Amir patterns.
- Avoid unrelated refactors.
- Mention the exact file path for every created or modified file.
- Run focused server-side and browser checks after implementation.
