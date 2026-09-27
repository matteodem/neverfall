# Camp Safe Zone & Respawn Protection

## Goal

Prevent players from getting stuck in a death loop during events near the camp.

Keep it simple, DRY, and server-authoritative where needed.

---

## Camp Safe Zone

Add a safe zone around the camp respawn point.

Suggested radius:

```js
safeZoneRadius: 10
```

Enemies should:

- not enter the safe zone
- not aggro players inside the safe zone
- stop chasing if the player reaches the safe zone

Reuse existing enemy movement/aggro logic.

---

## Respawn Protection

After respawn, give the player temporary protection.

Suggested duration:

```js
respawnProtectionMs: 5000
```

While protected:

- enemies cannot damage the player
- player cannot be immediately re-aggroed

Protection ends early if the player attacks.

---

## Event Behavior

If the camp event is active and no living player is participating:

- wolves should not camp the respawn point
- keep them outside the safe zone
- use the simplest existing event behavior for continuing/pausing/failing

Do not let enemies stack directly on the respawn location.

---

## Out of Scope

Do not add:

- long invulnerability buffs
- teleport escape systems
- complex event reset logic
- new UI beyond an optional small protection indicator

---

## Acceptance Criteria

- Respawning players are not instantly killed again.
- Enemies do not enter the camp safe zone.
- Enemy aggro stops at the safe zone.
- Respawn protection lasts about 5 seconds.
- Protection ends if the player attacks.
- Existing combat/event logic continues to work.

---

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current respawn, enemy aggro, and camp event logic.
3. Reuse existing position/distance helpers.
4. Keep the implementation minimal and DRY.
5. Keep damage/aggro rules server-authoritative.
6. Avoid unrelated refactors.
7. Run relevant checks after implementation.
