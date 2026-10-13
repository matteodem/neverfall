# Fantasy UI foundation, gameplay HUD, Hero and NPC screens (spec 99, Tasks 1–4)

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
`InventoryDropTarget` and `InventoryMoveFeedback` also accept `fantasy` for Gear's
drop outlines and moving-item status; inventory and merchant callers retain their
existing appearance.

Inventory and Crafting remain in Items; Character Overview remains in character
selection. They now use the same fantasy surfaces, actions, headers, badges and
spacing as Hero. Player Inventory opts into `fantasy-inventory` and passes the
`fantasy` option to its slots, drop targets, feedback, money display and item
inspection. Merchant Inventory opts in only when embedded in the NPC Sell screen
and keeps its existing actions. The character screen keeps its existing selection,
creator, deletion,
Join World and equipment preview behavior. Portrait HUD modals use a constrained
placement grid row so tall Inventory content stays centered and scrollable.

Task 4 migrates NPC dialogue, quest offers and turn-ins, Shop, Sell, and sale
confirmation to the same frame, panels, headings, badges, buttons, and spacing.
`NpcQuestPanel` and `InventoryModal` keep their default styling boundaries and
opt in inside NPC screens. Quest request handlers, merchant calls, and modal
back/close behavior remain with their existing owners. Later passes still need
minimap/world-map details and standalone feedback and analytics dialogs.
The achievement modal and toast both use the shared system. Chat, group panels, the death screen,
and the joystick also retain their existing presentation. Full visual review
belongs after the remaining migrations.
