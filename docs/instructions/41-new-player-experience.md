# Adventure Guide + Quest UI Cleanup

## Goal

Create a clearer progression flow for new characters up to **Level 10**.

Rename the previous "New Player Experience" concept to:

```text
Adventure Guide
```

Keep the HUD simple by merging quest-related UI into one system.

## HUD

After this change, the main HUD should only keep these progression-related elements:

- **Adventure Guide**
- **World Event**

Remove separate Quest Log / Hunt HUD elements.

## Adventure Guide

Show exactly **one recommended objective at a time**.

Example progression:

```text
Level 1
Defeat 3 Boars
```

```text
Loot an item
```

```text
Equip your first item
```

```text
Reach Level 2
```

```text
Complete your first Hunt
```

```text
Open the World Map
```

```text
Visit the Northern Camp
```

Continue with simple recommended goals up to **Level 10**.

Requirements:

- only one active "Adventure Guide" objective at a time
- update automatically when the current objective is completed
- do not block the player from doing other activities
- reuse existing quest / progression events where possible
- location-based objectives may use existing map/minimap markers

## Quests Modal

Merge the existing Quest Log and Hunt quests into one modal called:

```text
Quests
```

The modal should show all active / relevant quests in one place.

Suggested sections:

- Active Quests
- Hunts
- Completed Quests (optional if already supported)

Do not keep separate Hunt and Quest Log modals if they duplicate the same purpose.

## Menu Button

Add a new menu button:

```text
Quests
```

This opens the new Quests modal.

## Keyboard Shortcut

Pressing:

```text
Q
```

should toggle the Quests modal.

Requirements:

- `Q` opens the modal if closed
- `Q` closes the modal if open
- do not trigger while typing in chat / text inputs

## World Event HUD

Keep the World Event HUD separate.

World Events should **not** be merged into the Quests modal or "Adventure Guide" HUD.

## Acceptance Criteria

- HUD has only `Adventure Guide` and World Event progression elements.
- Quest Log + Hunt HUD elements are removed / merged.
- New `Quests` modal contains quests and hunts.
- Menu has a `Quests` button.
- `Q` toggles the Quests modal.
- `Adventure Guide` shows one objective at a time.
- Progression guidance works from Level 1 through Level 10.
- Existing quest / hunt progression still works.
- Existing World Event HUD remains unchanged.

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current Quest Log, Hunt UI, World Event HUD, menu, and keyboard handling first.
3. Reuse the existing quest / hunt data and progress logic.
4. Merge UI only where needed; do not rewrite the entire quest system.
5. Keep `Adventure Guide` simple and config-driven where practical.
6. Use JavaScript only.
7. Avoid unrelated refactors.
8. Run relevant checks after implementation.
9. In the final response, list every changed file with its exact path.
