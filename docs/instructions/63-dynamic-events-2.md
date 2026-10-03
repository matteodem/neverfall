# Dynamic Events 2.0 / Regional Event Chains

## Goal

Upgrade the existing World Event system into short **regional event chains**.

Each chain should have:

```text
Phase 1
→ Phase 2
→ Final Elite / Boss
→ Reward
```

Keep it reusable, config-driven, and MVP-sized.

---

## Existing Highlands Event — Extend Wolf Invasion

Do **not** create a separate new Northern Camp attack event.

Extend the existing **Wolf Invasion / Wolf Attack event at Northern Camp** into a multi-phase chain.

Suggested flow:

```text
Wolf Invasion starts
→ Defend Northern Camp
→ Clear / destroy 3 wolf dens or similar wolf objectives
→ Defeat an Alpha Wolf / final elite
→ Reward
```

Reuse the existing Wolf Invasion event state, spawn logic, map markers, rewards, and Northern Camp location where possible.

The goal is to turn the current event into a richer chain, not duplicate it.

---

## Snowy Mountains — Frozen Rift

Add a second regional chain:

```text
Defeat invading enemies
→ Activate 2 ancient seals
→ Defeat the Frost Boss
→ Reward
```

Use existing enemy / boss / interaction systems wherever possible.

---

## Requirements

- reuse the existing World Event system
- do not create a separate parallel event framework
- make chains config-driven where practical
- keep event logic DRY
- each chain should define:
  - id
  - region
  - phases
  - phase objectives
  - enemy / boss config
  - rewards
  - cooldown / availability
- advance automatically when a phase is complete
- show current phase / objective in the existing World Event UI
- update World Map / Minimap markers using the existing event marker system
- preserve multiplayer synchronization
- keep rewards server-authoritative
- only one active chain per region for MVP
- if the current architecture is simpler with one global active chain, keep that instead of overengineering

---

## Config Concept

Use the existing architecture, but aim for something conceptually like:

```js
{
  id: "wolf-invasion",
  region: "highlands",
  phases: [
    { type: "defend", objective: ... },
    { type: "clear", objective: ... },
    { type: "boss", objective: ... },
  ],
  rewards: {...},
  cooldown: ...
}
```

Do not hardcode each phase directly into generic event logic.

---

## Preserve

Do not break:

- existing Wolf Invasion behavior
- existing World Events
- enemy spawning
- boss mechanics
- rewards
- map / minimap markers
- multiplayer
- quests / achievements
- loading / culling

---

## Acceptance Criteria

- the existing Wolf Invasion becomes a 2–3 phase regional event chain
- no duplicate Northern Camp attack event is created
- Snowy Mountains has a separate Frozen Rift chain
- phase progression works automatically
- final elite / boss completes the chain
- rewards are granted once
- existing World Event UI shows current phase
- map / minimap markers update correctly
- multiplayer players see the same phase state
- generic event logic stays reusable / DRY

---

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current World Event implementation first.
3. Locate the existing Wolf Invasion / Wolf Attack event at Northern Camp.
4. Extend that existing event into a multi-phase chain instead of adding a new Northern Camp event.
5. Reuse existing Wolf Invasion config, spawn logic, markers, rewards, and event state where possible.
6. Add:
   - Highlands: upgraded Wolf Invasion chain
   - Snowy Mountains: Frozen Rift chain
7. Make event chains config-driven where practical.
8. Reuse existing enemy / boss / reward / marker systems.
9. Keep only one active chain per region for MVP, or one global active chain if that better matches the current architecture.
10. Use JavaScript only.
11. Do not perform unrelated refactors.
12. Run relevant checks.
13. In the final response, list every changed file with its exact path.
