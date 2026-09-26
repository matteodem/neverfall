# Neverfall Dungeon Instance MVP

## Goal

Add one very small instanced dungeon.

Keep it MVP-sized, DRY, and simple.

---

## Scope

Create:

- 1 dungeon entrance portal in the open world (to the south of the map)
- solo entry if the player has no party
- party entry if the player is in a party
- max 5 players
- 1 separate Colyseus dungeon room/instance
- 2–3 small enemy packs
- 1 mini-boss
- 1 final boss
- 1 reward chest
- 1 exit portal

---

## Portal Flow

When a player interacts with the dungeon portal:

- if solo → create/join a solo dungeon instance
- if in a party → party members can join the same dungeon instance
- only members of that party may enter that instance

Keep the interaction simple.

Example:

```text
Enter Dungeon
```

---

## Dungeon Instance

Use a separate Colyseus room, for example:

```text
dungeon
```

The instance should have its own:

- players
- enemies
- boss state
- completion state

Do not mix dungeon enemies with the open-world room.

---

## Dungeon Flow

```text
Enter portal
↓
Enemy Pack 1
↓
Enemy Pack 2
↓
Mini-Boss
↓
Final Boss
↓
Reward Chest
↓
Exit Portal
```

Keep the map small.

---

## Rewards

On first completion of the instance, reward participating players with:

- XP
- Gold
- chance for an existing equipment item

Reuse the current loot/inventory/equipment systems.

Do not create a new loot architecture.

---

## Death / Wipe

Keep it simple:

- dead players respawn at the dungeon entrance
- dungeon progress stays active
- no complicated wipe/reset system yet

---

## Out of Scope

Do not add:

- dungeon finder
- matchmaking
- difficulty modes
- dungeon keys
- checkpoints
- multiple dungeons
- complex boss mechanics
- raid systems
- dungeon quests
- dungeon-specific currencies

---

## Acceptance Criteria

- Solo players can enter.
- Parties can enter the same private instance.
- Other players cannot enter that party's instance.
- Dungeon enemies are isolated from the open world.
- Final boss completion unlocks the reward chest.
- Players can leave through an exit portal.
- Existing multiplayer, loot, and party systems keep working.

---

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the existing party and Colyseus room architecture.
3. Reuse existing enemy, combat, loot, and player systems.
4. Keep the dungeon implementation minimal and DRY.
5. Avoid large refactors.
6. Run relevant checks after implementation.
