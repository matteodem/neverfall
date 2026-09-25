# v0.4 — Equipment Light

## Goal

Add a small equipment system to Neverfall that makes loot and inventory more meaningful without changing the character's visual appearance.

Keep the implementation:

- MVP-sized
- DRY
- simple
- JavaScript only
- compatible with the existing React + DaisyUI + Zustand + Meteor + MongoDB + Colyseus architecture
- server-authoritative where stats/equipment affect gameplay

Do not redesign the current inventory or character systems.

---

## Scope

For v0.4, support only these equipment slots:

- `ring`
- `accessory`

Do **not** add:

- weapons
- armor
- helmets
- boots
- gloves
- visual equipment meshes
- item rarity

Equipping or unequipping an item must **not change the character model**.

The current Knight/Warrior appearance should remain exactly the same whether an item is equipped or not.

---

## Initial Items

Implement two ring variants.

### 1. Ring of Vitality

Suggested ID:

```js
ring_vitality
```

Display name:

```text
Ring of Vitality
```

Effect:

```text
+25 Max HP
```

### 2. Ring of Strength

Suggested ID:

```js
ring_strength
```

Display name:

```text
Ring of Strength
```

Effect:

```text
+5 Attack Damage
```

Keep the values easy to change through item configuration.

Do not hardcode item stat logic throughout the codebase.

Prefer a central item/equipment definition such as:

```js
{
  id: "ring_vitality",
  name: "Ring of Vitality",
  slot: "ring",
  stats: {
    maxHealth: 25,
  },
}
```

and:

```js
{
  id: "ring_strength",
  name: "Ring of Strength",
  slot: "ring",
  stats: {
    attackDamage: 5,
  },
}
```

---

## Accessory Slot

Add support for an `accessory` equipment slot now so the system is ready for future accessory items.

For this first implementation:

- the slot should exist
- it may remain empty
- no accessory item is required yet

Do not invent additional accessory content unless necessary for testing.

---

## Character Equipment Data

Equipment should belong to the character, not the account.

Suggested shape:

```js
equipment: {
  ring: null,
  accessory: null,
}
```

If an item is equipped, store enough information to identify the equipped item.

Prefer storing the item ID rather than duplicating the full item definition.

Example:

```js
equipment: {
  ring: "ring_vitality",
  accessory: null,
}
```

Follow the existing Character collection/data patterns.

Existing characters without `equipment` must continue to work.

Use safe defaults rather than requiring a database migration unless truly necessary.

---

## Inventory Interaction

The existing inventory should remain the main place where equipment is managed.

### Left-click behavior

When the player left-clicks an equippable inventory item, open a small DaisyUI dropdown/context menu attached to that item.

The menu should contain:

```text
Equip item
```

Use existing DaisyUI patterns/components already present in the project.

Do not create a custom menu framework.

### Equip behavior

When the player clicks:

```text
Equip item
```

the item should:

1. Equip into the matching equipment slot.
2. Update the character's equipment data.
3. Immediately update the player's effective stats.
4. Update the inventory/equipment UI reactively.

If another item is already equipped in that slot:

- replace the equipped item with the new one
- do not delete either item
- keep inventory behavior simple and consistent with the current inventory data model

Inspect the current inventory storage format first and choose the smallest safe implementation.

---

## Equipment UI

Add a small equipment section to the current Inventory modal.

Keep the current light-mode design.

Show two slots:

```text
Ring
Accessory
```

Example layout:

```text
Equipment

[ Ring        ]   [ Accessory   ]
[ Vitality    ]   [ Empty       ]
```

Requirements:

- compact
- visually consistent with the current inventory
- no character paper-doll
- no 3D preview
- no item rarity colors
- no visual equipment on the character

If a ring is equipped, display its name and stat bonus.

Example:

```text
Ring of Vitality
+25 Max HP
```

---

## Unequip

Allow the equipped item to be unequipped.

A simple interaction is enough.

Preferred behavior:

- left-click the equipped equipment slot
- show a DaisyUI dropdown with:

```text
Unequip item
```

Unequipping should:

- clear the equipment slot
- remove its stat bonus
- preserve the item in the character's inventory

Do not add drag-and-drop.

---

## Effective Player Stats

Equipment bonuses must affect actual gameplay.

The final effective stats should be calculated from:

```text
Base Character Stats
+
Equipment Bonuses
```

Example:

```js
effectiveMaxHealth =
  baseMaxHealth +
  equipmentMaxHealth;
```

```js
effectiveAttackDamage =
  baseAttackDamage +
  equipmentAttackDamage;
```

Do not permanently modify base stats when an item is equipped.

Create/reuse a single helper for calculating effective stats so stat logic stays DRY.

Possible concept:

```js
getEquipmentStats(equipment)
```

or:

```js
getPlayerStats(character)
```

Follow the existing player stats architecture if one already exists.

---

## Health Behavior

`Ring of Vitality` increases **maximum health**, not just current health.

Example:

```text
Base HP: 100
Ring bonus: +25
Effective max HP: 125
```

When equipping the ring:

- max health should update immediately
- current health should not exceed the new maximum

When unequipping the ring:

- max health returns to the base value
- if current health is above the new maximum, clamp it to the new maximum

Do not fully heal the player when equipping or unequipping the ring.

---

## Attack Damage Behavior

`Ring of Strength` increases actual outgoing player attack damage.

Example:

```text
Base damage: 10
Ring bonus: +5
Effective damage: 15
```

Damage must remain server-authoritative.

Do not trust a damage value sent directly by the client.

The server should calculate or validate the effective attack damage from the character's equipment.

---

## Multiplayer / Server Authority

Equipment affects gameplay stats, so equipment state and derived combat stats must be authoritative on the server.

Requirements:

- client requests equip/unequip
- server validates ownership of the item
- server validates that the item can be equipped in that slot
- server persists the equipment state
- combat uses server-side effective stats
- health/max-health logic uses authoritative effective stats where applicable

Do not create a separate networking system.

Reuse the current Meteor/Colyseus architecture.

---

## Item Ownership Validation

The server must prevent equipping arbitrary item IDs.

Before equipping:

1. Confirm the character belongs to the current user.
2. Confirm the item exists in the character inventory.
3. Confirm the item is equippable.
4. Confirm the item's slot matches the target equipment slot.

Do not trust the client.

---

## Item Definitions

Keep item metadata in one central location.

The definition should support at least:

```js
{
  id,
  name,
  slot,
  stats,
}
```

Example:

```js
export const EQUIPMENT_ITEMS = {
  ring_vitality: {
    id: "ring_vitality",
    name: "Ring of Vitality",
    slot: "ring",
    stats: {
      maxHealth: 25,
    },
  },

  ring_strength: {
    id: "ring_strength",
    name: "Ring of Strength",
    slot: "ring",
    stats: {
      attackDamage: 5,
    },
  },
};
```

If there is already an item configuration/module in the project, extend it instead of creating a duplicate system.

---

## Getting the Rings

Do not build a new loot system.

Use the existing loot/inventory architecture.

For development/testing, make the two rings obtainable through the smallest practical change.

Acceptable options:

- add them to an existing enemy loot table
- add a temporary simple drop chance
- use an existing debug/development mechanism

Prefer integrating them into existing loot configuration if possible.

Keep drop rates easy to configure.

Do not create vendors, crafting, quests, or rarity systems for these rings.

---

## UI Details

### Inventory item dropdown

Left-clicking a ring should show something equivalent to:

```text
Ring of Vitality
+25 Max HP

Equip item
```

or:

```text
Ring of Strength
+5 Attack Damage

Equip item
```

Keep it compact.

### Equipped item dropdown

Left-clicking an equipped ring should show:

```text
Ring of Vitality
+25 Max HP

Unequip item
```

Use DaisyUI dropdown styling.

---

## Suggested Architecture

Inspect the repository first.

Possible responsibilities:

```text
imports/game/equipment.js
```

Could contain:

- equipment item definitions
- equipment stat aggregation
- formatting/helper functions

Server-side methods/actions should live alongside the existing character/inventory server architecture.

UI changes should remain in or near the existing Inventory modal.

Do not create new files unless they improve clarity.

---

## Backwards Compatibility

Existing characters may not have an `equipment` field.

Treat missing equipment as:

```js
{
  ring: null,
  accessory: null,
}
```

Do not break old characters.

---

## Out of Scope

Do not implement:

- armor
- weapons
- helmets
- boots
- gloves
- necklaces unless later used as accessory items
- item rarity
- equipment durability
- item levels
- stat requirements
- character level requirements
- bind-on-pickup
- trading
- vendors
- crafting
- equipment sets
- random stat rolls
- enchantments
- socketing
- visual equipment meshes
- drag-and-drop
- comparison tooltips
- multiple ring slots

These can be added later.

---

## Acceptance Criteria

The feature is complete when:

1. A character has `ring` and `accessory` equipment slots.
2. `Ring of Vitality` can exist in the inventory.
3. `Ring of Strength` can exist in the inventory.
4. Left-clicking a ring opens a DaisyUI menu with `Equip item`.
5. Equipping the vitality ring increases max HP by 25.
6. Equipping the strength ring increases attack damage by 5.
7. Equipping one ring replaces the previously equipped ring.
8. The equipped ring appears in the Inventory modal's equipment section.
9. An equipped ring can be unequipped.
10. Unequipping correctly removes the stat bonus.
11. The character model looks exactly the same with or without equipment.
12. Equipment persists with the character.
13. Server-side combat does not trust client-provided damage.
14. Existing characters without equipment still work.
15. No item rarity system is introduced.

---

## Codex Instructions

Before implementing:

1. Read `AGENTS.md`.
2. Inspect the existing Character schema/data structure.
3. Inspect the current inventory implementation.
4. Inspect the current player stat calculation.
5. Inspect the current server combat/damage flow.
6. Inspect the current Inventory modal and DaisyUI usage.
7. Reuse existing patterns and helpers.
8. Keep the implementation MVP-sized and DRY.
9. Do not introduce unnecessary dependencies.
10. Do not perform large unrelated refactors.
11. Keep gameplay-affecting stats server-authoritative.
12. Run relevant checks after implementation.
