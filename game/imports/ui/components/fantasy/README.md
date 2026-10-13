# Fantasy UI foundation and gameplay surfaces (spec 99, Tasks 1–6)

`game/client/fantasy-ui.css` defines the shared material, color, focus, button,
badge, and modal styles. It loads after the existing stylesheet and only styles
surfaces that adopt the `fantasy-*` classes. Existing fonts stay unchanged.

Import primitives from `./FantasyUI`:

```jsx
<FantasyPanel className="p-4">
  <FantasySectionHeader>Objectives</FantasySectionHeader>
  <p>Find the missing scout.</p>
  <FantasyDivider />
  <FantasyBadge tone="success">Complete</FantasyBadge>
  <FantasyButton variant="primary" onClick={onComplete}>Complete Quest</FantasyButton>
</FantasyPanel>

<FantasyHudCard>
  <FantasySectionHeader>World Event</FantasySectionHeader>
  <p>The northern watch</p>
  <p className="fantasy-muted">Defeat the raiders: 2 / 5</p>
</FantasyHudCard>
```

Buttons support `primary`, `secondary`, `danger`, and `ghost`, plus native button
props. Badges support `neutral`, `success`, `warning`, `danger`, and `magic`.
Use words alongside status colors. `FantasyPanel` and `FantasySectionHeader`
accept an `as` element to preserve heading/section semantics.

`FantasyModalFrame` is a presentation shell. Use `HudModal` for existing HUD
windows; it retains its Zustand state, dragging, stacking, and mobile orientation
handling. Use the existing native-dialog convention for native modals, with
`fantasy-dialog` on the dialog and `FantasyModalFrame` inside it. The caller owns
opening, focus, Escape, backdrop dismissal, and async behavior. Preserve existing
scroll/overflow options for inventory tooltips and other floating content.

`HudModal` and `AccountModal` adopt the shared frame. Help is the initial in-game
example for panels, cards, section headings, buttons, and badges. Check Help at
desktop and mobile sizes, plus account forms, when doing visual review. Mobile
uses wrapping buttons, 44px tap targets, and the existing scrollable modal layout.

The gameplay HUD uses `FantasyHudCard`, `FantasyButton`, `FantasyKey`, and
`FantasyMeter` for controls, trackers, interaction prompts, and HP/XP displays.
Meters receive the existing calculated percentage and expose a labelled progress
bar. `tone="health"`, `"danger"`, and `"magic"` select the shared fill colors.
`fantasy-tooltip` styles the existing DaisyUI tooltips without changing activation.

`FantasyNotice` supports `neutral`, `reward`, `success`, `warning`, `danger`, and
`magic` tones. Loot, quest progress/finished/rewards, level-up, boss warnings, and
achievement notices share a noninteractive `FantasyNotificationStack` in the HUD.
Their existing stores and independent dismissal timers remain with each component.
Mobile arranges simultaneous notices into two columns and limits the expanded
objective list's height so it can scroll above the action controls.

The existing Hero tabs (Gear, Quests, Achievements, Skills and Talents) adopt the
shared panels, headings, buttons and badges. `fantasy-tabs`, `fantasy-stack`,
`fantasy-section`, `fantasy-slot`, `fantasy-choice` and `fantasy-input` provide
compact navigation, spacing and selected/disabled states using the shared tokens.
Hero retains its existing tab store, equipment dragging and action handlers.
`NpcQuestCard` accepts `fantasy` (default `false`); Hero and NPC quest cards opt in.
`InventoryDropTarget` and `InventoryMoveFeedback` also accept `fantasy` for Gear
and opted-in inventory views; callers keep their existing actions.

Inventory and Crafting remain in Items; Character Overview remains in character
selection. They now use the same fantasy surfaces, actions, headers, badges and
spacing as Hero. Player Inventory opts into `fantasy-inventory` and passes the
`fantasy` option to its slots, drop targets, feedback, money display and item
inspection. Merchant Inventory opts in only when embedded in the NPC Sell screen
and keeps its existing actions. The character screen keeps its existing selection,
creator, deletion, Join World and equipment preview behavior. Portrait HUD modals
use a constrained placement grid row so tall Inventory content stays centered and
scrollable.

Task 4 migrates NPC dialogue, quest offers and turn-ins, Shop, Sell, and sale
confirmation to the same frame, panels, headings, badges, buttons, and spacing.
`NpcQuestPanel` and `InventoryModal` keep their default styling boundaries and
opt in inside NPC screens. Quest request handlers, merchant calls, and modal
back/close behavior remain with their existing owners.

Task 5 applies the shared palette and components to the minimap frame, legend,
mobile label hint, world map controls, markers, labels, and travel confirmation.
`fantasy-minimap` and `fantasy-map-*` CSS classes scope the presentation. Marker
positions and collision offsets, quest state, zoom/pan, custom marker placement,
waypoint travel, and desktop hover versus mobile tap behavior remain in their
existing components. The mobile hint reflects the current label state.

Task 6 brings Chat, group and guild panels, player actions, invitations, the death
screen, and the mobile joystick into the same palette. The standalone feedback
and analytics dialogs use the shared modal frame, and guild disband uses a shared
confirmation panel. Mobile gameplay panels constrain their widths and scroll areas;
compact landscape screens shorten the Chat log and Group list while retaining
scrolling and 44px Chat controls. On short screens, the minimap lens and player
bars fit between the action controls and Chat. The existing input and interaction
handlers stay in their owning components.

The pre-game Character Creator and Auth form controls use the shared panels,
headings, badges, buttons, inputs, and modal frame. The creator keeps its wizard,
appearance preview, and character data flow; the preview takes the larger desktop
column while the mobile controls scroll beneath it. Auth retains its login,
registration, validation, and account transfer flows. The Loading Screen, onboarding
tour card, and portrait rotation prompt also use the shared palette and controls;
their loading state, tour progression, and visibility behavior remain unchanged.
Shared Quest/Inventory components keep their non-fantasy defaults for callers
outside opted-in screens.
