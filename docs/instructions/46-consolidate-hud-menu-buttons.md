# Consolidate HUD Menu Buttons

## Goal

Reduce HUD clutter by grouping related content into fewer buttons and using tabs where a modal contains multiple sections.

Reuse the existing modal content and feature logic wherever possible.

## New HUD Buttons

Use these 5 HUD buttons:

```text
Settings
Items
Hero
Map
Help
```

## Items

`Items` is the umbrella section for item-related actions.

Tabs:

- Inventory
- Shop

Default tab:

```text
Inventory
```

Existing shortcuts:

```text
I → Items / Inventory
B → Items / Shop
```

## Hero

`Hero` contains character progression and character-specific systems.

Tabs:

- Gear
- Quests
- Achievements
- Talents

Default tab:

```text
Gear
```

Existing shortcuts:

```text
G → Hero / Gear
Q → Hero / Quests
Z → Hero / Achievements
```

Talents does not need a shortcut for now unless one already exists.

## Settings

Keep Settings as its own button and modal.

No tabs are needed.

## Map

Keep Map as its own button and modal.

Shortcut:

```text
M
```

No tabs are needed.

## Help

Keep Help as its own button and modal.

No tabs are needed.

## Tabs

Use DaisyUI tabs or the existing project UI patterns.

Requirements:

- only use tabs when a modal contains more than one section
- switching tabs must not close the modal
- active tab should be visually clear
- existing content components should be reused

## Keyboard Shortcuts

Existing shortcuts should still work.

When a shortcut is pressed:

```text
I → open Items and select Inventory
B → open Items and select Shop

G → open Hero and select Gear
Q → open Hero and select Quests
Z → open Hero and select Achievements

M → open Map
```

Do not trigger shortcuts while typing in chat or another text input.

## Important

This should primarily be a navigation / UI refactor.

Do not rewrite the underlying systems for:

- Inventory
- Shop
- Gear
- Quests
- Achievements
- Talents
- Settings
- Map
- Help

## Acceptance Criteria

- HUD shows only 5 buttons: Settings, Items, Hero, Map, Help.
- Items contains Inventory and Shop tabs.
- Hero contains Gear, Quests, Achievements, and Talents tabs.
- Settings, Map, and Help remain standalone.
- Existing shortcuts open the correct modal and tab.
- Existing modal content and feature behavior continue to work.
- HUD is noticeably less cluttered.

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current HUD button config, modal state, keyboard shortcuts, and existing modal components.
3. Reuse existing content components instead of rebuilding them.
4. Add tabs only to Items and Hero.
5. Preserve existing keyboard shortcuts.
6. Keep the implementation small and DRY.
7. Use JavaScript only.
8. Avoid unrelated refactors.
9. Run relevant checks after implementation.
10. In the final response, list every changed file with its exact path.
