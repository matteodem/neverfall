# Dynamic World Events 2.0

## Goal

Add a reusable dynamic world event system while keeping the existing Hunt Quests.

Keep it server-authoritative, DRY, and MVP-sized.

---

## Keep Hunt Quests

Do **not** remove the current Hunt Quests.

They remain simple solo-friendly objectives such as:

```text
Kill 5 Wolves
Kill 5 Boars
```

Dynamic Events should complement them, not replace them.

---

## First Dynamic Event

Implement one event first:

```text
Wolf Invasion
```

Flow:

```text
Event starts
↓
Wave 1
↓
Wave 2
↓
Wave 3
↓
Alpha Wolf / Boss
↓
Event completed
↓
Rewards
↓
Cooldown
```

---

## Event Behavior

The event should support:

- automatic start/end
- multiple waves
- shared progress
- nearby participant tracking
- completion rewards
- cooldown before it can start again
- simple world announcement

Example:

```text
World Event: Wolves are attacking the camp!
```

---

## Rewards

Reward participating players with existing systems:

- XP
- Gold
- existing loot/equipment chances

Do not create a new reward architecture.

---

## Reusability

Build the event system so future events can mostly be added through config.

Example future events:

- Forest Giant Awakens
- Defend the Camp
- Highlands Event

Do not hardcode everything around Wolf Invasion.

---

## UI

Add a lightweight event tracker while the player is participating.

Example:

```text
Wolf Invasion
Wave 2 / 3
Enemies remaining: 4
```

Keep it separate from normal Hunt Quest progress.

---

## Out of Scope

Do not add:

- event matchmaking
- event currencies
- complex scaling
- large quest redesign
- new NPC system
- new asset requirements
- raid mechanics

---

## Acceptance Criteria

- Existing Hunt Quests still work.
- Wolf Invasion can start automatically.
- Event progresses through multiple waves.
- Multiple nearby players share event progress.
- Participants receive rewards on completion.
- Event enters a cooldown after completion.
- Event UI is separate from Hunt Quests.
- Architecture can support future events.

---

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the existing Hunt Quest, enemy spawn, reward, and boss systems.
3. Keep Hunt Quests unchanged.
4. Reuse current enemy/combat/reward infrastructure.
5. Keep the event system config-driven and DRY.
6. Avoid unrelated refactors.
7. Run relevant checks after implementation.
