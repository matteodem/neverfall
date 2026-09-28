# Northern Camp + Wolf Invasion

## Goal

Move the **Wolf Invasion** event away from the central spawn camp and place it at a new **Northern Camp** in the Highlands.

This should improve the new-player experience by keeping dangerous event enemies away from the main spawn area.

## Northern Camp

Add a small camp in the **Highlands / north of the world map**.

Reuse existing camp/environment assets where possible.

The camp should include:

- a clear camp area
- safe player space
- nearby Wolf Invasion spawn area
- map/minimap marker if the current system supports it

## Wolf Invasion

Move the existing **Wolf Invasion** event to the Northern Camp.

Requirements:

- remove Wolf Invasion from the central spawn camp
- spawn event wolves around / outside the Northern Camp
- keep the existing event flow, waves, rewards, and cooldown
- keep enemies away from the camp respawn / safe area
- reuse the existing event system instead of creating a new one

## Central Camp

The central camp should remain a safe starting area for new players.

Do not spawn Wolf Invasion enemies near new-player spawn positions.

## Acceptance Criteria

- Northern Camp exists in the Highlands.
- Wolf Invasion now happens at the Northern Camp.
- Central spawn camp is no longer affected by Wolf Invasion.
- New players can spawn safely without being attacked by event wolves.
- Existing Wolf Invasion mechanics still work.
- Existing safe-zone / respawn protection behavior still works.

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current camp, Wolf Invasion, safe-zone, and map code.
3. Reuse existing camp assets and event logic.
4. Place the Northern Camp in a sensible Highlands location.
5. Keep the central spawn camp safe.
6. Use JavaScript only.
7. Avoid unrelated refactors.
8. Run relevant checks after implementation.
9. In the final response, list every changed file with its exact path.
