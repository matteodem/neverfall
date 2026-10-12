# Fantasy UI foundation, gameplay HUD and Hero (spec 99, Tasks 1–3)

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
`NpcQuestCard` accepts `fantasy` (default `false`); only Hero quest cards opt in.
`InventoryDropTarget` and `InventoryMoveFeedback` also accept `fantasy` for Gear's
drop outlines and moving-item status; inventory and merchant callers retain their
existing appearance.

Inventory/Crafting remain in Items and Character Overview remains in character
selection. Their content styling is still pending; any shared inventory migration
must opt in only for the player view so merchant content stays unchanged.
Later passes still need to migrate Items/Character Overview content, NPC/quest/merchant content,
minimap/world-map details, and standalone feedback and analytics dialogs. Only the
NPC interaction prompt was changed in its file; NPC modal contents are unchanged.
The achievement modal and toast both use the shared system. Chat, group panels, the death screen,
and the joystick also retain their existing presentation. Full visual review
belongs after the remaining migrations.
