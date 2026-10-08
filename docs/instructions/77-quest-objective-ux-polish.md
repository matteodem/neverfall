# Quest / Objective UX Polish

## Goal

Improve quest and objective readability without changing the quest system itself.

Keep this MVP-sized and mobile-friendly.

Use JavaScript only.

## Focus

- clearer current objectives in the HUD
- better quest progress feedback
- concise completion feedback
- reduce unnecessary text
- make important objectives easier to understand at a glance
- preserve existing quest logic, rewards, and progression

## HUD / Objective Display

Improve the existing objective display so players can quickly see:

- quest / objective name
- current progress
- what to do next
- completion state

Prefer short text such as:

```text
Kill Snow Wolves
4 / 10
```

Avoid long descriptions in the HUD.

## Progress Feedback

When progress changes, provide lightweight feedback using existing UI patterns.

Examples:

```text
Snow Wolves: 5 / 10
Objective Complete
```

Do not add large popups for every small update.

## Direction / Location

If the project already has objective markers, distance, map markers, or waypoint helpers, improve their readability where useful.

Do not build a new navigation system.

## Mobile

Ensure quest / objective information remains readable on small screens.

Avoid hover-only interactions.

## Acceptance Criteria

- active objectives are easier to read
- progress updates are clear
- completion feedback is concise
- HUD text is not cluttered
- mobile readability is preserved
- existing quest logic / rewards remain unchanged
- no duplicate quest or navigation system is added

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the existing quest, objective, HUD tracker, Adventure Guide, map-marker, and mobile UI code.
3. Improve clarity using existing systems and components.
4. Keep objective text short and scannable.
5. Improve progress and completion feedback.
6. Reuse existing marker / distance helpers if available.
7. Do not create a new quest framework or navigation system.
8. Do not change quest rewards, unlock logic, or progression unless a tiny UX-only sequencing fix is required.
9. Run relevant checks.
10. In the final response, list every changed file with its exact path and summarize the UX improvements.
