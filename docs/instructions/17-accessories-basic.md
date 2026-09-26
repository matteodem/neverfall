# Accessories MVP

## Goal

Add simple accessories to the existing equipment system.

Keep it small, DRY, and reuse the current ring/equipment logic.

---

## Accessories

Add 3 starter accessories:

### Lucky Charm

```text
+5% XP gain
```

### Guardian Talisman

```text
+10 Max HP
+2 Attack Damage
```

### Swift Feather

```text
+5% Movement Speed
```

Accessories should not change the character's visual appearance.

---

## Equipment

Use the existing slot:

```js
equipment: {
  ring: null,
  accessory: null,
}
```

Reuse the existing:

- Equip item dropdown
- Unequip flow
- server-side validation
- equipment stat aggregation
- inventory UI

Do not create a separate accessory system.

---

## Drops

Normal enemies can drop accessories.

Suggested base drop chance:

```js
accessoryDropChance: 0.05
```

Approximately 5%.

Keep the chance easy to configure.

Bosses may use higher chances later.

---

## Stats

Accessory bonuses must affect real gameplay.

Keep gameplay-affecting stats server-authoritative.

Extend the existing stat helper instead of duplicating stat logic.

---

## Out of Scope

Do not add:

- rarity
- visual accessory models
- random stats
- proc effects
- crit chance
- multiple accessory slots
- accessory upgrades

---

## Acceptance Criteria

- Accessories can drop from enemies.
- Accessories appear in the inventory.
- `Equip item` equips them into the accessory slot.
- Existing accessories can be replaced/unequipped.
- Stat bonuses apply correctly.
- Accessories persist with the character.
- Existing ring behavior remains unchanged.

---

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the existing ring/equipment implementation.
3. Reuse current inventory and equipment patterns.
4. Keep changes minimal and DRY.
5. Keep stats server-authoritative.
6. Run relevant checks after implementation.
