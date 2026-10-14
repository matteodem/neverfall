# World atmosphere

`atmosphereConfig.js` owns the outdoor sky gradient, linear fog and distant ridge
settings. `worldPalette.js` keeps sky/fog aliases for existing callers; terrain,
foliage, imported materials, lighting and shadow settings are unchanged.

`createWorldAtmosphere.js` creates a camera-centered, unlit sky box with a
generated 1 × 64 gradient texture. Its small shader normalizes the viewing direction
per fragment before sampling the gradient. The lookup remains continuous across
box faces without extra geometry or passes.
A constant horizon band and lower sky share the fog color.
Outdoor fog blends toward the pale blue horizon
from 120 to 280 units, preserving the existing clear foreground range. Dungeons
retain their configured sky color and 80–220 fog range, without outdoor scenery.

The optional `createDistantMountains.js` creates two fixed, irregular ridge bands beyond the
playable world's corners. Their colors include atmospheric haze so they remain
visible beyond the fog range. Vertex colors fade their bases into the fog/sky
color, removing the straight lower cut edges without transparency or extra
rendering passes. Four rows of subdivisions keep this blend smooth beneath the
irregular skyline. They have no collision, picking, shadow casting or
shadow receiving. These optional bands are disabled by default.
The default atmosphere uses one sky mesh, one draw call and 12 triangles,
with no extra lights, shadow maps, frame callbacks or dependencies.

`groundSkyFog.js` corrects the ground's fog destination color using the same sky
gradient texture and viewing direction. The eastern terrain cliff rises 180 units
outside the playable boundary. At full fog it previously rendered as solid pale
blue in front of the sky gradient, exposing a diagonal edge that resembled a sky
mesh seam. The ground material plugin preserves Babylon's fog factor, lighting,
shadows and geometry; nearby ground retains its existing colors. Dungeons retain
their original fog. The correction adds one texture lookup to the ground shader,
reusing the sky texture without new textures, draw calls or rendering passes.

Validation: reproduced the supplied screenshot's line in the actual running game
at localhost:3000, central camp, camera alpha 2, beta 1.45, radius 14. Runtime ray
picking through the flat region hit `ground` / `groundMaterial` around
(308, 62, -238), approximately 406 units from the camera. Hiding only ground removed
the line; hiding sky or disabling fog distinguished the terrain from the sky.
The loaded scene had one sky mesh, no ridge meshes and no active glow/post-process
pass. Browser caching was disabled. A runtime ground-fog correction removed the
line at the same camera angle before implementing the source change. A fresh
game reload then confirmed the saved plugin on `groundMaterial`, sharing the sky
texture with ground collisions still enabled. Reviewed eight headings and a
near-horizontal view after that reload. Before/after evidence:
`/tmp/neverfall-live-confirmed-seam-before.png` and
`/tmp/neverfall-live-source-fixed.png`. JavaScript syntax and whitespace checks
passed. Physical-device FPS is not measured.
No tests or Meteor builds were run.
