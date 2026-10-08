# Proposed fixed treasure cache positions

Approved placement list for the fixed Hidden Cache MVP. All twelve coordinates below are used unchanged by `game/imports/game/hiddenCaches.js`.

Twelve hand-selected locations, three per requested region. Southwest Lake is an area of the existing Forest chunks, not a new world region. Nearby areas below refer to existing landmarks, terrain features, and scenery; the descriptions do not introduce POIs.

Coordinates are world-space `(x, y, z)`. **Y is a proposed bottom-center anchor, 0.05 m above the current rendered ground**, sampled from the same 660 m ground mesh with 96 subdivisions used by `createWorld.js`. It can differ slightly from `getWorldHeight(x, z)` because that function is sampled at mesh vertices. These proposals assume a small cache no larger than 1 × 1 m horizontally and 1.5 m tall; an eventual asset's pivot and ground fit must be adjusted accordingly.

## Positions

| Cache ID | Region | Exact x / y / z | Nearby existing landmark / area | Why suitable |
| --- | --- | --- | --- | --- |
| `cache-forest-01` | Forest | `-270 / 0.051369 / -35` | Ancient Forest Shrine at `(-240, -65)` | Flat birch pocket 42.43 m northwest of the shrine, outside its clearing and mesh; a quiet detour from the landmark. |
| `cache-forest-02` | Forest | `86 / 0.946931 / 28` | Forest Giant Hill centered at `(70, 72)` | Birch-side pocket on the southern shoulder, 42.14 m from the camp-to-hill route and 46.82 m from the giant spawn; away from the summit fight. |
| `cache-forest-03` | Forest | `28 / 1.986536 / -250` | Jumping-puzzle tower at `(60, -230)`; authored ridge centered at `(0, -235)` | Wooded southwest side of the tower, 37.74 m from its center; gentle ridge terrain outside the tower footprint and clearing. |
| `cache-highlands-01` | Highlands | `-276 / 0.926632 / 274` | Authored rock cluster centered at `(-265, 265)`; low ledge centered at `(-245, 270)` | Quiet outer side of the western rocks with gentle footing; far from the goat hunting grounds and northern camp. |
| `cache-highlands-02` | Highlands | `118 / 4.089875 / 293` | Authored hill centered at `(115, 275)`, northeast of Highlands Lookout at `(40, 245)` | North-facing side of the hill puts its crest between the cache and southern approaches; outside bee hunting grounds, with room before the north boundary. |
| `cache-highlands-03` | Highlands | `112 / 0.351071 / 125` | Authored rock cluster centered at `(122, 132)`, south of Northern Ruins entrance at `(80, 180)` | Side pocket near the rock group, 63.63 m from the entrance/route and 55.44 m from the relic guardian spawn. |
| `cache-snow-01` | Snowy Mountains | `172 / 2.046940 / 89` | Northern approach to Snowy Mountains waypoint at `(185, 0)` | Dead-tree pocket on the lower mountain slope, away from the east-west approach and outside the snow-wolf hunting rectangle. |
| `cache-snow-02` | Snowy Mountains | `194 / 5.027547 / -95` | Lower shoulder southwest of Frozen Stone Arch at `(250, -82)` | Dead-tree cover outside the arch mesh, mountain-goat hunting area, sentinel spawn, and Frozen Rift participation area. |
| `cache-snow-03` | Snowy Mountains | `282 / 17.889676 / 92` | Upper snowy slope northeast of snow-wolf spawns around `(224–252, 39–55)` | Gently sloping upper shelf away from the hunting area; 13 m west of the eastern wall/cliff onset at `x = 295`. Approach along the slope from the west. |
| `cache-lake-01` | Southwest Lake | `-180 / 1.850000 / -103` | Northwest outer bank of Southwest Lake at `(-160, -160)` | Bush-side pocket on the raised outer bank, outside the seal hunting rectangle and lake reach objective; avoids the lake waypoint approach. |
| `cache-lake-02` | Southwest Lake | `-106 / 2.454412 / -130` | Authored northeast lake ridge centered at `(-105, -145)` | Birch pocket on the ridge's northern side; east of the seal hunting rectangle and off the lake-to-dungeon path. |
| `cache-lake-03` | Southwest Lake | `-120 / 1.667569 / -237` | Woodland east/southeast of Sunken Ruins entrance at `(-160, -220)` | Gentle birch pocket 43.46 m from the entrance and lake path, away from portal access and seal spawns. |

The lake proposals deliberately use the outer banks and ruin-adjacent woodland. The water radius is 14 m, while seals spawn around radius 21 m and their quest area extends farther inland. Immediate shoreline placement would conflict with that existing gameplay.

## Placement clearance

Distances below are horizontal world meters. Prop clearance is from the cache center to the nearest projected prop/landmark bounding box intersecting the proposed cache's vertical span, taking the minimum across both standard and low-density asset layouts.

| Cache ID | Prop / landmark bounds clearance | Nearest enemy spawn | Nearest authored route centerline |
| --- | ---: | ---: | ---: |
| `cache-forest-01` | 3.76 | 146.09 | 166.51 |
| `cache-forest-02` | 2.91 | 46.82 | 42.14 |
| `cache-forest-03` | 2.21 | 189.71 | 162.43 |
| `cache-highlands-01` | 10.49 | 125.60 | 285.75 |
| `cache-highlands-02` | 32.36 | 46.87 | 119.22 |
| `cache-highlands-03` | 13.91 | 55.44 | 63.63 |
| `cache-snow-01` | 2.74 | 69.43 | 89.00 |
| `cache-snow-02` | 2.94 | 43.66 | 95.00 |
| `cache-snow-03` | 11.88 | 55.97 | 94.15 |
| `cache-lake-01` | 2.23 | 44.76 | 60.41 |
| `cache-lake-02` | 4.71 | 44.60 | 61.77 |
| `cache-lake-03` | 5.51 | 66.14 | 43.46 |

All twelve positions:

- Lie within existing chunk coverage and player bounds, on continuous ground outside the lake water and eastern cliff.
- Sit outside current `getQuestArea` hunting rectangles and ReachLocation objective radii, waypoint discovery zones, camp clearings, and dungeon entrances. The nearest dungeon entrance is 43.46 m away.
- Sit beyond all world-event participation radii. The closest event is Frozen Rift, 84.77 m from `cache-snow-02`, versus its 65 m participation radius.
- Remain at least 43.66 m from fixed enemy spawn centers, beyond the current 35 m chase distance plus regular 3 m / giant 4 m wander radius. This does not prevent players from bringing combat nearby.
- Have gentle local ground: the largest sampled height change over a 1 m cardinal step is approximately 0.173 m.

Geometry inspection used the existing seeded environment placement for density `1` and `0.5`, local asset geometry, and conservative transformed accessor bounds for compressed landmark models. This is static layout evidence, not an in-game visual review. The MVP reuses the tower chest geometry at 60% size (0.9 m wide, 0.54 m tall), disables cache collisions, and reserves 3 m circles in primitive fallback scatter. Seeded scenery remains unchanged. An in-game visual review at both quality settings remains advisable.

## MVP rewards and persistence

The central config defines three small reward tiers using existing inventory items: `small` grants one Health Potion, `stocked` grants two Health Potions, and `secluded` grants one Health Potion plus one Power Potion. It assigns a tier to each of these approved IDs. No new currency, respawn timer, or randomized position is used.

The authenticated Colyseus world message `claimHiddenCache` accepts only a cache ID. The server checks the session player's life state, world location, ownership, and 3 m three-dimensional proximity. A conditional atomic Character update adds the ID to `lootedCacheIds` and pushes the reward into `inventory.items` together. Existing Characters need no migration; a missing claim list means no caches have been looted. The existing Character publication restores the local claim state after reconnect. Claimed chests lose their prompt and gold appearance for that Character.

Focused checks: `node --experimental-vm-modules game/tests/server/hiddenCaches.cjs`. These exercise the real cache/interaction/rendering modules with substituted persistence and UI stores, including concurrent claims, reconnect state, Character ownership, save failure, fixed coordinates, and existing interaction priorities. They do not replace a browser/MongoDB end-to-end session.

## Repository sources

- [World regions, terrain, bounds, and authored scenery](../game/imports/game/worldConfig.js)
- [Ground construction and world assembly](../game/imports/game/createWorld.js), [physical boundaries](../game/imports/game/environment/createWorldBoundary.js), and [chunk loading](../game/imports/game/worldChunks.js)
- [Named landmarks](../game/imports/game/landmarks.js), [jumping-puzzle tower](../game/imports/game/basicTowerConfig.js), and [camp clearings](../game/imports/game/campProtection.js)
- [Waypoints](../game/imports/game/waypoints.js), [dungeon entrances](../game/imports/game/dungeonConfig.js), [quest areas and objectives](../game/imports/game/quests.js), [enemy spawns and movement distances](../game/imports/game/enemyConfig.js), and [world events](../game/imports/game/worldEvents.js)
- [Seeded props, clearings, and route corridors](../game/imports/game/environment/createForestProps.js), [Highlands scenery](../game/imports/game/environment/createHighlandsArea.js), [lake geometry](../game/imports/game/environment/createWorldLandmarks.js), and [fallback forest scatter](../game/imports/game/environment/createForestArea.js)
