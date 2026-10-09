# Movement / Game Feel Polish

## Goal

Polish player movement so traversal feels smoother, clearer, and more satisfying without changing the core control scheme.

Keep this MVP-sized.

Use JavaScript only.

## Focus

- improve jump / fall / landing feel
- reduce movement or camera jitter
- review slope handling
- smooth awkward movement transitions
- preserve existing multiplayer sync
- preserve mobile controls

## Jump / Fall / Landing

Improve the feel of:

```text
jump
→ airborne
→ fall
→ landing
```

Use existing animation / movement systems where possible.

Consider:

- cleaner jump start
- consistent fall transition
- subtle landing feedback
- avoid abrupt animation snapping
- preserve existing fall damage

Do not add complex parkour or climbing systems.

## Slope Handling

Inspect current movement on:

- hills
- mountains
- uneven terrain
- small terrain edges

Fix obvious issues such as:

- jitter while walking uphill
- getting stuck on reasonable slopes
- sudden speed changes
- awkward snapping between ground heights

Do not make steep / invalid terrain universally walkable.

## Camera / Movement Feel

Inspect third-person camera interaction with movement.

Fix obvious:

- camera jitter
- sudden position snaps
- awkward movement / camera transitions
- movement feeling inconsistent while rotating camera

Preserve current RMB / desktop and mobile camera behavior.

## Multiplayer

Do not sacrifice multiplayer correctness for local smoothness.

Preserve:

- server-authoritative movement where currently used
- remote player interpolation / animation behavior
- jump synchronization
- death / respawn movement state

## Acceptance Criteria

- jumping feels smoother
- falling transitions cleanly
- landing feels more grounded
- movement on normal slopes is stable
- camera / movement jitter is reduced
- existing fall damage still works
- multiplayer movement remains synchronized
- desktop and mobile controls remain intact
- no major movement-system rewrite is introduced

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current player movement, jump, gravity, grounding, slope handling, camera, animation, and multiplayer sync code first.
3. Fix only clear game-feel / movement issues found in the existing implementation.
4. Reuse current movement and animation helpers.
5. Keep changes conservative and avoid redesigning the movement system.
6. Preserve fall damage, multiplayer synchronization, and mobile controls.
7. Do not add parkour, climbing, sprint, or other unrelated movement features.
8. Run relevant checks.
9. In the final response, list every changed file with its exact path and summarize:
   - jump / fall / landing changes
   - slope handling changes
   - camera / smoothing changes
   - multiplayer considerations
