# Forest Environment Polish

## Goal

Polish the **Forest** so it looks more intentional, cohesive, atmospheric, and promotion-ready without rebuilding the region.

Focus on:

- prop placement
- lighting
- shadows
- color harmony
- readability
- landmark presentation

Use JavaScript only. Keep this as a focused polish pass.

## Priorities

- reduce obvious repeated / procedural prop placement
- use more natural clusters of trees, bushes, grass, and rocks
- add controlled scale / rotation variation
- improve small clearings and paths
- make Central Camp feel better framed
- improve visibility / presentation of the Ancient Forest Shrine
- improve lighting and shadow quality
- make colors across terrain, vegetation, props, fog, and sky feel more cohesive
- keep combat areas readable
- preserve traversal and gameplay

## Visual Direction

The Forest should feel:

- stylized fantasy
- slightly warm / natural
- cohesive rather than asset-pack-mixed
- readable in motion
- atmospheric without becoming too dark
- dense in some areas, open in others

Prefer:

```text
clusters + clearings + paths + controlled lighting
```

over:

```text
uniform random scattering + flat lighting + mismatched colors
```

## Prop Placement

Improve existing Forest decoration using current assets.

Focus on:

- clustered trees instead of even scattering
- grouped rocks / bushes / grass
- controlled random scale variation
- controlled rotation variation
- clearer open spaces around paths and combat areas
- stronger visual framing around important locations

Do not add excessive prop density.

## Lighting

Inspect the existing Forest lighting setup first.

Polish it conservatively:

- improve directional light angle if the scene looks flat
- improve contrast between lit and shaded areas
- keep player / enemy silhouettes readable
- avoid overly dark shadows
- avoid washed-out lighting
- preserve a clear fantasy daytime look unless the current world uses another established lighting setup
- reuse existing Babylon.js lighting architecture

Do not completely replace the global lighting system unless necessary.

## Shadows

Improve shadow presentation where possible:

- keep important characters / large props casting readable shadows
- avoid expensive shadow settings on every small decorative prop
- ensure source meshes are configured correctly for Babylon.js shadow casting
- avoid setting unsupported shadow properties on instanced meshes
- keep shadow distance / resolution reasonable for browser performance
- reduce obvious floating or disconnected-looking objects where shadows help grounding

Prioritize:

- player
- enemies
- major trees / rocks
- Central Camp
- Ancient Forest Shrine

## Color Harmony

Make the Forest palette feel consistent.

Inspect:

- terrain / ground colors
- tree trunks
- foliage
- grass
- rocks
- camp props
- shrine materials
- sky
- fog / ambient color
- lighting tint

Adjust only where needed.

Goals:

- vegetation should feel like it belongs to the same biome
- rocks should not look disconnected from terrain
- ground should support the green vegetation without becoming overly saturated
- camp props should stand out slightly without looking like a different game
- shrine should have a distinct but still compatible palette
- avoid overly saturated neon greens
- avoid excessive gray / brown muddiness

Prefer subtle harmonization over replacing materials.

## Fog / Atmosphere

If the Forest already uses fog / atmospheric settings:

- tune them to add depth
- keep distant trees readable enough
- avoid hiding landmarks too aggressively
- avoid strong color casts that make the whole scene monochrome

If no fog exists, only add a light version if it fits the current rendering setup and remains cheap.

## Central Camp

Polish the area around Central Camp:

- improve tree / rock framing
- use lighting to make the camp feel slightly more welcoming / readable
- keep entrances and exits clear
- avoid strong shadow clutter around interaction areas
- keep camp asset colors visually compatible with the surrounding forest
- preserve NPCs, players, events, and gameplay logic

## Ancient Forest Shrine

Improve visual presentation around:

```text
game/public/models/environment/ancient_forest_shrine.glb
```

Goals:

- shrine should be easier to notice from useful gameplay distances
- improve surrounding prop composition
- avoid clutter directly around the landmark
- use lighting / contrast to give it stronger visual presence
- keep its materials compatible with the Forest palette
- preserve discovery / quest logic and coordinates

## Performance

Do not significantly increase loading time or rendering cost.

Prefer:

- existing assets
- instancing / thin instances
- conservative prop counts
- selective shadow casting
- modest lighting changes
- existing regional loading logic

Avoid:

- many new real-time lights
- expensive shadows on every prop
- very dense decorative clutter
- large material / texture rewrites

## Rules

- reuse existing Forest assets first
- do not invent new landmarks
- do not move gameplay-critical landmarks unless clearly safe
- preserve quests, events, enemies, waypoints, collisions, and spawn areas
- preserve Wolf / Boar / Bee gameplay areas
- avoid blocking paths with props
- keep Central Camp and Ancient Forest Shrine as visual priorities
- do not redesign the entire global world renderer

## Acceptance Criteria

The task is complete when:

- Forest looks less repetitive
- prop placement feels more natural
- lighting has better depth and contrast
- shadows ground major objects without large performance cost
- colors across terrain / vegetation / props feel more coherent
- clearings and paths are easier to read
- Central Camp is better framed and more visually inviting
- Ancient Forest Shrine has stronger visual presence
- traversal / combat areas remain usable
- existing Forest quests / events / enemies still work
- no new POIs are invented
- no major performance regression is introduced

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the exact Forest generation / placement / lighting files before editing.
3. Inspect current Babylon.js lights, shadow generators, fog, materials, and terrain colors.
4. Reuse existing Forest assets and placement helpers.
5. Improve clustering, scale variation, rotation variation, clearings, and landmark framing.
6. Tune lighting / shadows conservatively for better depth and grounding.
7. Harmonize colors across terrain, foliage, rocks, camp props, shrine, fog, and sky where needed.
8. Keep Central Camp and Ancient Forest Shrine as the main visual priorities.
9. Do not move gameplay-critical content or change quest / event logic.
10. Do not invent new landmarks.
11. Preserve collisions and traversal.
12. Keep browser performance in mind, especially shadow casting and real-time lights.
13. Run relevant checks.
14. In the final response, list every changed file with its exact path and summarize:
    - prop placement changes
    - lighting changes
    - shadow changes
    - color / material changes
    - any performance considerations
