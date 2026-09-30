# Camp Asset Replacement

## Goal

Replace the current Central Camp and Northern Camp visuals with the new camp assets located in:

```text
game/public/models/camp
```

Keep the existing gameplay logic, positions, events, spawn points, and safe-zone behavior unchanged unless an asset placement requires a small visual adjustment.

## Tasks

### Central Camp

Replace the current placeholder / simple camp props with suitable assets from:

```text
game/public/models/camp
```

Use the available camp assets to create a cleaner and more believable starter camp.

Prioritize:

- tents
- campfire
- benches / logs
- crates / props
- flags / simple camp decorations
- other matching camp assets

Keep the Central Camp easy to read and safe for new players.

Do not block:

- player spawn position
- safe zone
- paths
- nearby quest / interaction areas

### Northern Camp

Replace the current Northern Camp props using the same asset set.

The Northern Camp should feel slightly more rugged and exposed than the Central Camp.

Keep enough open space for:

- Wolf Invasion combat
- player movement
- mounts
- event enemies
- the Northern Camp spawn point

Do not place decorative props inside important combat space.

## Asset Rules

- Inspect all `.glb` files in:

```text
game/public/models/camp
```

- Reuse existing Babylon.js asset loading helpers where possible.
- Do not add new external assets.
- Avoid mixing in unrelated camp models if the new pack already covers the needed props.
- Keep scaling and rotation consistent with the world.

## Performance

- Reuse materials where possible.
- Use clones / instances if supported by the current environment system.
- Avoid excessive unique meshes.
- Preserve existing world culling / optimization logic.

## Important

This is mainly a **visual asset replacement / camp composition task**.

Do not change:

- Wolf Invasion logic
- Central Camp safe zone
- respawn logic
- spawn point unlock logic
- quests
- enemy AI
- rewards

## Acceptance Criteria

- Central Camp uses the new assets from `game/public/models/camp`.
- Northern Camp uses the new assets from `game/public/models/camp`.
- Both camps look cleaner and more intentional.
- Central Camp remains safe and readable for new players.
- Northern Camp still has enough open space for Wolf Invasion.
- Existing spawn points, safe zones, events, and paths still work.
- Performance remains reasonable.

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current Central Camp and Northern Camp implementation first.
3. Inspect all `.glb` assets in `game/public/models/camp`.
4. Reuse existing environment / camp placement helpers where possible.
5. Replace visual props only where practical.
6. Keep gameplay logic unchanged.
7. Use JavaScript only.
8. Avoid unrelated refactors.
9. Run relevant checks after implementation.
10. In the final response, list every changed file with its exact path.
