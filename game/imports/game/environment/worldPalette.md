# Environment palette

Art direction comes from `docs/instructions/102-environment-for-colors.png`:
natural greens, golden-beige paths, cool blue-gray rocks, evergreen foliage,
occasional autumn gold/orange, turquoise water and warm stone/wood. The shared
`worldPalette.js` contains colors and the matte material settings. It has no
Babylon dependency because world/dungeon configuration is also imported by the server.

Terrain keeps its existing regional blending and color variation. Forest floor,
highlands, snow and exposed mountain stone remain distinct. Dungeon interiors
keep their separate dark sky colors and cool stone/teal regional palettes.
Existing path, lake, camp and procedural jumping-platform materials reuse the
palette; geometry, placement, random generation and collisions are unchanged.

`harmonizeEnvironmentMaterials.js` runs once per environment asset load, before
shared materials are instanced. Plain-color rocks become cooler; green foliage
and bark are blended with the palette while retaining authored shade differences.
Existing highland birch variants `birch_2` and `birch_3` supply autumn gold and
orange without adding trees, changing positions or consuming random numbers.
PBR palette values are converted to linear space before blending. Plain-color
environment albedos receive a gentle 1.1 brightness multiplier in linear space;
the common multiplier preserves their hue relationships.

Camp props, the Basic Tower, shrine, frozen arch, lookout, waypoint marker and
dungeon entrance retain baked albedo textures. Environment materials receive a
matte roughness floor; authored roughness/metallic maps, intentional metal cookware,
emissive effects, alpha and actor materials are preserved. No textures are replaced
or generated, and there is no per-frame palette work or additional rendering pass.
Ambient fill is 0.8 with direct sunlight at 0.9. Near-neutral warm light and
lighter ground bounce improve shaded-object and character readability without
a large sun-only intensity boost. Baked textures benefit from that shared lighting
without texture edits. Outdoor linear fog now blends from 120 to 280 units,
reducing nearby haze while retaining distant depth. Dungeon fog stays at 80–220.
Shadow direction, filter, map size, bias, darkness and stability settings are unchanged.

Validation: JavaScript syntax checks and `git diff --check` passed. An isolated
visual preview rendered actual oak, pine, fir, autumn birch,
rock, bush, camp, shrine and Basic Tower GLBs under the current lighting, alongside
the terrain/path/water palette. The brighter fill was also reviewed with the
actual mage and Forest Guard character materials and their ground shadows.
It is a representative art-direction review, not
a claim of exact reference matching or full-world gameplay validation. No tests or
Meteor builds were implemented or run.

Changed repository files:

- `game/imports/game/createWorld.js`
- `game/imports/game/createWorldLighting.js`
- `game/imports/game/worldLighting.md`
- `game/imports/game/worldConfig.js`
- `game/imports/game/dungeonConfig.js`
- `game/imports/game/environment/worldPalette.js`
- `game/imports/game/environment/harmonizeEnvironmentMaterials.js`
- `game/imports/game/environment/createForestProps.js`
- `game/imports/game/environment/createAssetCamp.js`
- `game/imports/game/environment/createHighlandsArea.js`
- `game/imports/game/environment/createDungeonPortal.js`
- `game/imports/game/environment/createBasicTower.js`
- `game/imports/game/environment/createForestArea.js`
- `game/imports/game/environment/createForestPath.js`
- `game/imports/game/environment/createClearingCamp.js`
- `game/imports/game/environment/createJumpingPuzzle.js`
- `game/imports/game/environment/createWorldLandmarks.js`
- `game/imports/game/environment/createDungeonEnvironment.js`
- `game/imports/game/environment/worldPalette.md`
