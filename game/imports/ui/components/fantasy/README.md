# Fantasy UI foundation (spec 99, Task 1)

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

Later passes still need to migrate the main HUD, notifications, Hero/Items content,
NPC/quest/merchant content, minimap/world-map details, and standalone feedback and
analytics dialogs. The shared HUD frame is in place; their content layouts are
unchanged. Full visual review belongs after those migrations.
