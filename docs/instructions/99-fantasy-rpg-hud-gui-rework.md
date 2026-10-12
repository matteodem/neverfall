# Fantasy RPG HUD / GUI Rework

## Goal

Redesign Neverfall's HUD and GUI so the game consistently feels like a polished fantasy RPG instead of a collection of lightly styled web UI elements.

This is a visual/system refactor only. Preserve existing gameplay behavior, data flow, interactions, and responsive functionality.

## Visual Direction

Target:

- dark fantasy RPG
- stylized, readable, slightly magical
- subtle carved/metal/stone framing
- restrained bronze/gold accents
- parchment-like secondary surfaces where useful
- soft glow for active/important states
- strong contrast and legibility
- suitable for Neverfall's low-poly fantasy world

Avoid:

- generic SaaS/dashboard styling
- overly flat DaisyUI defaults
- heavy gradients everywhere
- excessive glow
- cartoonish WoW imitation
- overly ornate borders that reduce readability
- UI that feels like a website instead of a game

## Design Principles

1. Reuse a small set of shared fantasy UI primitives.
2. Keep hierarchy obvious at a glance.
3. HUD should stay compact and not hide gameplay.
4. Modals should feel like part of the same game.
5. Mobile must remain usable and uncluttered.
6. Styling changes should not alter gameplay behavior.
7. Prefer CSS/Tailwind/shared components over duplicated per-screen styling.

## Shared UI Primitives

Create or refactor reusable components/tokens such as:

```text
FantasyPanel
FantasyButton
FantasyModal
FantasySectionHeader
FantasyHudCard
FantasyDivider
FantasyBadge
FantasyTooltip
```

Exact names may follow existing conventions.

### FantasyPanel

Use for Hero Panel sections, quest panels, Shop/Sell panels, inventory sections, and modal bodies.

Suggested visual treatment:

- dark semi-opaque background
- subtle inner shadow
- thin bronze/gold border
- slightly textured or layered appearance
- modest corner treatment
- readable spacing

### FantasyButton

Use for primary actions, quest accept/complete, shop actions, modal actions, and Track Quest.

Variants:

```text
primary
secondary
danger
ghost
```

Buttons should have clear hover, active, disabled, keyboard-focus, and mobile tap states.

### FantasyModal

All major modal windows should share:

- consistent backdrop
- consistent frame
- consistent title/header
- consistent close button
- responsive max width / max height
- internal scrolling instead of overflowing the viewport

## Color / Material Direction

Create reusable tokens/classes for:

```text
panel background
panel border
primary accent
secondary accent
text primary
text muted
success
warning
danger
magic highlight
```

Suggested direction:

- charcoal / deep brown / near-black base
- bronze / antique gold borders
- warm ivory text
- desaturated green for success
- muted red for danger
- cool blue/purple for magical states

Keep contrast accessible.

## Typography

Keep existing fonts unless a suitable fantasy font is already included or easy to add without unnecessary weight.

Use a clear hierarchy for HUD titles, section titles, body text, muted metadata, and buttons. Fantasy feel should come mostly from framing, spacing, and accents rather than unreadable decorative fonts.

## Task 1 — Build the Shared Fantasy UI System

First create the shared visual foundation.

### Required

- Shared color/tone tokens
- Shared panel styling
- Shared button variants
- Shared modal shell
- Shared HUD card style
- Shared section header
- Shared badge/status style

Do not migrate every screen yet.

### Acceptance

- Components are reusable.
- Existing UI can adopt them incrementally.
- No gameplay behavior changes.
- Desktop and mobile examples render correctly.

## Task 2 — Rework the Main HUD

Migrate the core gameplay HUD to the fantasy style.

### Include

- Action bar / skill buttons
- HP / resource display
- World Event HUD
- Tracked Quest HUD
- interaction prompts
- loot / quest progress notifications
- quest finished notifications

### Action Bar

Improve button frames, cooldown presentation, key labels, active/disabled states, and hover feedback while keeping existing bindings and behavior.

### World Event / Tracked Quest HUD

Use the same visual language and keep both compact.

Suggested hierarchy:

```text
small header
important title
one short progress line
optional status
```

### Notifications

Use one coherent visual system for loot received, quest progress, quest finished, level up, and errors/warnings. Avoid large blocking notifications.

## Task 3 — Rework Hero Panel

Apply the design system to Character/overview, Gear, Inventory, Quests, and existing tabs.

Goals:

- game-like tab navigation
- shared section headers/panels
- cleaner spacing and information hierarchy
- easy-to-find Track Quest / Equip / Unequip / Use actions
- preserve current data and behavior

Do not redesign feature architecture.

## Task 4 — Rework NPC / Quest / Merchant Modals

Apply the shared modal system to NPC dialogue, quest offer/turn-in, Shop, Sell, and related confirmations.

Quest modals should clearly separate title, description, objectives, rewards, status, and actions. Merchant UI should feel visually related to NPC dialogue while remaining easy to scan.

## Task 5 — Minimap / World Map UI Polish

Do not redesign map logic. Improve only visual presentation of the minimap frame, legend, marker labels, controls, tooltip/hover states, and mobile label-toggle hint.

Markers must remain readable and functional, and the map itself should remain dominant.

## Task 6 — Mobile / Responsive Pass

After desktop migration, do a dedicated mobile cleanup.

Verify:

- HUD elements do not overlap
- action bar remains usable
- minimap sits above buttons
- modal content fits viewport
- modal bodies scroll correctly
- tap targets are large enough
- long quest text wraps correctly
- Hero Panel tabs remain usable
- buttons do not overflow
- no horizontal scrolling

Do not simply scale desktop UI down; prefer responsive layout changes.

## Suggested Implementation Order

```text
1. Shared Fantasy UI system
2. Main HUD migration
3. Hero Panel migration
4. NPC / Quest / Merchant modals
5. Minimap / World Map polish
6. Mobile responsive cleanup
```

Do not attempt the entire UI rework in one implementation pass.

## Architecture Requirements

- Read `AGENTS.md`.
- Inspect existing React / Tailwind / DaisyUI patterns.
- Prefer shared components and tokens over duplicated styles.
- Reuse existing UI state.
- Do not move gameplay logic into presentation components.
- Do not change server APIs.
- Do not change quest, inventory, combat, NPC, or merchant behavior.
- Avoid unrelated refactors.
- Keep exact file paths in implementation reports.

## Existing Features That Must Keep Working

- action bar
- cooldowns
- player HP
- World Event HUD
- tracked Quest HUD
- quest progress toast
- quest completion toast
- level-up notifications
- NPC interaction
- quest accept / turn-in
- Shop / Sell
- Hero Panel
- Gear
- Inventory
- minimap
- world map
- mobile controls

## Acceptance Criteria

The rework is successful when:

- HUD and GUI clearly share one fantasy RPG visual language.
- Generic web/dashboard styling is mostly gone.
- Shared components are used across major screens.
- Main HUD remains compact.
- Modals are visually consistent.
- Hero Panel feels like part of the game.
- Desktop remains readable.
- Mobile remains usable.
- No major gameplay behavior changes.
- Existing interactions and state continue to work.

## Final Visual Review

After all migration tasks:

- compare all major UI screens side-by-side,
- find inconsistent borders/colors/button styles,
- remove remaining default DaisyUI-looking elements where practical,
- verify spacing consistency,
- verify hover/focus/disabled states,
- verify desktop and mobile layouts,
- report any remaining UI elements that still need migration.
