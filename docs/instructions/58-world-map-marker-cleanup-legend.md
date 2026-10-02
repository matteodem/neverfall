# World Map Marker Cleanup + Legend

## Goal

Reduce clutter on the World Map by hiding most marker labels until interaction.

Current problem:
The map currently shows too many labels at the same time, which causes overlap and makes the map difficult to scan.

From the current map, labels such as these overlap heavily:

```text
Northern Camp
Northern Camp · Waypoint
Respawn Point · Unlocked
Northern Ruins · Level 10
Central Camp
Central Camp · Waypoint
Respawn Point · Unlocked
Snowy Mountains · Waypoint
Forest Dungeon · Level 7
Sunken Ruins · Level 15
Tower Jumping Puzzle
```

The goal is to keep the map readable while preserving all existing map functionality.

Use JavaScript only.

## 1. Labels That Should Stay Always Visible

Keep the following labels visible exactly as they are now:

### Region Labels

Examples:

```text
Forest
Forest (Level 1 - 5)
Highlands
Highlands (Level 5 - 10)
Snowy Mountains
Snowy Mountains (Level 10 - 15)
Southwest Lake (Level 15)
```

Do not hide region names behind hover.

### Hunt Labels

All Hunt labels should remain visible.

Examples from the current map:

```text
Boar Hunt
Wolf Hunt
Forest Giant Hunt
Goat Hunt
Rat Hunt
Bee Hunt
Snow Wolf Hunt
Ogre Hunt
Seal Hunt
```

Keep their current visual style unless small positioning changes are required to prevent obvious overlap.

## 2. Hide Labels for Other Marker Types

For all other marker types, render the icon / marker normally but hide the text label by default.

Examples:

```text
Waypoints
Spawn Points
Dungeon Entrances
Camps
Jumping Puzzles
Other POIs / landmarks
```

The marker icon should remain visible at all times.

The text should only appear when the player interacts with the marker.

## 3. Desktop Interaction — Hover

On desktop:

```text
hover marker
→ show marker label
→ move cursor away
→ hide marker label
```

The hover label should appear near the marker without covering the icon.

Suggested behavior:

- small tooltip
- dark semi-transparent background
- readable white text
- small padding
- rounded corners
- high enough z-index to appear above map markers
- no huge panel
- no animation required beyond a subtle fade if already easy to support

Example:

```text
[ waypoint icon ]
      ↓ hover
Northern Camp · Waypoint
```

The tooltip must not affect map layout.

Do not render hidden labels in a way that still reserves space.

## 4. Mobile Interaction — Tap

Mobile does not have hover.

On mobile:

```text
tap marker
→ show its label
```

If another marker is tapped:

```text
old label closes
→ new label opens
```

Tapping the same marker again may close it.

Tapping elsewhere on the map should close the active marker label if practical.

Only one non-Hunt marker label should be open at once.

Do not require long-press.

Do not make marker interaction interfere with normal map scrolling / zooming.

## 5. Marker Click Behavior

If a marker already has an existing click action, preserve it.

Examples may include:

- waypoint travel
- opening a dungeon interaction
- selecting a POI
- showing additional information

If a marker is clickable for gameplay:

### Desktop

```text
hover
→ show label

click
→ perform existing action
```

### Mobile

For markers with a meaningful action, use the smallest clean UX solution that preserves both label visibility and the action.

Preferred behavior:

```text
first tap
→ show label / select marker

second tap
→ perform existing action
```

If the existing map architecture already has a better mobile selection pattern, reuse it.

Do not remove existing waypoint / dungeon / POI interactions.

## 6. Add a Map Legend

Add a compact **Legend** to the World Map.

The Legend should explain what the marker icons mean.

It should not permanently consume a large part of the map.

Preferred UI:

```text
Legend
```

as a small button or collapsible panel inside the map UI.

On click / tap:

```text
Legend
────────────
[icon] Waypoint
[icon] Spawn Point
[icon] Dungeon
[icon] Camp
[icon] Hunt
[icon] Jumping Puzzle
[icon] Boss / Special POI
```

Only include marker categories that actually exist in the current repository.

Do not invent marker types.

Use the **same marker icon / visual** that is already used on the map.

The Legend should make it possible to understand the map without showing every label permanently.

## 7. Legend Placement

Place the Legend somewhere that does not cover important map content.

Good options:

```text
bottom-left
bottom-right
top-left below map controls
```

Avoid the current zoom controls.

Keep the Legend compact.

If expanded, it may overlay the map rather than resizing it.

Suggested behavior:

```text
Legend ▾
```

collapsed by default.

Expanded:

```text
Legend ▴

● Waypoint
✚ Spawn Point
● Dungeon
● Camp
● Hunt
● Jumping Puzzle
```

Use the project's real marker components / icons instead of these placeholder symbols.

## 8. Marker Categories

Inspect the current map marker implementation and centralize marker display behavior by marker type where practical.

Conceptually:

```js
{
  type: "waypoint",
  icon: ...,
  label: "Northern Camp · Waypoint",
  alwaysShowLabel: false,
}
```

```js
{
  type: "hunt",
  icon: ...,
  label: "Goat Hunt",
  alwaysShowLabel: true,
}
```

```js
{
  type: "region",
  label: "Highlands (Level 5 - 10)",
  alwaysShowLabel: true,
}
```

Do not copy this schema blindly if the project already has map marker configs.

Reuse and extend the existing structure.

## 9. Always-Visible vs Interactive Labels

Final intended behavior:

| Marker Type | Label Default | Desktop | Mobile |
|---|---|---|---|
| Region | Visible | Visible | Visible |
| Hunt | Visible | Visible | Visible |
| Waypoint | Hidden | Hover | Tap |
| Spawn Point | Hidden | Hover | Tap |
| Dungeon | Hidden | Hover | Tap |
| Camp | Hidden | Hover | Tap |
| Jumping Puzzle | Hidden | Hover | Tap |
| Other POI | Hidden | Hover | Tap |

If the repository has additional marker categories, classify them sensibly.

Only **Regions and Hunts** should remain permanently labeled unless an existing gameplay requirement clearly requires otherwise.

## 10. Label Positioning

Tooltip labels should remain readable near map edges.

Avoid clipping outside the map container.

If a marker is close to:

```text
left edge
right edge
top edge
bottom edge
```

flip / offset the tooltip so it stays inside the visible map area where practical.

Do not add a complex positioning library for this.

Keep the implementation lightweight.

## 11. Visual Style

Match the current map UI.

Suggested tooltip style:

```text
small
compact
dark background
light text
slight transparency
rounded corners
short label only
```

Avoid oversized tooltips.

Example:

```text
Northern Ruins · Level 10
```

Do not show unnecessary descriptions in hover labels.

The goal is map readability, not a detailed POI info system.

## 12. Preserve Existing Map Features

Do not break:

- zoom controls
- World Map modal
- map scaling
- mobile layout
- Hunts
- waypoint unlocking
- waypoint fast travel
- spawn point state
- dungeon markers
- dungeon interaction
- jumping puzzle marker
- region labels
- player marker if present
- map positioning
- existing map data

This task is primarily a **UI / interaction cleanup**.

Do not rewrite the World Map architecture unless necessary.

## 13. Mobile Usability

Make sure marker tap targets are large enough to use on mobile.

The visible icon does not need to become much larger, but the effective hit area can be slightly larger.

Aim for roughly:

```text
~32–44px effective tap target
```

where practical.

Do not allow overlapping invisible hit areas to make nearby markers impossible to select.

## 14. Acceptance Criteria

The task is complete when:

- Region labels remain visible.
- Hunt labels remain visible.
- Waypoint labels are hidden by default.
- Spawn Point labels are hidden by default.
- Dungeon labels are hidden by default.
- Camp labels are hidden by default.
- Jumping Puzzle labels are hidden by default.
- Other normal POI labels are hidden by default.
- Desktop hover shows the correct hidden marker label.
- Leaving the marker hides the tooltip.
- Mobile tap shows the marker label.
- Only one interactive marker label is open at once on mobile.
- Existing marker click actions still work.
- Waypoint travel is not broken.
- Dungeon interaction is not broken.
- The map contains a compact Legend.
- The Legend uses the real current map marker icons.
- The Legend only lists marker types that actually exist.
- Tooltip labels do not permanently clutter the map.
- Map zoom still works.
- Desktop and mobile map layouts still work.

## 15. Testing

Test at minimum:

### Desktop

Verify hover behavior for:

```text
Central Camp Waypoint
Northern Camp Waypoint
Snowy Mountains Waypoint
Lake Waypoint
Central Camp Respawn Point
Northern Camp Respawn Point
Forest Dungeon
Northern Ruins
Sunken Ruins
Tower Jumping Puzzle
```

Verify:

- icon remains visible
- label only appears on hover
- existing marker action still works
- tooltip is not clipped

### Hunts

Verify Hunt labels remain always visible:

```text
Boar Hunt
Wolf Hunt
Goat Hunt
Rat Hunt
Bee Hunt
Forest Giant Hunt
Snow Wolf Hunt
Ogre Hunt
Seal Hunt
```

Use only the Hunts that actually still exist in the repository.

### Regions

Verify region labels remain visible.

### Mobile

Test:

```text
tap marker
→ label opens

tap different marker
→ previous closes
→ new opens

tap map background
→ active label closes
```

Also verify waypoint / dungeon interactions still work after introducing tap-to-label behavior.

### Legend

Verify:

- Legend opens / closes
- icons match real map markers
- labels are understandable
- panel does not block zoom controls
- panel remains usable on mobile

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the existing World Map implementation before editing anything.
3. Identify the exact files responsible for:
   - World Map rendering
   - marker data
   - marker icons
   - marker labels
   - waypoint markers
   - spawn point markers
   - dungeon markers
   - Hunt markers
   - region labels
   - jumping puzzle / POI markers
   - mobile map interaction
4. Preserve the existing map architecture.
5. Keep Region and Hunt labels always visible.
6. Hide all other marker labels by default.
7. Add desktop hover tooltips for hidden labels.
8. Add mobile tap-to-show behavior.
9. Ensure only one interactive marker tooltip is active at once on mobile.
10. Preserve all existing marker actions.
11. Add a compact collapsible Legend using the project's existing marker icons.
12. Do not create a second duplicate set of marker icon definitions if reusable map marker config already exists.
13. Keep the implementation lightweight and MVP-sized.
14. Use JavaScript only.
15. Do not add unnecessary dependencies.
16. Run relevant checks after implementation.
17. Test both desktop and mobile behavior.
18. In the final response, list every changed file with its exact path.
19. Also summarize:
    - which marker types remain always labeled
    - which marker types now use hover / tap labels
    - which marker types appear in the Legend
20. If the current marker architecture differs from the assumptions in this spec, adapt the implementation to the existing architecture instead of forcing a large refactor.
