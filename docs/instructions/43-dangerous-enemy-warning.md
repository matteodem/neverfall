# Dangerous Enemy Warning

## Goal

Warn players clearly when they engage an enemy that is significantly above their level.

Use both:

- the existing Target Frame
- a central popup similar to `Level Up` / `Quest Complete`

## Danger Thresholds

Compare enemy level against player level.

```js
const levelDifference = enemy.level - player.level;
```

Use:

- `0–4` levels higher → no warning
- `5–9` levels higher → dangerous
- `10+` levels higher → very dangerous

## Central Popup

When the player first engages / targets a dangerous enemy, show a central popup.

For 5–9 levels higher:

```text
Dangerous Enemy
This enemy is 5+ levels above you.
```

For 10+ levels higher:

```text
Extremely Dangerous Enemy
This enemy is far above your level.
```

Requirements:

- reuse the existing central notification / popup style if possible
- show only once per enemy encounter / target engagement
- do not show on every attack
- do not block combat
- Make it red

## Target Frame

Also add a persistent warning to the Target Frame while that enemy is selected.

Suggested UI:

```text
⚠ Dangerous Enemy
```

or:

```text
⚠ Extremely Dangerous
```

Keep the warning visible as long as the dangerous enemy remains the current target.

## Acceptance Criteria

- Enemies 5+ levels above the player trigger a warning.
- Enemies 10+ levels above the player use the stronger warning.
- A central popup appears only once per encounter / engagement.
- Target Frame keeps a visible danger indicator.
- Combat is never blocked.
- Existing Target Frame and notification behavior still works.

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current Target Frame and central notification / popup system first.
3. Reuse existing notification components instead of creating a duplicate system.
4. Keep the level-difference logic centralized and DRY.
5. Use JavaScript only.
6. Avoid unrelated refactors.
7. Run relevant checks after implementation.
8. In the final response, list every changed file with its exact path.
