# Hunt Progress Popup

## Goal

Make Hunt Quest progress easier to notice during gameplay.

Show a small text-only popup below the player character whenever Hunt progress changes.

## Example

```text
Boar Hunt: 3 / 5 defeated
```

Use `defeated` instead of `Killed X out of 5` to keep the text shorter and cleaner.

## Behavior

- Show the popup only when Hunt progress changes.
- Position it below the player character.
- Use text only.
- No borders, panels, or modal background.
- Reuse the visual style / animation of existing lightweight notifications like `Level Up` where possible.
- Hide it automatically after a short duration.
- Do not spam duplicate updates.

## Acceptance Criteria

- Hunt progress is clearly visible after defeating a relevant enemy.
- Example: `Boar Hunt: 3 / 5 defeated`.
- Popup appears below the player character.
- No border or container UI is shown.
- Existing Hunt / Quest progress logic remains unchanged.

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current Hunt progress and existing floating / level-up notification code.
3. Reuse existing notification helpers where practical.
4. Keep the implementation small and DRY.
5. Use JavaScript only.
6. Avoid unrelated refactors.
7. Run relevant checks after implementation.
8. In the final response, list every changed file with its exact path.
