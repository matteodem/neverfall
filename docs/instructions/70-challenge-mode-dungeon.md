# Dungeon Challenge Mode Mote

## Goal

Add an optional **Challenge Mode** to dungeons.

Challenge Mode is controlled by an interactable **mote** inside the dungeon.

The mote should be represented as an **orange glowing orb** and act as a toggle before combat begins.

As soon as any player attacks a dungeon enemy, the mote becomes permanently locked for that dungeon run and can no longer be changed.

Use JavaScript only.

Keep the implementation DRY, server-authoritative, multiplayer-safe, and MVP-sized.

---

## 1. Inspect Existing Dungeon Architecture

Before changing anything:

1. Read `AGENTS.md`.
2. Inspect the existing `DungeonRoom` implementation.
3. Inspect how dungeon instances / runs are created and destroyed.
4. Inspect current dungeon configuration.
5. Inspect how dungeon enemies are spawned.
6. Inspect how player attacks / damage against dungeon enemies are handled.
7. Inspect current interaction systems used for world objects.
8. Inspect existing Babylon.js asset / primitive helpers.
9. Inspect existing dungeon UI / notifications.
10. Inspect multiplayer room state and synchronization patterns.

Do not create a parallel dungeon architecture.

Reuse the current dungeon instance and state model.

---

## 2. Challenge Mode State

Each dungeon run should have server-authoritative Challenge Mode state.

Conceptually:

```js
{
  challengeModeEnabled: false,
  challengeModeLocked: false,
}
```

Use the existing Colyseus room state pattern if practical.

The exact field location should match the current dungeon architecture.

Do not persist Challenge Mode across separate dungeon runs.

A fresh dungeon instance should begin with:

```text
Challenge Mode: OFF
Mote: unlocked
```

---

## 3. Challenge Mote

Add one interactable Challenge Mote near the dungeon entrance / starting area.

Visual:

```text
orange glowing orb
```

The mote should:

- float slightly above the ground
- be clearly visible
- use simple low-poly / primitive geometry
- emit an orange glow
- feel magical but lightweight
- fit Neverfall's current visual style

Do not require a new external 3D asset for the MVP.

Use Babylon.js primitives / existing glow helpers if practical.

Keep geometry simple.

---

## 4. Mote Placement

Place the mote:

- near the dungeon entrance / player spawn
- somewhere players can reach before engaging enemies
- far enough away from combat so accidental attacks do not immediately interfere with interaction
- in a consistent location defined by dungeon config if possible

Do not hard-code special coordinates inside generic dungeon gameplay logic if dungeon configuration already supports spawn / object placement.

Prefer a config-driven position.

Example concept:

```js
challengeMote: {
  position: { x, y, z },
}
```

Only add this if it matches the current dungeon config style.

---

## 5. Toggle Behavior

Before combat begins, interacting with the mote toggles Challenge Mode:

```text
OFF → ON
ON → OFF
```

The toggle should affect the entire dungeon instance, not only the player who interacted with it.

All players inside the dungeon should see the same state.

When toggled, show clear feedback.

Example:

```text
Challenge Mode enabled.
Challenge Mode disabled.
```

Reuse the existing notification / message system.

---

## 6. Mote Visual States

The mote should clearly communicate its current state.

Suggested:

### Challenge Mode OFF

```text
orange glow
lower intensity
```

### Challenge Mode ON

```text
orange glow
stronger intensity
optional small pulse
```

### Locked

```text
still visible
but no longer interactable
```

Optional locked feedback:

```text
Challenge Mode locked.
```

Do not add an elaborate shader system.

Reuse existing emissive material / glow-layer patterns.

---

## 7. Lock Condition

This is the critical rule.

As soon as **any player attacks any dungeon mob**, Challenge Mode must become locked for the rest of that dungeon run.

Conceptually:

```text
first valid player attack against dungeon enemy
→ challengeModeLocked = true
```

After this:

```text
mote can no longer toggle Challenge Mode
```

The currently selected state remains active for the rest of the run.

Examples:

```text
Challenge OFF
→ player attacks mob
→ Challenge OFF locked

Challenge ON
→ player attacks mob
→ Challenge ON locked
```

Do not automatically enable Challenge Mode when combat starts.

Only lock the currently selected state.

---

## 8. What Counts as "Attacking a Mob"

Reuse the actual existing server-authoritative dungeon combat path.

The lock should happen when a player performs a valid attack / damage action against a dungeon enemy.

Prefer locking when the server confirms the first valid attack or damage interaction.

Do not rely only on:

```text
client key press
animation start
mouse click
```

because those can happen without hitting a mob.

The lock must be authoritative in `DungeonRoom` / existing server combat logic.

If the existing combat architecture has a clean `damageEnemy` / `attackEnemy` entry point, hook the lock there.

Do not duplicate combat logic.

---

## 9. Multiplayer Synchronization

Challenge Mode is shared by all players in the dungeon instance.

Requirements:

- one player can toggle it before combat
- every player sees the updated state
- once any player attacks a dungeon mob, it locks for everyone
- two players interacting simultaneously cannot create inconsistent state
- late joiners receive the current mode and lock state

Use the existing Colyseus room-state synchronization pattern.

The server is the source of truth.

---

## 10. Interaction Rules

When unlocked:

```text
player near mote
→ interact
→ toggle
```

When locked:

```text
player near mote
→ interaction does not change state
```

If the player attempts to use a locked mote, optionally show:

```text
Challenge Mode is locked because combat has started.
```

Reuse the existing interaction prompt system if one exists.

Do not build a new interaction framework.

---

## 11. Challenge Mode Gameplay Effect

For this task, implement only the **Challenge Mode toggle and lock infrastructure** unless the repository already has a defined Challenge Mode difficulty configuration.

Do not invent a large difficulty system.

If there is already a planned / existing dungeon difficulty mode system, integrate with it.

Otherwise, store and expose:

```text
challengeModeEnabled
```

so future tasks can apply:

```text
higher enemy HP
higher enemy damage
better rewards
extra mechanics
```

Do not add those balancing changes in this task unless already defined elsewhere in the codebase.

---

## 12. UI / Feedback

Keep UI minimal.

The player should be able to understand:

```text
Challenge Mode OFF
Challenge Mode ON
Challenge Mode locked
```

Possible feedback:

- mote glow intensity
- small interaction text
- existing toast / notification
- optional compact dungeon status label

Do not add a large new HUD panel.

---

## 13. Dungeon Reset / New Instance

Challenge Mode state must reset for every new dungeon run.

A newly created dungeon instance should always begin:

```text
challengeModeEnabled = false
challengeModeLocked = false
```

Do not carry the previous run's state into a new room / dungeon instance.

---

## 14. Player Death / Respawn

Player death must not unlock the mote.

Once locked:

```text
locked until dungeon run ends
```

Respawning, reviving, or rejoining the same dungeon instance must not reset Challenge Mode.

---

## 15. Enemy Reset / Wipe

If the dungeon has a wipe/reset mechanism, do not automatically unlock Challenge Mode unless the entire dungeon instance is recreated.

Rule:

```text
same DungeonRoom instance
→ lock remains
```

Only a fresh dungeon run resets the mote.

---

## 16. Cleanup

When `DungeonRoom` is disposed:

- remove / dispose the client mote visual through existing dungeon cleanup
- clear any interaction observers
- do not leave global state behind
- do not leak Babylon.js meshes / materials / observers

---

## 17. Suggested Architecture

Do not force these exact files if equivalent modules already exist.

Possible separation:

```text
DungeonRoom
→ server-authoritative challenge state
→ locks state on first valid attack

dungeon config
→ challenge mote position

client dungeon scene
→ orange glowing orb
→ interaction prompt
→ visual state

existing dungeon networking
→ sync challengeModeEnabled / challengeModeLocked
```

Keep combat logic and visual logic separate.

---

## 18. Acceptance Criteria

The task is complete when:

- a Challenge Mote exists inside the dungeon near the entrance
- it is represented as an orange glowing orb
- Challenge Mode defaults to OFF
- the mote can toggle Challenge Mode ON/OFF before combat
- the state is shared by all players in the same dungeon
- all players see state changes
- the first valid attack against a dungeon mob locks the mote
- after locking, the mode cannot be changed
- the selected mode remains unchanged after locking
- player death / respawn does not unlock it
- late joiners receive the correct state
- a new dungeon run resets the state
- the implementation is server-authoritative
- no duplicate combat logic is introduced
- no unrelated dungeon systems are rewritten
- no large Challenge Mode balancing system is added unless one already exists

---

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect `DungeonRoom`, dungeon configs, dungeon enemy combat, room state, dungeon interaction patterns, and client dungeon rendering before changing code.
3. Add server-authoritative per-run state for `challengeModeEnabled` and `challengeModeLocked`, following the existing Colyseus state architecture.
4. Default both values to `false` for every new dungeon instance.
5. Add one interactable Challenge Mote near the dungeon entrance / spawn using a simple orange glowing Babylon.js orb and existing interaction / glow helpers where possible.
6. Make the mote toggle `challengeModeEnabled` while `challengeModeLocked === false`.
7. Synchronize Challenge Mode state to every player in the dungeon.
8. Lock Challenge Mode permanently for the current dungeon run as soon as the server confirms the first valid player attack / damage against any dungeon enemy.
9. Do not lock from a client key press alone; hook into the real authoritative dungeon combat path.
10. Once locked, preserve the current enabled/disabled state and reject further mote toggles.
11. Provide small existing-style feedback for enabled, disabled, and locked states.
12. Do not unlock Challenge Mode on player death, respawn, enemy reset, or reconnect to the same DungeonRoom.
13. Reset the state only when a fresh dungeon instance is created.
14. Keep the challenge mote position config-driven if the current dungeon config structure supports it.
15. For this task, do not invent additional HP/damage/reward modifiers unless an existing Challenge/Difficulty system already defines them.
16. Use JavaScript only.
17. Keep the implementation DRY and MVP-sized.
18. Do not rewrite unrelated dungeon, combat, matchmaking, loot, or player systems.
19. Run relevant checks.
20. Test with at least two players if practical:
    - Player A enables Challenge Mode
    - Player B sees it enabled
    - Player B disables it before combat
    - Player A attacks a dungeon mob
    - mote becomes locked for both
    - neither player can toggle it afterward
    - late join / reconnect receives correct state
    - fresh dungeon run resets to OFF + unlocked
21. In the final response, list every changed file with its exact path.
22. Also report:
    - where challenge state is stored
    - where the first-attack lock is triggered
    - how the mote position is configured
    - how multiplayer sync works
    - whether an existing difficulty system was reused
