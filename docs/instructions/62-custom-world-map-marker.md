# Custom Map Markers (Ctrl + Left Click)

## Goal

Add player-created custom map markers.

When the player holds:

```text
CTRL + Left Click
```

on the **World Map**, create a custom marker at the clicked world-map position.

The custom marker must then be visible on:

```text
World Map
+
Minimap
```

This should be a lightweight client-side navigation / reminder feature.

Use JavaScript only.

---

## 1. Core Interaction

On desktop:

```text
CTRL + Left Click on World Map
→ create custom marker at clicked map position
```

Normal left click without CTRL must keep its existing behavior.

Do not break:

- waypoint interaction
- dungeon markers
- map dragging
- map zoom
- Hunt markers
- POI markers
- existing hover / tooltip behavior

CTRL + Left Click should be reserved for custom marker placement inside the valid map area.

---

## 2. Coordinate Conversion

The clicked map position must be converted correctly into the corresponding world X/Z coordinates.

Do not store only raw screen pixels.

The marker must represent an actual world position so it can be displayed consistently on both:

```text
World Map
Minimap
```

Reuse the existing World Map coordinate conversion logic if one exists.

Conceptually:

```text
mouse position inside map
→ normalized map coordinates
→ world X/Z position
→ custom marker state
```

Do not create a second independent map-coordinate system if the current map already has helpers for converting between world and map coordinates.

---

## 3. Marker State

For MVP, support **one active custom marker per player**.

Behavior:

```text
CTRL + Left Click
→ create marker

CTRL + Left Click somewhere else
→ move / replace existing marker
```

Do not create unlimited markers yet.

Suggested state shape:

```js
{
  x,
  z,
}
```

Use the existing client state architecture.

If Zustand already stores map / UI state, use that.

Do not add a second global state solution.

---

## 4. Persistence

For MVP, the marker may be:

```text
client-session only
```

Preferred behavior:

- marker survives closing / reopening the World Map
- marker survives normal UI state changes
- marker does not need server persistence
- marker may reset on full page reload / reconnect

Do not add Meteor / MongoDB persistence unless the current architecture makes it trivial.

This feature should stay lightweight.

If existing client persistence already exists for similar UI state, it is acceptable to reuse it.

---

## 5. World Map Rendering

Render the custom marker on the World Map.

Requirements:

- clearly distinguish it from system markers
- use a simple unique icon
- do not reuse a waypoint / dungeon / Hunt icon
- keep it readable at different map zoom levels
- preserve correct position when the map is zoomed or resized

Suggested appearance:

```text
pin
diamond
flag
crosshair
```

Prefer an icon already available in the existing icon library.

Do not add a new icon package just for this feature.

Suggested tooltip:

```text
Custom Marker
```

The marker should use the same hover / tap label behavior as other non-Hunt markers where practical.

---

## 6. Minimap Rendering

The same custom marker must also appear on the minimap.

Use the stored world position:

```text
x / z
```

and the existing minimap world-to-minimap projection.

Do not manually duplicate projection math if a helper already exists.

The minimap marker should:

- update as the player moves
- rotate / reposition correctly according to the current minimap implementation
- disappear / clip naturally when outside minimap range if that is how other minimap markers behave
- use the same visual identity as the World Map custom marker

---

## 7. Removing the Marker

Add a simple way to remove the marker.

Preferred desktop interaction:

```text
CTRL + Right Click on World Map
→ remove custom marker
```

If right-click handling would interfere with existing camera / browser behavior inside the map, instead support:

```text
CTRL + Left Click directly on existing custom marker
→ remove marker
```

Choose the smallest clean solution based on the current map implementation.

Do not add a dedicated management modal.

Optional tooltip hint:

```text
CTRL + Click to place marker
```

and if supported:

```text
CTRL + Right Click to remove
```

Keep UI text minimal.

---

## 8. Mobile Behavior

The requested interaction is desktop-first:

```text
CTRL + Left Click
```

Do not invent an intrusive mobile workflow unless the World Map already has a suitable long-press / context interaction.

For MVP:

- desktop support is required
- mobile may simply display an existing custom marker if one somehow exists
- placing custom markers on mobile is optional unless easy to support cleanly

If implementing mobile placement, preferred interaction:

```text
long press on World Map
→ place custom marker
```

Only do this if long-press does not conflict with map pan / zoom behavior.

Do not overcomplicate mobile support.

---

## 9. Input Handling

Only create markers when:

```text
CTRL is pressed
AND
left mouse button is clicked
AND
click occurs inside valid World Map content
```

Do not trigger marker placement when clicking:

- Legend
- zoom buttons
- modal close button
- tabs
- map controls
- marker tooltip UI
- existing interactive controls

Stop propagation only where needed.

Do not break current map marker click actions.

---

## 10. Map Zoom / Pan Compatibility

The marker position must remain correct when the World Map is:

```text
zoomed
panned
resized
```

Do not calculate marker position from viewport pixels without accounting for current map transform.

Use the same transformed map coordinate space as existing markers.

Acceptance test:

```text
place marker
→ zoom map
→ marker stays on same world location
```

---

## 11. Marker Visual Priority

The custom marker should be visible without overpowering important system content.

Suggested layering:

```text
terrain / map
→ region / Hunts
→ normal map markers
→ custom marker
→ hover tooltip
```

Keep the marker above the map but below UI controls / tooltips.

---

## 12. Legend

Add the custom marker type to the existing World Map Legend if one exists.

Example:

```text
[custom marker icon] Custom Marker
```

Do not create a second Legend.

Reuse the existing marker icon definition if practical.

---

## 13. Optional UX Hint

Add a small help hint in the World Map UI.

Example:

```text
CTRL + Left Click: Place Marker
```

Keep this subtle.

Good locations:

```text
near Legend
bottom edge of map
map help text
```

Do not add a large permanent tutorial panel.

---

## 14. Multiplayer Scope

Custom markers are **personal** for MVP.

Do not synchronize them with:

- party members
- other players
- Colyseus room state
- Meteor users

No party ping system is required.

A future version may add shared party markers, but that is explicitly out of scope.

---

## 15. Preserve Existing Systems

Do not break:

- World Map zoom
- World Map pan
- World Map marker hover / tap labels
- Legend
- Hunts
- region labels
- waypoints
- waypoint fast travel
- spawn points
- dungeons
- POIs
- minimap
- mobile map layout
- map modal open / close behavior

Keep this implementation small and isolated.

---

## 16. Acceptance Criteria

The task is complete when:

- CTRL + Left Click on the World Map creates a custom marker
- the clicked map location is correctly converted to world X/Z coordinates
- only one custom marker exists at a time
- placing a new marker replaces the previous one
- the marker appears on the World Map
- the marker appears on the minimap
- marker position remains correct after map zoom / pan
- marker does not interfere with existing map controls
- normal left click behavior remains unchanged
- existing waypoint / dungeon / POI interactions still work
- custom marker appears in the existing Legend if present
- there is a simple way to remove the marker
- no server persistence is added unless already trivial
- no multiplayer synchronization is added
- no unrelated refactor is introduced

---

## 17. Testing

Test at minimum:

### Placement

```text
CTRL + Left Click center of map
→ marker appears at expected world location
```

Test several locations:

```text
Forest
Highlands
Snowy Mountains
Southwest Lake
```

### Replacement

```text
place marker A
→ place marker B
→ only B remains
```

### Minimap

Walk toward and away from the marker.

Verify:

- position updates correctly
- direction is correct
- no mirrored X/Z issue
- no incorrect rotation

### Zoom

```text
place marker
→ zoom in
→ zoom out
```

Marker must remain attached to the same world location.

### Existing Interactions

Verify:

```text
left click waypoint
left click dungeon marker
hover normal marker
open Legend
zoom controls
```

still work normally.

### Removal

Verify the chosen removal interaction works and clears the marker from:

```text
World Map
Minimap
```

---

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current World Map and minimap implementation before changing anything.
3. Identify the exact files responsible for:
   - World Map input handling
   - World Map coordinate conversion
   - World Map marker rendering
   - minimap marker rendering
   - map zoom / pan transforms
   - current client state / Zustand stores
   - existing Legend
4. Reuse existing world↔map coordinate helpers.
5. Add a single personal custom marker state.
6. CTRL + Left Click should place / replace the marker.
7. Store the marker as world X/Z coordinates, not raw UI pixels.
8. Render the same marker on World Map and minimap.
9. Preserve map zoom / pan correctness.
10. Add the marker type to the existing Legend.
11. Add a small removal interaction using the cleanest existing input pattern.
12. Keep it client-side for MVP.
13. Do not synchronize through Colyseus or Meteor.
14. Do not add multiple marker support yet.
15. Do not add a new dependency.
16. Use JavaScript only.
17. Do not perform unrelated refactors.
18. Run relevant checks.
19. Test Forest, Highlands, Snowy Mountains, and Southwest Lake placements.
20. In the final response, list every changed file with its exact path.
21. Also summarize:
    - where custom marker state is stored
    - how map-click coordinates convert to world coordinates
    - how removal works
    - how the marker is rendered on the minimap
22. If the current map implementation differs from assumptions in this spec, adapt to the existing architecture instead of introducing a parallel map system.
