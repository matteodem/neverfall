# Forest Environment Pass

## Goal

Improve the Forest region using the existing `.glb` environment assets located in:

```text
game/public/models/environment
```

Do not add new external assets for this task.

## Tasks

- Inspect all available `.glb` files under:

```text
game/public/models/environment
```

- Use suitable forest assets such as:
  - trees
  - pine trees
  - bushes
  - grass
  - rocks
  - logs
  - stumps
  - dead trees
  - other matching nature props

- Improve the Forest region so it feels denser, more natural, and less randomly generated.

## Placement Rules

Avoid placing assets uniformly.

Instead:

- create small tree clusters
- create rock clusters
- leave some open clearings
- place bushes / grass near trees and rocks
- place logs / stumps / dead trees only occasionally
- avoid obvious repetition
- vary rotation and scale slightly where appropriate
- keep important gameplay paths readable

## Gameplay Safety

Do not block:

- Central Camp
- important paths
- enemy spawn areas
- quest locations
- dungeon entrances
- player spawn points
- world event areas

Keep enough open space for combat and movement.

## Performance

Keep browser performance in mind.

- reuse existing asset loading helpers
- reuse materials where possible
- use instances / clones where the current architecture supports them
- avoid spawning excessive numbers of unique meshes
- preserve existing distance-culling / optimization logic

## Important

This is a visual world pass only.

Do not change:

- combat
- quests
- enemy AI
- spawn logic
- world events
- progression systems

## Acceptance Criteria

- Forest looks denser and more natural.
- Existing `.glb` assets from `game/public/models/environment` are reused.
- Props are grouped into believable clusters instead of evenly scattered.
- Important gameplay areas remain accessible.
- Existing Forest gameplay still works.
- Performance remains reasonable.

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the existing Forest / world generation code first.
3. Inspect all `.glb` assets inside `game/public/models/environment`.
4. Reuse the existing environment loading and placement helpers where possible.
5. Keep asset placement deterministic if the current world generation is deterministic.
6. Keep the implementation small and DRY.
7. Use JavaScript only.
8. Avoid unrelated refactors.
9. Run relevant checks after implementation.
10. In the final response, list every changed file with its exact path.
