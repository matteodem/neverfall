# Neverfall v0.3 QoL

Keep this pass small, DRY and MVP-sized.

## 1. World / Connection UX

- Show a friendly message if the world is full.
- Show a friendly message if connecting to the world fails.
- Do not leave the player stuck on a loading screen.

## 2. Inventory Polish

- Keep the current light-mode inventory.
- Improve MMO-style slot visuals.
- Add item rarity border colors.
- Add simple item tooltips.
- Do not change inventory logic.

## 3. Minimap Polish

- Keep the existing circular minimap.
- Improve marker readability.
- Clearly distinguish:
  - local player
  - remote players
  - enemies
  - mini-boss
- Do not add a fullscreen map.

## 4. Combat Feedback

- Keep the existing attack sound.
- Add lightweight hit feedback.
- Improve cooldown readability.
- Keep effects subtle and performant.

## Scope

Do not add new large systems.

Before implementing:
- Read AGENTS.md.
- Inspect the existing architecture.
- Reuse existing components/stores.
- Keep changes minimal.
- Run relevant checks.