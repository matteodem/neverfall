# Boss Mechanics Light

## Goal

Add a few simple mechanics to make bosses more interesting without creating a complex raid system.

Keep it:

- MVP-sized
- DRY
- server-authoritative
- reusable for open-world bosses and dungeon bosses

---

## Mechanics

### 1. Telegraph AoE

Boss occasionally targets an area on the ground.

Flow:

```text
show warning circle
↓
short delay
↓
deal AoE damage
```

Suggested values:

```js
telegraphDuration: 1500
radius: 3
cooldown: 8000
```

Use a simple colored ground circle.

---

### 2. Charge Attack

Boss occasionally charges toward a target player.

Requirements:

- short wind-up
- move quickly toward the target
- damage players hit by the charge
- clear cooldown

Keep pathing simple.

---

### 3. Enrage Phase

At low HP:

```text
HP <= 30%
```

Boss enters Enrage.

Suggested effect:

```text
+25% damage
+20% movement speed
```

Trigger only once.

Add a small message such as:

```text
The boss becomes enraged!
```

---

## Boss Intro

When the fight starts, briefly show:

```text
Boss Name
```

Optionally include a short subtitle.

Keep the UI lightweight.

---

## Multiplayer

Boss mechanics must be authoritative on the server.

Clients should only receive/sync:

- telegraph state
- charge state
- boss state
- resulting damage

Do not trust client-side damage.

---

## Reuse

Implement mechanics so they can be reused by multiple boss types later.

Avoid hardcoding everything directly into one boss.

---

## Out of Scope

Do not add:

- complex phase scripting
- raid mechanics
- threat tables
- interrupts
- status effects
- boss-specific currencies
- complex cutscenes
- advanced pathfinding

---

## Acceptance Criteria

- Boss can cast a telegraphed AoE.
- Boss can perform a charge attack.
- Boss enrages below 30% HP.
- Mechanics work with multiple players.
- Damage remains server-authoritative.
- Existing boss behavior still works.
- Mechanics are reusable for future bosses.

---

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the existing boss/enemy architecture.
3. Reuse existing movement, combat, and state-sync patterns.
4. Keep mechanics small and reusable.
5. Avoid unrelated refactors.
6. Run relevant checks after implementation.
