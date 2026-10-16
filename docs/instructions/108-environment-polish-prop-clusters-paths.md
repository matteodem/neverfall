# Environment Polish — Prop Clusters + Paths

## Goal

Improve the overworld visually without adding new gameplay systems.

Focus on two changes:

- add small procedural / configurable prop clusters around important areas,
- add simple readable paths between key locations.

Keep the implementation lightweight and performance-conscious.

## Prop Clusters

Add small environmental clusters using existing low-poly props where possible.

Good candidates:

- rocks
- bushes
- flowers
- fallen logs
- fences
- signposts
- small ruins
- camp props

Place them around:

- paths
- riverbanks
- camps
- landmarks
- hills
- dungeon entrances

Avoid uniform random scattering.

Prefer small intentional clusters that make locations feel handcrafted.

## Paths

Add simple paths / roads between important locations.

Examples:

```text
Central Camp → Forest Guard
Central Forest → Highlands
Regional NPC → nearby quest areas
Important waypoint → dungeon / landmark
```

Paths should:

- follow terrain naturally,
- remain readable from normal gameplay distance,
- avoid sharp turns,
- not block enemies or NPCs,
- preserve current traversal and quest locations.

Use subtle ground-color/material variation or lightweight path meshes.

## Regional Identity

Keep each region visually distinct.

Suggested direction:

```text
Central Forest
- greener
- denser vegetation
- more logs / fences / camp props

Highlands
- more rocks
- more open terrain
- sparse vegetation

Snowy Mountains
- icy / pale rocks
- fewer plants
- stronger landmark silhouettes

Southwest Lake
- river/lake rocks
- reeds / vegetation
- more shoreline props
```

Use existing assets first before creating new ones.

## Performance

Do not trade large FPS losses for decoration.

Prefer:

- thin instances / instances where practical,
- reused materials,
- low-poly meshes,
- limited shadow casting,
- limited prop density,
- distance-based visibility if needed.

Avoid adding hundreds of unique meshes with unique materials.

## Scope

Do not:

- move major gameplay locations,
- redesign regions,
- add new gameplay systems,
- add new quests,
- add new bridges unless needed for existing traversal,
- rebuild the terrain system,
- create large new asset pipelines.

## Acceptance Criteria

- Important areas feel less empty.
- Paths make navigation clearer.
- Prop placement looks intentional rather than random.
- Region identity is stronger.
- Existing quests, NPCs, enemies, landmarks, and traversal still work.
- No noticeable new FPS regression.
- New values/placements are easy to tune from config.

## Implementation Notes

- Read `AGENTS.md`.
- Inspect current environment, terrain, river, landmark, and path-related code first.
- Reuse existing environment props and materials.
- Keep the change MVP-sized.
- Mention every changed file path.
- Run focused browser checks on desktop and mobile.
- Report any areas that still look visually empty after the pass.
