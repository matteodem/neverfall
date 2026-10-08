# Southeast Mountain Landmark

## Goal

Add a large climbable mountain in the **southeast area of the world map**, using the currently empty space there.

The mountain should function as a simple exploration landmark:

```text
climb to the top
→ find a Hidden Cache
→ jump / fall back down
```

Keep this MVP-sized and reuse existing world / cache systems.

Use JavaScript only.

## Placement

- use the southeast empty area of the current world
- inspect the actual world bounds / existing content first
- choose a safe location that does not overlap quests, enemies, events, dungeons, waypoints, or existing landmarks
- keep the mountain inside valid world / terrain bounds

Do not invent unrelated POIs.

## Mountain Design

Create a large mountain / rocky hill that players can **walk up without requiring a jumping puzzle**.

Requirements:

- clear walkable route from bottom to top
- broad enough path for normal player movement
- no invisible walls blocking the climb
- slope must remain traversable with current movement / collision settings
- top area should be large enough to stand safely
- players should be able to intentionally jump / fall down from the top
- preserve existing fall-damage behavior
- do not add teleporters or scripted climbing

Prefer existing terrain / rock / environment assets.

If a dedicated GLB is needed, first inspect whether an existing suitable mountain / rock asset already exists.

## Hidden Cache

Place one existing Hidden Cache at the summit.

Requirements:

- use the existing Hidden Cache system
- fixed hand-authored cache position
- once-per-character behavior stays unchanged
- use existing reward logic
- no new cache system
- cache must be reachable by normal climbing
- position it visibly enough that reaching the summit feels rewarding

Suggested ID:

```text
southeast-mountain-cache
```

Use existing naming conventions if different.

## Visual Composition

The mountain should:

- be visible from a useful distance
- act as a recognizable southeast landmark
- feel integrated into the existing world
- use existing rocks / vegetation around the base where appropriate
- avoid excessive prop density
- preserve readable traversal

Do not modify global lighting / shadows as part of this task.

## Performance

- reuse existing terrain / rock assets and instancing where possible
- avoid one unnecessarily huge high-poly mesh
- keep browser performance in mind
- do not significantly increase initial loading time

## Acceptance Criteria

The task is complete when:

- a large mountain exists in the southeast empty area
- player can walk from the base to the summit
- path is reachable without special movement tricks
- summit is stable / walkable
- player can jump / fall back down
- existing fall damage still works
- one Hidden Cache exists at the summit
- cache uses existing persistence / reward logic
- mountain does not interfere with existing content
- no major performance regression is introduced

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current world bounds, southeast region, terrain generation, collisions, movement slope handling, fall damage, and Hidden Cache config.
3. Identify a safe southeast placement based on real repository coordinates.
4. Implement the mountain using the smallest safe approach in the existing world architecture.
5. Prefer terrain / existing rock assets over introducing a complex new asset pipeline.
6. Ensure the climbable path works with current player movement and collision.
7. Add one summit Hidden Cache through the existing cache system.
8. Preserve existing quests, events, enemies, dungeons, waypoints, and landmarks.
9. Do not change global lighting / shadows.
10. Run relevant checks.
11. In the final response, list every changed file with its exact path and report:
    - mountain coordinates / footprint
    - climb route approach
    - summit position
    - Hidden Cache ID / position
    - any collision / slope adjustments
