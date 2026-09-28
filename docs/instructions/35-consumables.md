# Consumables MVP

## Goal

Add simple consumable items that can be used directly from the inventory.

Keep it small, server-authoritative, and compatible with the existing inventory and shop systems.

## Consumables

### Health Potion

- Heals **25% of the player's max health**
- Instant effect

### Speed Potion

- **+10% Movement Speed**
- Duration: **5 minutes**

### Power Potion

- **+10% Damage**
- Duration: **5 minutes**

## Inventory Usage

Consumables are used from the existing inventory.

Flow:

```text
Left-click consumable
→ Show action menu
→ Click "Use"
→ Server validates item
→ Apply effect
→ Reduce quantity by 1
```

Remove the item stack when quantity reaches `0`.

## Buff Rules

For Speed Potion and Power Potion:

- duration: **5 minutes**
- persist while the player is alive
- do not stack the same potion effect multiple times
- using the same potion again should refresh the duration

## Shop

Extend the existing Vendor / Shop with consumables.

Suggested prices:

```text
Health Potion   2 Gold
Speed Potion    3 Gold
Power Potion   5 Gold
```

Reuse the existing shop purchase flow.

## Out of Scope

Do not add:

- consumable hotbar slots
- crafting
- potion cooldown systems
- potion rarity
- complex buff stacking
- new currencies

## Acceptance Criteria

- Consumables appear in the inventory.
- Left-clicking a consumable shows `Use`.
- Health Potion restores 25% max health.
- Speed Potion gives +10% movement speed for 5 minutes.
- Power Potion gives +10% damage for 5 minutes.
- Item quantity decreases after use.
- Shop sells all three consumables.
- Effects are validated server-side.
- Existing inventory and shop behavior remains intact.

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current inventory, item, player stat, and vendor/shop systems.
3. Reuse existing item and modal/dropdown patterns.
4. Keep consumable effects server-authoritative.
5. Use JavaScript only.
6. Avoid unrelated refactors.
7. Run relevant checks after implementation.
