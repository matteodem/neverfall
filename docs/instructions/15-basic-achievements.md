# Achievement System MVP

## Goal

Add a small persistent achievement system.

Keep it simple, DRY, and MVP-sized.

---

## Scope

Add:

- persistent achievements per character
- progress tracking
- unlock state
- small unlock toast
- `Achievements` menu button
- `AchievementModal`

Do not add rewards yet.

---

## Achievement Modal

Add a new HUD menu button:

```text
Achievements
```

It opens an `AchievementModal`.

The modal should show:

- achievement name
- short description
- current progress
- unlocked / locked state

Example:

```text
Wolf Hunter
Defeat 10 wolves.
7 / 10
```

Reuse the existing `HudModal` / DaisyUI patterns.

---

## Initial Achievements

Start with a small set:

```text
First Blood
Defeat 1 enemy.

Boar Slayer
Defeat 100 boars.

Wolf Hunter
Defeat 100 wolves.

Getting Stronger
Reach level 5.

Legend of Neverfall
Reach the maximum character level.

Treasure Hunter
Collect your first loot item.

Equipped
Equip your first item.

Mounted
Use a mount for the first time.

Boss Killer
Defeat the Forest Giant.
```

Keep definitions in one central config.

---

## Persistence

Achievement progress should belong to the character.

Suggested shape:

```js
achievements: {
  firstBlood: {
    progress: 1,
    unlocked: true,
  },
}
```

Existing characters without achievement data must continue to work.

---

## Tracking

Reuse existing game events where possible:

- enemy kills
- boar / wolf kills
- level changes
- loot collection
- equipment changes
- mounting
- boss kills

Do not create a new event system unless necessary.

---

## Unlock Toast

When an achievement unlocks, show a small toast:

```text
Achievement Unlocked
Wolf Hunter
```

Only show the toast once when the achievement becomes unlocked.

---

## Achievement Points

Do **not** add Achievement Points yet.

For the MVP, unlocks themselves are enough.

Keep the data/config easy to extend with points later if desired.

---

## Out of Scope

Do not add:

- achievement rewards
- achievement points
- categories
- hidden achievements
- titles
- leaderboards
- account-wide achievements
- complex animations

---

## Acceptance Criteria

- Achievements persist per character.
- Progress updates from existing game events.
- Achievements unlock automatically.
- Unlock toast appears once.
- `Achievements` menu button opens the modal.
- Modal shows progress and unlock state.
- Existing characters still work.

---

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect existing HUD modal/menu patterns.
3. Inspect current kill, loot, level, equipment, mount, and boss flows.
4. Reuse existing events/state where possible.
5. Keep it small and DRY.
6. Avoid unrelated refactors.
7. Run relevant checks after implementation.
